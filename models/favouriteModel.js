const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require('moment')

let favouriteSchema = new Schema(
  {
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // admin_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Admin"
    // },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    }
  },
  {
    timestamps: true,
  }
);

const Favourite = mongoose.model("Favourite", favouriteSchema);
module.exports = Favourite;
