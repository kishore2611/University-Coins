const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

let eventSchema = new Schema(
  {
    eventPicture: [],
    eventName: {
      type: String,
      default: null,
    },
    eventDate: {
      type: String,
      default: null,
    },
    eventTime: {
      type: String,
      default: null,
    },
    eventDiscription: {
      type: String,
      default: null,
    },
    favourite:{
      type: Number,
      default: 0
    },
    favouriteEvents: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    eventLocation: {
      location: {
        type: String,
        default: null,
      },
      type: {
        type: String,
        enum: ["Point"],
        required: false,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    // points: {
    //   type: Number,
    //   default: null
    // }
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
