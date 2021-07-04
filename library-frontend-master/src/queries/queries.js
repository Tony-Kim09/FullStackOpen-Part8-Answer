import { gql } from '@apollo/client'

export const ALL_BOOKS = gql`
  query {
    allBooks  {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const GET_USER = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

export const FAV_GENRE = gql`
  query favGenre ($genre: String!){
    allBooks(genre: $genre){
      title
      author{
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $name: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      name: $name,
      published: $published,
      genres: $genres
    ) {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`

export const EDIT_YEAR = gql`
  mutation editAuthorYear($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ){
      name
      born
    }
  }
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
export const BOOK_ADDED = gql`
  subscription{
    bookAdded{
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }
`