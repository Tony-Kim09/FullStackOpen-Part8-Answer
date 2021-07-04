import React from 'react'

const RecommendedBooks = ({show, recommendedBooks, user}) => {

  if (!show){
    return null
  }
  if (!recommendedBooks){
    return (
      <div>
        Nothing yet!
      </div>
    )
  }
  return (
    <div>
      <h2>Your Recommended book by genre: {user.favoriteGenre}</h2>
      { 
        recommendedBooks.map(book => {
          return  <div key={book._id}>
                    <b>Title: </b>{book.title} <b>Author: </b>{book.name}, <b>Published: </b>{book.published} <br/>
                    <br/>
                 </div>
        })
      }
    </div>
  )
}

export default RecommendedBooks