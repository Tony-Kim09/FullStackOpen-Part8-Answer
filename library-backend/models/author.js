const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: [4, "Minimum of 4 characters required"]
  },
  born: {
    type: Number,
  },
})

module.exports = mongoose.model('Author', schema)