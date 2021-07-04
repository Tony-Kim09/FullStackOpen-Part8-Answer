const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
      type: String,
      required: [true, "Username required"],
      minlength: [3, "Minimum of 3 characters required"],
      unique: true
  },
  favoriteGenre: {
    type: String,
    required: [true, "favorite genre required"]
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;