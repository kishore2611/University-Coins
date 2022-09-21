const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const moment = require("moment");

let tarSchema = new Schema(
  {
    tarLocation: {
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
    radius: {
      type: Number,
      default: 0.5,
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

const Tar = mongoose.model("Tar", tarSchema);
module.exports = Tar;
