import React, {useState} from 'react'
import GenresButton from './GenresButton'
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries/queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [currentGenre, setGenre] = useState('')
  if (result.loading)  {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  const BooksByGenre = () => {
    const books = result.data.allBooks
    if (!currentGenre) {
      return books.map(a =>
        <tr key={a.title}>
          <td>{a.title}</td>
          <td>{a.author.name}</td>
          <td>{a.published}</td>
        </tr>
      )
    }
    return books.filter(book => book.genres.includes(currentGenre))
                .map(a =>         
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>)
  }

  return (
    <div>
      <h2>books</h2>
      <h3>Current Chosen Genre is: {currentGenre ? currentGenre : 'None'}</h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          <BooksByGenre/>
        </tbody>
      </table>
      <h2>Choose Genre to Filter By</h2>
      <GenresButton allBooks={result.data.allBooks} setGenre={setGenre}/>
    </div>
  )
}

export default Books