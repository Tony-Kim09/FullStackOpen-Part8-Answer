import React from 'react'

const GenresButton = ({allBooks, setGenre}) => {
  let genres = []

  const allGenres = allBooks.map(book => book.genres)

  for (const genresPerUser of allGenres){
    for (const genre of genresPerUser){
      if(genres.includes(genre)){
        continue
      }
      genres.push(genre)
    }
  }

  return (
    <div>
      {genres.map(genre => 
          <button key={genre} onClick={() => setGenre(genre)}>{genre}</button>
      )}
    </div>
  )
}

export default GenresButton