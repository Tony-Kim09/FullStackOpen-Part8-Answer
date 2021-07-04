import { ALL_AUTHORS, EDIT_YEAR } from '../queries/queries'
import { useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import Select from 'react-select'

const Authors = (props) => {
  const [yearBorn, setYearBorn] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [ editAuthorYear ] = useMutation(EDIT_YEAR,{ 
    refetchQueries: [{ query: ALL_AUTHORS}],
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })
  const authorsResult = useQuery(ALL_AUTHORS)
  if (authorsResult.loading){
    return <div>Loading...</div>
  } 
  if (!props.show) {
    return null
  }
  const authors = authorsResult.data.allAuthors
  const options = authors.map((author) => {
    return { value: author.name, label: author.name }
  })

  const changeYearBorn = async (event) => {
    event.preventDefault()
    editAuthorYear({variables: {name: selectedOption.value, setBornTo: Number(yearBorn)}})
    setYearBorn('')
    setSelectedOption(null)
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {
          authorsResult.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )
          }
        </tbody>
      </table>
      <h2>Edit Author's birth</h2>
      <form onSubmit={changeYearBorn}>
        <div>
          Author name
          <Select
            value={selectedOption}
            onChange={setSelectedOption}
            options={options}/>
        </div>
        <div>
          Year Born
          <input
            value={yearBorn}
            onChange={({target}) => setYearBorn(target.value)}/>
        </div>
        <button type='submit'>Change</button>
      </form>
    </div>
  )
}

export default Authors
