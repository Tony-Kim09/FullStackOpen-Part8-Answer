const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(name: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation{
    addBook(
      title: String!
      name: String!
      born: Int
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
` 

const resolvers = {
  Author: {
    bookCount: async (root) =>  {
      return await Book.find({ author: root._id }).countDocuments()
    }
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({}),
    allBooks: async (root, args) => {
        if (!args.name && !args.genre){
          return await Book.find({}).populate('author', {name: 1, born: 1})
        }
        if (!args.name){
          return await Book.find({ genres: { $in:args.genre}}).populate('author', {name: 1, born: 1})
        } else if (!args.genre){
          const author = await Author.findOne({ name: args.name })
          if (author === null) { 
            throw new UserInputError('Author not found')
          }
          const books = await Book.find({author: author._id}).populate('author', {name: 1, born: 1, bookCount: 1})
          return books
        } else {
          const author = await Author.findOne({ name: args.name })
          if (author === null) { 
            throw new UserInputError('Author not found')
          }
          const books = await Book.find({author: author._id, genres: { $in: args.genre }}).populate('author', {name: 1, born: 1, bookCount: 1})
          return books
        }
      },
    me: (root, args, context) => {
      return context.currentUser
      }
    },
    Subscription: {
      bookAdded: {
        subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
      }
    },
    Mutation: {
      addBook: async (root, args, context) =>  {
        const currentUser = context.currentUser

        if(!currentUser) {
          throw new AuthenticationError("not authenticated")
        }

        const existingBook = await Book.findOne({title: args.title})
        let author = await Author.findOne({ name: args.name})

        if (existingBook){
          throw new UserInputError('This book already exists', {
            invalidArgs: args.title,
          })
        }

        if(!author){
          try{
          author = new Author({name: args.name})
          await author.save()
          } catch (error){
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          }
        }
        const newBook = new Book({...args, author: author._id})
        await newBook.save()

        const addedBookDetails = await Book.findOne({title: args.title, author: author._id}).populate('author', {name: 1, born: 1})
        pubsub.publish('BOOK_ADDED', {bookAdded: addedBookDetails})
        return addedBookDetails
      },
      editAuthor: async (root, args, context) => {
        const currentUser = context.currentUser

        if(!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
        
        const author = await Author.findOne({name: args.name})
        if (!author){
          return new UserInputError('Author does not exist', {
            invalidArgs: args.name,
          })
        }
        const updatedAuthor = { name: author.name, id: author._id, born: args.setBornTo }
        await Author.findByIdAndUpdate(author._id, updatedAuthor, { new: true})
        return updatedAuthor
      },
      createUser: (root, args) => {
        const user = new User({username: args.username, favoriteGenre: args.favoriteGenre})
        return user.save()
                    .catch(error => {
                      throw new UserInputError(error.message, {
                        invalidArgs: args,
                      })
                    })
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
        
        if ( !user || args.password !== 'password' ) {
          throw new UserInputError("wrong credentials")
        }
        
        const userForToken = {
          username: user.username,
          id: user._id,
        }
        return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')){
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser}
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})