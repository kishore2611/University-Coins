const Event = require("../models/eventModel");
const moment = require("moment");
const Tar = require("../models/tarHeelModel");
const Point = require("../models/pointModel");

const getPoints = async (req, res) => {
  try {
    // var newdate = moment(Date.now()).format("dddd, Do MMM YYYY");
    // var newtime = moment(Date.now()).format("hh:mm a");
    // var newupdatetime = moment(Date.now()).format("hh:mm a");

    // var newupdatetime = moment(await Date.now().addHours()).format("hh:mm a");

    // console.log(newdate);

    // const today = await Event.find({
    //   eventDate: newdate,
    // });

    // // console.log(today)

    // var a = [];
    // for (let i = 0; i < today.length; i++) {
    //   a.push(today[i]._id, today[i].eventLocation.coordinates);
    //   // b.push(today[i].eventLocation.coordinates)
    // }

    // console.log(a);

    // const e = await Event.findOne({_id: today._id})
    // const radius = today.radius

    // console.log(radius)

    const tar = await Tar.find({
      _id: req.body.tarId,
      tarLocation: {
        $geoWithin: {
          $centerSphere: [
            [
              req.user.userLocation.coordinates[0],
              req.user.userLocation.coordinates[1],
            ],
            (0.5 * 1.60934) / 6378.1,
          ],
        },
      },
    });

    // const a = [];
    // const b =[]
    // for (let i = 0; i < tar.length; i++) {
    //   a.push(tar[i].tarLocation.coordinates);
    //   b.push(tar[i].points);
    // }

    // console.log(tar);

    if (tar.length > 0) {
      for (let i = 0; i < tar.length; i++) {
        var a = tar[i].points;
      }
      // console.log(a);

      const point = new Point({
        user_id: req.user._id,
        tar_id: req.body.tarId,
        points: a,
      });
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
  getPoints,
};
