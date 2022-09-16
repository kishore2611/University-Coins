const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const moment = require("moment");

let pointSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    points: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Point = mongoose.model("Point", pointSchema);
module.exports = Point;
