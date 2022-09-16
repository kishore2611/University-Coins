const Content = require("../models/contentModel");
const Favourite = require("../models/favouriteModel");

const getContent = async (req, res) => {
  if (!req.params.type) {
    return res.status(400).send({
      status: 0,
      message: "Type is required.",
    });
  } else {
    Content.find({ type: req.params.type })
      .exec()
      .then((content) => {
        if (content.length > 0) {
          res.status(200).send({
            status: 1,
            message: "Content found Sucessfully",
            data: content,
          });
        } else {
          res.status(404).send({
            status: 0,
            message: "Content not found.",
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

const favourite = async (req, res) => {
  try {
    if (!req.body.event_id) {
      res.status(400).send({
        status: 0,
        message: "event_id is Required",
      });
    } else {
      const find = await Favourite.findOne({
        user_id: req.user._id,
        event_id: req.body.event_id,
      });
      //   console.log(find)
      //   return

      if (!find) {
        const add = new Favourite({
          user_id: req.user._id,
          event_id: req.body.event_id,
        });

        await add.save();

        return res.status(200).send({
          status: 1,
          message: "Event has added to your favourite list",
          add,
        });
      } else {
        const remove = await Favourite.findOneAndDelete({
          user_id: req.user._id,
          event_id: req.body.event_id,
        });
        remove.delete();
        return res.status(200).send({
          status: 1,
          message: "Event has removed from your favourite list",
          remove,
        });
      }
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const getNotifications = async (req, res) => {
  try {
    // const user = req.user._id
    // user.toString();
    // console.log(user);
    // return
    const notification = await Notification.find({ receiver_id: req.user._id });

    // console.log(notification);

    if (!notification) {
      return res.status(404).send({ status: 0, message: "No Notification" });
    } else {
      return res
        .status(200)
        .send({
          status: 1,
          message: "notification",
          data: { notification: notification },
        });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

module.exports = {
  getContent,
  favourite,
  getNotifications,
};
