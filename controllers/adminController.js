const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Event = require("../models/eventModel");
const moment = require("moment");
const Tar = require("../models/tarHeelModel");

const adminRegister = async (req, res) => {
  if (!req.body.email) {
    res.status(400).send({
      status: 0,
      message: "Email is required.",
    });
  } else if (!req.body.password) {
    res.status(400).send({
      status: 0,
      message: "Password is required.",
    });
  } else {
    Admin.find({ email: req.body.email })
      .exec()
      .then((admin) => {
        if (admin.length >= 1) {
          res.status(400).send({
            status: 0,
            message: "Email already exists!",
          });
        } else {
          bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
              res.status(400).send({
                status: 0,
                message: err + " password is incorrect!",
              });
            } else {
              if (req.file) {
                profilePicture = req.file.path;
              }

              const admin = new Admin({
                userName: req.body.userName,
                email: req.body.email,
                password: hash,
                profilePicture: req.file
                  ? req.file.path
                  : req.body.profilePicture,
                user_device_token: req.body.user_device_token,
                user_device_type: req.body.user_device_type,
              });
              const token = jwt.sign(
                {
                  email: admin.email,
                  adminId: admin._id,
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "20hr",
                }
              );
              Admin.findOneAndUpdate({ user_authentication: token }).exec();
              //  console.log(user[0].user_authentication);
              admin.user_authentication = token;
              // user.save()
              await admin
                .save()

                .then(async (result) => {
                  return res.status(200).send({
                    status: 1,
                    message: "Admin registered successfully.",
                    data: {
                      user_id: result._id,
                      userName: result.userName,
                      email: result.email,
                      user_authentication: result.user_authentication,
                      profilePicture: result.profilePicture,
                      user_device_token: result.user_device_token,
                      user_device_type: result.user_device_type,
                    },
                  });
                })
                .catch((errr) => {
                  res.status(400).send({
                    status: 0,
                    message: errr,
                  });
                });
            }
          });
        }
      })
      .catch((err) => {
        res.status(400).send({
          status: 0,
          message: err,
        });
      });
  }
};

//Login
const adminLogin = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).send({
      status: 0,
      message: "Email field is required.",
    });
  } else if (!req.body.password) {
    return res.status(400).send({
      status: 0,
      message: "Password field is required.",
    });
  } else {
    Admin.find({ email: req.body.email })
      .exec()
      .then((admin) => {
        if (admin.length < 1) {
          return res.status(404).send({
            status: 0,
            message: "Email not found!",
          });
        } else {
          bcrypt.compare(
            req.body.password,
            admin[0].password,
            (err, result) => {
              if (err) {
                return res.status(400).send({
                  status: 0,
                  message: "Auth Failed",
                });
              } else if (result) {
                const token = jwt.sign(
                  {
                    email: admin[0].email,
                    adminId: admin[0]._id,
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "20hr",
                  }
                );
                Admin.findOneAndUpdate({
                  user_authentication: token,
                  user_device_token: req.body.user_device_token,
                }).exec();
                admin[0].user_device_token = req.body.user_device_token;
                admin[0].user_authentication = token;
                admin[0].save();
                return res.status(200).send({
                  status: 1,
                  message: "Admin logged in successfully!",
                  token: token,
                  data: {
                    userId: admin[0]._id,
                    email: admin[0].email,
                    userName: admin[0].userName,
                    profilePicture: admin[0].profilePicture,
                  },
                });
              }
              return res.status(400).send({
                status: 0,
                message: "Incorrect password.",
              });
            }
          );
        }
      })
      .catch((err) => {
        res.status(400).send({
          status: 0,
          message: err,
        });
      });
  }
};

