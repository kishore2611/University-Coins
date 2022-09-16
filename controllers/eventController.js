const Event = require("../models/eventModel");
const User = require("../models/userModel");
const moment = require("moment");
const Favourite = require("../models/favouriteModel");
const Point = require("../models/pointModel");

const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    const user = await User.findOne({ _id: req.user._id });

    // console.log(events)

    if (!events) {
      return res.status(400).send({
        status: 0,
        message: "No events found",
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "Events",
        user: user.userName,
        events: events,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const currentEvents = async (req, res) => {
  try {
    var newdate = moment(Date.now()).format("dddd, YYYY Do MMM");

    // console.log(newdate);

    const current = await Event.find({
      eventDate: newdate,
    });
    // console.log(current.eventName);

    if (current.length < 1) {
      return res.status(400).send({
        status: 0,
        message: "no events",
      });
    } else {
      // for(var i = 0; i < current.length; i++) {
      //     var event = current[i];
      // }

      //   var event = [];
      //   for (var i = 0; i < current.length; i++) {
      //     event.push(current[i].eventName, current[i].eventTime, current[i].eventDate, current[i].location.location);
      //   }
      return res.status(200).send({
        status: 1,
        message: "success",
        events: current,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const upcommingEvents = async (req, res) => {
  try {
    var newdate = moment(Date.now()).format("YYYY Do MMM");

    console.log(newdate);

    const current = await Event.find({
      eventDate: { $gt: newdate },
    });
    // console.log(current.eventName);

    if (current.length < 1) {
      return res.status(400).send({
        status: 0,
        message: "no events",
      });
    } else {
      // for(var i = 0; i < current.length; i++) {
      //     var event = current[i];
      // }

      //   var event = [];
      //   for (var i = 0; i < current.length; i++) {
      //     event.push(current[i].eventName, current[i].eventTime, current[i].eventDate, current[i].location.location);
      //   }
      return res.status(200).send({
        status: 1,
        message: "success",
        events: current,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const previousEvents = async (req, res) => {
  try {
    var newdate = moment(await Date.now()).format("dddd, YYYY Do MMM");
    // var newdate = Date.now("dddd, YYYY Do MMM");

    console.log(newdate);

    const current = await Event.find({
      eventDate: { $lt: newdate },
    });
    // console.log(current.eventName);

    if (current.length < 1) {
      return res.status(400).send({
        status: 0,
        message: "no events",
      });
    } else {
      // for(var i = 0; i < current.length; i++) {
      //     var event = current[i];
      // }

      //   var event = [];
      //   for (var i = 0; i < current.length; i++) {
      //     event.push(current[i].eventName, current[i].eventTime, current[i].eventDate, current[i].location.location);
      //   }
      return res.status(200).send({
        status: 1,
        message: "success",
        events: current,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById({ _id: req.params.id });

    if (!event) {
      return res.status(400).send({
        status: 0,
        message: "No Event",
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "success",
        event,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const getfavorites = async (req, res) => {
  try {
    const favorites = await Favourite.find({
      user_id: req.user._id,
    }).populate({
      path: "event_id",
      model: "Event",
      select:
        "eventName , eventDate , eventTime , eventDiscription , eventPicture , location.location , location.longitude , location.latitude ",
    });

    if (!favorites) {
      return res.status(400).send({
        status: 0,
        message: "No Event",
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "success",
        favorites,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const getPoints = async (req, res) => {
  try {
    const e = await Event.findOne({_id: req.body.event_id})

    const radius = e.radius

    // console.log(radius)

    const event = await Event.findOne({
      _id: req.body.event_id,
      eventLocation: {
        $geoWithin: {
          $centerSphere: [
            [
              req.user.userLocation.coordinates[0],
              req.user.userLocation.coordinates[1],
            ],
            (radius * 1.60934) / 6378.1,
          ],
        },
      },
    });
    if (event) {
      // console.log
      const point = new Point({
        user_id: req.user._id,
        event_id: req.body.event_id,
        points: event.points,
      })
        // .populate({
        //   path: "event_id",
        //   model: "Event",
        //   select: "eventName , eventDate , eventTime ",
        // })
        // .populate({
        //   path: "user_id",
        //   model: "User",
        //   select: "userName , userLocation.location ",
        // });

      await point.save();

      return res.status(200).send({
        status: 1,
        message: "point Received",
        point,
      });
    } else {
      return res.status(400).send({
        status: 0,
        message: "No Points",
      });
    }
    // console.log(event)
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

module.exports = {
  getEvents,
  currentEvents,
  upcommingEvents,
  previousEvents,
  getSingleEvent,
  getfavorites,
  getPoints,
};
