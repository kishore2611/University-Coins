const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let adminSchema = new Schema(
  {
    userName:{
        type: String,
        default: null
    },
    email: {
      type: String,
      unique: true,
      match: [
        /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    verification_code: {
      type: Number,
      default: null,
    },
    is_notification: {
      type: Number,
      default: 1,
    },
    is_blocked: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "admin",
    },
    user_authentication: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
