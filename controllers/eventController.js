const Event = require("../models/eventModel");
const User = require("../models/userModel");
const moment = require("moment");
const Favourite = require("../models/favouriteModel");
const Point = require("../models/pointModel");

const getEvents = async (req, res) => {
  try {
    const newdate = moment(Date.now()).format("YYYY-MM-DD");
    const currentevent = await Event.find({
      eventDate: newdate,
    });
    const upcommingevent = await Event.find({
      eventDate: { $gt: newdate },
    });
    const user = await User.findOne({ _id: req.user._id });

    // console.log(events)

    if (!currentevent || !upcommingevent) {
      return res.status(400).send({
        status: 0,
        message: "No events found",
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "Events",
        user: user.userName,
        Current: currentevent,
        UpComming: upcommingevent,
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const currentEvents = async (req, res) => {
  try {
    var newdate = moment(Date.now()).format("YYYY-MM-DD");

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
    const fav = req.body.favourite;

    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { is_favourite: fav },
      { new: true }
    );

    if (user.is_favourite === 0) {
      var newdate = moment(Date.now()).format("YYYY-MM-DD");

      // console.log(newdate);

      const upcomming = await Event.find({
        eventDate: { $gt: newdate },
      });
      // console.log(upcomming.eventName);

      if (upcomming.length < 1) {
        return res.status(400).send({
          status: 0,
          message: "no events",
        });
      } else {
        // for(var i = 0; i < upcomming.length; i++) {
        //     var event = upcomming[i];
        // }

        //   var event = [];
        //   for (var i = 0; i < upcomming.length; i++) {
        //     event.push(upcomming[i].eventName, upcomming[i].eventTime, upcomming[i].eventDate, upcomming[i].location.location);
        //   }
        return res.status(200).send({
          status: 1,
          message: "success",
          events: upcomming,
        });
      }
    } else {
      var newdate = moment(Date.now()).format("YYYY-MM-DD");

      // console.log(newdate);

      const upcomming = await Event.find({
        eventDate: { $gt: newdate },
        "favouriteEvents.user_id": req.user._id,
      });
      // console.log(upcomming.eventName);

      if (upcomming.length < 1) {
        return res.status(400).send({
          status: 0,
          message: "no favourite events",
        });
      } else {
        // for(var i = 0; i < upcomming.length; i++) {
        //     var event = upcomming[i];
        // }

        //   var event = [];
        //   for (var i = 0; i < upcomming.length; i++) {
        //     event.push(upcomming[i].eventName, upcomming[i].eventTime, upcomming[i].eventDate, upcomming[i].location.location);
        //   }
        return res.status(200).send({
          status: 1,
          message: "success",
          events: upcomming,
        });
      }
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const previousEvents = async (req, res) => {
  try {
    const fav = req.body.favourite;

    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { is_favourite: fav },
      { new: true }
    );

    if (user.is_favourite === 0) {
      var newdate = moment(Date.now()).format("YYYY-MM-DD");

      // console.log(newdate);

      const previous = await Event.find({
        eventDate: { $lt: newdate },
      });
      // console.log(previous.eventName);

      if (previous.length < 1) {
        return res.status(400).send({
          status: 0,
          message: "no events",
        });
      } else {
        // for(var i = 0; i < previous.length; i++) {
        //     var event = previous[i];
        // }

        //   var event = [];
        //   for (var i = 0; i < previous.length; i++) {
        //     event.push(previous[i].eventName, previous[i].eventTime, previous[i].eventDate, previous[i].location.location);
        //   }
        return res.status(200).send({
          status: 1,
          message: "success",
          events: previous,
        });
      }
    } else {
      var newdate = moment(Date.now()).format("YYYY-MM-DD");

      // console.log(newdate);

      const previous = await Event.find({
        eventDate: { $lt: newdate },
        "favouriteEvents.user_id": req.user._id,
      });
      // console.log(previous.eventName);

      if (previous.length < 1) {
        return res.status(400).send({
          status: 0,
          message: "no favourite events",
        });
      } else {
        // for(var i = 0; i < previous.length; i++) {
        //     var event = previous[i];
        // }

        //   var event = [];
        //   for (var i = 0; i < previous.length; i++) {
        //     event.push(previous[i].eventName, previous[i].eventTime, previous[i].eventDate, previous[i].location.location);
        //   }
        return res.status(200).send({
          status: 1,
          message: "success",
          events: previous,
        });
      }
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

module.exports = {
  getEvents,
  currentEvents,
  upcommingEvents,
  previousEvents,
  getSingleEvent,
  getfavorites,
};
