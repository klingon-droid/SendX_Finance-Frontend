//write a user model for the database. it has two fields, username and balance.
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: String,
  balance: Number,
  twitterId: String,
});

const User = mongoose.model("User", UserSchema);

export default User;

