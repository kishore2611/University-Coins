const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");

const update_location = async (object, callback) => {
  const { lat, long } = object;
  const doc_location = await User.findOneAndUpdate(
    { _id: object.user_id },
    { "userLocation.coordinates": [lat, long] },
    { new: true }
  );

  doc_location.save(async (err, results) => {
    if (err) {
      callback(err);
    } else {
        console.log(results)
        User.find({ _id: results._id }, async(err, results_query) => {
            if (err) {
                callback(err);
            } else {
                callback(results_query);
            }
        })
    }
  });
};

module.exports = {
  update_location,
};