const postEvent = async (req, res) => {
  try {
    if (!req.body.eventName) {
      return res.status(400).send({
        status: 0,
        message: "eventName field is required.",
      });
    }
    // else if (!req.body.eventDate) {
    //   return res.status(400).send({
    //     status: 0,
    //     message: "eventDate field is required.",
    //   });
    // }
    //  else if (!req.body.eventTime) {
    //   return res.status(400).send({
    //     status: 0,
    //     message: "eventTime field is required.",
    //   });
    // }
    else if (!req.body.eventDiscription) {
      return res.status(400).send({
        status: 0,
        message: "eventDiscription field is required.",
      });
    } else {
      const files = [];
      if (req.files !== undefined) {
        for (let i = 0; i < req.files.length; i++) {
          files.push(req.files[i].path);
        }
      } else {
        files = [];
      }

      if (req.files) {
        eventPicture = req.files.path;
      }

      const { lat, long } = req.body;

      //Radius
      // const bearing = 45;
      // const bearing_rad = (bearing * Math.PI) / 180;
      // const distance = req.body.radius;

      // // console.log(bearing * Math.PI)

      // const EARTH_RADIUS = 6378.1;

      // // const initial_position = {
      // //   latitude: req.body.lat,
      // //   longitude: req.body.long,
      // // };

      // const init_lat = (lat * Math.PI) / 180;
      // const init_lon = (long * Math.PI) / 180;

      // const final_lat =
      //   (180 / Math.PI) *
      //   Math.asin(
      //     Math.sin(init_lat) * Math.cos(distance / EARTH_RADIUS) +
      //       Math.cos(init_lat) *
      //         Math.sin(distance / EARTH_RADIUS) *
      //         Math.cos(bearing_rad)
      //   );

      // const final_lon =
      //   (180 / Math.PI) *
      //   (init_lon +
      //     Math.atan2(
      //       Math.sin(bearing_rad) *
      //         Math.sin(distance / EARTH_RADIUS) *
      //         Math.cos(init_lat),
      //       Math.cos(distance / EARTH_RADIUS) -
      //         Math.sin(init_lat) * Math.sin(final_lat)
      //     ));

      // console.log(final_lat, final_lon);

      //Radius End

      const date = moment(req.body.eventDate, [
        moment.ISO_8601,
        "DD/MM/YYYY",
      ]).format("YYYY-MM-DD"); 

      const time = moment(req.body.eventTime, [
        moment.ISO_8601,
        "hh:mm",
      ]).format("HH:mm a");

      // const time = moment(req.body.eventTime).format('DDThh:mm')
      // console.log(moment(date).format('Thh:mm'))
      // const time = req.body.eventTime

      const event = new Event({
        eventPicture: files,
        eventName: req.body.eventName,
        eventDate: date,
        eventTime: time,
        eventDiscription: req.body.eventDiscription,
        // points: req.body.points,
        "eventLocation.location": req.body.location,
        "eventLocation.coordinates": [lat, long],

        // "location.longitude": req.body.longitude,
        // "location.latitude": req.body.latitude,
        // "location.location": req.body.location,
      });

      await event.save();

      if (!event) {
        return res.status(400).send({
          status: 0,
          message: "event not saved",
        });
      } else {
        return res.status(200).send({
          status: 1,
          message: "event saved",
          data: {
            eventPicture: event.eventPicture,
            eventName: event.eventName,
            eventDate: event.eventDate,
            eventTime: event.eventTime,
            eventDiscription: event.eventDiscription,
            // points: event.points,
            eventLocation: event.eventLocation.location,
            eventLocationType: event.eventLocation.type,
            eventLocationCoordinates: event.eventLocation.coordinates,
          },
        });
      }
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const postPoints = async (req, res) => {
  try {
    if (!req.body.points) {
      return res.status(400).send({
        status: 0,
        message: "points field is required.",
      });
    } else {

      // console.log(req.body)
      const { lat, long } = req.body;

      const tar = new Tar({
        points: req.body.points,
        radius: req.body.radius,
        "tarLocation.location": req.body.location,
        "tarLocation.coordinates": [lat, long],
      });

      await tar.save();

      // console.log(tar)

      if (!tar) {
        return res.status(400).send({
          status: 0,
          message: "event not saved",
        });
      } else {
        return res.status(200).send({
          status: 1,
          message: "tar Points saved",
          data: {
            points: tar.points,
            radius: tar.radius,
            tarLocationType: tar.tarLocation.type,
            tarLocationCoordinates: tar.tarLocation.coordinates,
          },
        });
      }
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

module.exports = {
  adminRegister,
  adminLogin,
  postEvent,
  postPoints,
};
