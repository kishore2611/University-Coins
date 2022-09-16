const User = require("../models/userModel");

const getUser = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id);
    if (!user) {
      return res.status(400).send({
        status: 0,
        message: "user not found",
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "User Detail",
        data: {
          userName: user.userName,
          email: user.email,
          program: user.program,
          address: user.address,
          bio: user.bio,
          profilePicture: user.profilePicture,
        },
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

const editUser = async (req, res) => {
  try {
    // console.log(req.body)

    if (req.file) {
        profilePicture = req.file.path
    }

    const updateuser = {
        userName : req.body.userName,
        profilePicture : (req.file ? req.file.path : req.body.profilePicture),
        program : req.body.program,
        address : req.body.address,
        bio: req.body.bio,
        email: req.body.email
    }


    const edituser = await User.findOneAndUpdate(
      { _id: req.user._id },
      updateuser,
      { new: true }
    );
    console.log(edituser)
    if (!edituser) {
      return res.status(400).send({
        status: 0,
        message: "user not found",
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "User Updated",
        data: {
          userName: edituser.userName,
          email: edituser.email,
          program: edituser.program,
          address: edituser.address,
          bio: edituser.bio,
          profilePicture: edituser.profilePicture,
        },
      });
    }
  } catch (error) {
    return res.status(404).send(error.message);
  }
};

module.exports = {
  getUser,
  editUser
};
