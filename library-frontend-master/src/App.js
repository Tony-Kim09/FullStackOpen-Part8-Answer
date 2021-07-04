import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import RecommendedBooks from './components/RecommendedBooks'
import { useApolloClient, useSubscription } from '@apollo/client'
import { GET_USER, FAV_GENRE, BOOK_ADDED, ALL_BOOKS } from './queries/queries'
const App = () => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [page, setPage] = useState('authors')
  const client = useApolloClient()

  const getUserAndFav = async () => {
    const result = await client.query({
      query: GET_USER, 
    })

    const favorite = await client.query({
      query: FAV_GENRE,
      variables: { genre: result.data.me.favoriteGenre}
    })
    setRecommendedBooks(favorite.data.allBooks)
    setUser(result.data.me)
  }

  useEffect(()=> {
    const tokenExists = localStorage.getItem('library-user-token')
    if (tokenExists){
      setToken(tokenExists)
      getUserAndFav()
    }
  }, [token])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(p => p.title).includes(object.title)  
    const dataInStore = client.readQuery({ query: ALL_BOOKS })

    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }   
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`${addedBook.author.name} added`)
      updateCacheWith(addedBook)
    }
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ?
          <div>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>Logout</button>
          </div>
          : 
          <div>          
            <button onClick={() => setPage('login')}>login</button>
          </div>
        }
      </div>
      <Authors
        show={page === 'authors'}
      />
      <Books
        show={page === 'books'}
      />
      <LoginForm
        show={page === 'login'}
        setToken={setToken}
      />
      <NewBook
        show={page === 'add'}
        updateCacheWith={updateCacheWith}
      />
      <RecommendedBooks
        show={page === 'recommend'}
        recommendedBooks={recommendedBooks}
        user={user}
      />
    </div>
  )
}

export default App