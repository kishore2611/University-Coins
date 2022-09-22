const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../config/mailer");

//Register User
const register = async (req, res) => {
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
  } else if (!req.body.program) {
    res.status(400).send({
      status: 0,
      message: "program is required.",
    });
  } else {
    User.find({ email: req.body.email })
      .exec()
      .then((user) => {
        if (user.length >= 1) {
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

              const verificationCode = Math.floor(
                100000 + Math.random() * 900000
              );

              const { lat, long } = req.body;

              console.log("lat long",lat, long)

              const user = new User({
                userName: req.body.userName,
                email: req.body.email,
                password: hash,
                program: req.body.program,
                "userLocation.location": req.body.location,
                "userLocation.coordinates": [lat, long],
                bio: req.body.bio,
                profilePicture: req.file
                  ? req.file.path
                  : req.body.profilePicture,
                verification_code: verificationCode,
                user_device_token: req.body.user_device_token,
                user_device_type: req.body.user_device_type,
              });
              const token = jwt.sign(
                {
                  email: user.email,
                  userId: user._id,
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "20hr",
                }
              );
              User.findOneAndUpdate({ user_authentication: token }).exec();
              //  console.log(user[0].user_authentication);
              user.user_authentication = token;
              // user.save()
              await user
                .save()

                .then(async (result) => {
                  sendEmail(user.email, verificationCode, "Email verification");

                  console.log(result)

                  return res.status(200).send({
                    status: 1,
                    message:
                      "User verification code successfully sent to email.",
                    data: {
                      verification_code: result.verification_code,
                      user_id: result._id,
                      program: result.program,
                      bio: result.bio,
                      userLocation: result.userLocation.location,
                      userLocationType: result.userLocation.type,
                      userLocationCoordinates: result.userLocation.coordinates,
                      profilePicture: result.profilePicture,
                      userName: result.userName,
                      // token: result.user_authentication,
                      // is_verified: result.is_is_verified,
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

//verify User
const verifyUser = async (req, res) => {
  if (!req.body.user_id) {
    res.status(400).send({
      status: 0,
      message: "User id field is required",
    });
  } else if (!req.body.verification_code) {
    res.status(400).send({
      status: 0,
      message: "Verification code field is required",
    });
  } else {
    User.find({ _id: req.body.user_id })
      .exec()
      .then((result) => {
        if (!req.body.verification_code) {
          res.status(400).send({
            status: 0,
            message: "Verification code is required.",
          });
        }

        if (req.body.verification_code == result[0].verification_code) {
          User.findByIdAndUpdate(
            req.body.user_id,
            { is_verified: 1, verification_code: null },
            (err, user) => {
              if (err) {
                res.status(400).send({
                  status: 0,
                  message: "Something went wrong.",
                });
              }
              if (user) {
                const token = jwt.sign(
                  {
                    email: user.email,
                    userId: user._id,
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "20hr",
                  }
                );
                User.findOneAndUpdate({
                  user_authentication: token,
                  user_device_token: req.body.user_device_token,
                }).exec();
                //  console.log(user[0].user_authentication);
                user.user_authentication = token;
                user.save();
                return res.status(200).send({
                  status: 1,
                  message: "Otp matched successfully.",
                  token: token,
                });
                // res.status(200).send({
                //     status: 1,
                //     message: 'Otp matched successfully.'
                // });
              }
            }
          );
        } else {
          res.status(200).send({
            status: 0,
            message: "Verification code did not matched.",
          });
        }
      })
      .catch((err) => {
        res.status(400).send({
          status: 0,
          message: "User not found",
        });
      });
  }
};

/** Resend code */
const resendCode = async (req, res) => {
  if (!req.body.user_id) {
    res.status(400).send({
      status: 0,
      message: "User id failed is required.",
    });
  } else {
    User.find({ _id: req.body.user_id })
      .exec()
      .then((result) => {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        User.findByIdAndUpdate(
          req.body.user_id,
          { is_verified: 0, verification_code: verificationCode },
          (err, _result) => {
            if (err) {
              res.status(400).send({
                status: 0,
                message: "Something went wrong.",
              });
            }
            if (_result) {
              sendEmail(
                result[0].email,
                verificationCode,
                "Verification Code Resend"
              );
              res.status(200).send({
                status: 1,
                message: "Verification code resend successfully.",
                verification_code: _result.verification_code,
              });
            }
          }
        );
      })
      .catch((err) => {
        res.status(400).send({
          status: 0,
          message: "User not found",
        });
      });
  }
};

//Login
const login = async (req, res) => {
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
    User.find({ email: req.body.email })
      .exec()
      .then((user) => {
        if (user.length < 1) {
          return res.status(404).send({
            status: 0,
            message: "Email not found!",
          });
        } else {
          bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
              return res.status(400).send({
                status: 0,
                message: "Auth Failed",
              });
            } else if (result) {
              // const verificationCode = Math.floor(
              //   100000 + Math.random() * 900000
              // );

              // sendEmail(user.email, verificationCode, "Email verification");

              if (user[0].is_verified == 0) {
                return res.status(400).send({
                  status: 0,
                  message: "Please verify your account.",
                  is_verified: user[0].is_verified,
                  verification_code: user[0].verification_code,
                });
              } else {
                // for (let i = 0; i < user.length; i++) {
                //   // var shift = myshifts[i].hospital_id;
                //   var users = user[i].user_authentication;
                // }
                // console.log("user_authentication", users);

                // if (users === null) {
                const token = jwt.sign(
                  {
                    email: user[0].email,
                    userId: user[0]._id,
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "20hr",
                  }
                );
                User.findOneAndUpdate({
                  user_authentication: token,
                  user_device_token: req.body.user_device_token,
                }).exec();
                user[0].user_device_token = req.body.user_device_token;
                user[0].user_authentication = token;
                user[0].save();
                return res.status(200).send({
                  status: 1,
                  message: "User logged in successfully!",
                  token: token,
                  data: {
                    userId: user[0]._id,
                    email: user[0].email,
                    userName: user[0].userName,
                    profilePicture: user[0].profilePicture,
                  },
                });
                // } else {
                //   return res.status(401).send({
                //     status: 0,
                //     message: "User already logged in!",
                //   });
                // }
              }
            }
            return res.status(400).send({
              status: 0,
              message: "Incorrect password.",
            });
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

//Forgot Password
const forgotPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      res.status(400).send({
        status: 0,
        message: "Email field is required",
      });
    } else {
      User.findOne({ email: req.body.email })
        .exec()
        .then((user) => {
          if (user.length < 1) {
            return res.status(404).send({
              status: 0,
              message: "Email not found!",
            });
          } else {
            const verificationCode = Math.floor(
              100000 + Math.random() * 900000
            );

            User.findByIdAndUpdate(
              user._id,
              { verification_code: 123456 },{new:true})
              sendEmail(user.email, verificationCode, "Forgot Password");

              res.status(200).send({
                status: 1,
                message: "Code successfully send to email.",
                data: {
                  user_id: user._id,
                  verification_code: user.verification_code,
                },
              });


              // (err, _result) => {
              //   if (err) {
              //     res.status(400).send({
              //       status: 0,
              //       message: "Something went wrong.",
              //     });
              //   }
                // if (_result) {
                  
                // }
              // }
            // );
          }
        })
        .catch((err) => {
          res.status(400).send({
            status: 0,
            message: "User not found",
          });
        });
    }
  } catch (err) {
    res.status(404).send({
      status: 0,
      message: "error: " + err.message,
    });
  }
};

//Verify Code
const verifyCode = async (req, res) => {
  try {
    if (!req.body.user_id) {
      res.status(400).send({
        status: 0,
        message: "User id field is required",
      });
    } else if (!req.body.verification_code) {
      res.status(400).send({
        status: 0,
        message: "Verification code field is required",
      });
    } else {
      User.findOne({ _id: req.body.user_id })
        .exec()
        .then((result) => {
          if (!req.body.verification_code) {
            res.status(400).send({
              status: 0,
              message: "Verification code is required.",
            });
          }

          if (req.body.verification_code == result.verification_code) {
            User.findByIdAndUpdate(
              req.body.user_id,
              { is_verified: 1, verification_code: null },
              (err, _result) => {
                if (err) {
                  res.status(400).send({
                    status: 0,
                    message: "Something went wrong.",
                  });
                }
                if (_result) {
                  res.status(200).send({
                    status: 1,
                    message: "Otp matched successfully.",
                  });
                }
              }
            );
          } else {
            res.status(200).send({
              status: 0,
              message: "Verification code did not matched.",
            });
          }
        })
        .catch((err) => {
          res.status(400).send({
            status: 0,
            message: "User not found",
          });
        });
    }
  } catch (err) {
    res.status(404).send({
      status: 0,
      message: "error: " + err.message,
    });
  }
};

//Reset Password
const resetPassword = async (req, res) => {
  try {
    if (!req.body.user_id) {
      res.status(400).send({
        status: 0,
        message: "User id field is required.",
      });
    } else if (!req.body.new_password) {
      res.status(400).send({
        status: 0,
        message: "New password field is required.",
      });
    } else {
      User.find({ _id: req.body.user_id })
        .exec()
        .then((user) => {
          bcrypt.hash(req.body.new_password, 10, (error, hash) => {
            if (error) {
              return res.status(400).send({
                status: 0,
                message: error,
              });
            } else {
              User.findByIdAndUpdate(
                req.body.user_id,
                { password: hash },
                (err, _result) => {
                  if (err) {
                    res.status(400).send({
                      status: 0,
                      message: "Something went wrong.",
                    });
                  }
                  if (_result) {
                    res.status(200).send({
                      status: 1,
                      message: "Password updated successfully.",
                    });
                  }
                }
              );
            }
          });
        })
        .catch((err) => {
          res.status(400).send({
            status: 0,
            message: "catch Error: " + err.message,
          });
        });
    }
  } catch (err) {
    res.status(404).send({
      status: 0,
      message: "error: " + err.message,
    });
  }
};

//Update Password
const updatePassword = async (req, res) => {
  try {
    if (!req.body.password) {
      res.status(400).send({
        status: 0,
        message: "Old password field is required.",
      });
    } else if (!req.body.new_password) {
      res.status(400).send({
        status: 0,
        message: "New password field is required.",
      });
    } else {
      const user = await User.findOne({ _id: req.user._id });
      console.log(user);
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        res.status(400).send({
          status: 0,
          message: "Old password is incorrect",
        });
      } else {
        const hashedpassword = await bcrypt.hash(req.body.new_password, 10);
        const newUser = await User.findByIdAndUpdate(
          { _id: req.user._id },
          { password: hashedpassword }
        );
        await newUser.save();

        res.status(200).send({
          status: 1,
          message: "Password has been updated successfully",
        });
      }
    }
  } catch (err) {
    res.status(404).send({
      status: 0,
      message: "error: " + err.message,
    });
  }
};

//LogOut
const logOut = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      res
        .status(400)
        .send({ status: 0, message: "Authentication Field is required" });
    } else {
      const updateUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          user_authentication: null,
          user_device_type: null,
          user_device_token: null,
        },
        { new: true }
      );

      // console.log(req.headers['authorization']);
      res.removeHeader("authorization");

      // res.removeheader('authorization');

      // jwt.destroy(Token)

      // console.log(Token);
      res.status(200).send({
        status: 1,
        message: "User logout Successfully.",
        data: {
          user_authentication: updateUser.user_authentication,
          email: updateUser.email,
          user_device_token: updateUser.user_device_token,
          user_device_type: updateUser.user_device_type,
        },
      });
      // console.log(updateUser);
    }
    // if (!req.body.user_id) {
    //     res.status(400).send({ status: 0, message: 'User ID field is required' });
    // }
    // else if (!req.headers.authorization) {
    //     res.status(400).send({ status: 0, message: 'Authentication Field is required' });
    // }

    // res.headers('tolen', 'none', {
    // httpOnly: true
    // })

    // return res.status(200).headers("token", null, {expires: new Date(Date.now()), httpOnly: true}).send({
    //     status: 1,
    //     message: 'User logged Out successfully!',
    //     data: {}
    //     // token: null
    // })

    // res.status(200).send({
    //     data: {}
    // })
  } catch (err) {
    res.status(500).send({
      status: 0,
      message: "error: " + err.message,
    });
  }
};

//** Social Login *//
const socialLogin = async (req, res) => {
  try {
    const alreadyUserAsSocialToke = await User.findOne({
      user_social_token: req.body.user_social_token,
    });
    if (alreadyUserAsSocialToke) {
      if (alreadyUserAsSocialToke.user_type !== req.body.user_type) {
        return res
          .status(400)
          .send({ status: 0, message: "Invalid User Type!" });
      }
    }
    if (!req.body.user_social_token) {
      return res
        .status(400)
        .send({ status: 0, message: "User Social Token field is required" });
    } else if (!req.body.user_social_type) {
      return res
        .status(400)
        .send({ status: 0, message: "User Social Type field is required" });
    } else if (!req.body.user_device_type) {
      return res
        .status(400)
        .send({ status: 0, message: "User Device Type field is required" });
    } else if (!req.body.user_device_token) {
      return res
        .status(400)
        .send({ status: 0, message: "User Device Token field is required" });
    } else {
      const checkUser = await User.findOne({
        user_social_token: req.body.user_social_token,
        email: req.body.email,
      });
      if (!checkUser) {
        const newRecord = new User();
        // if(req.file){
        //     newRecord.user_image    = req.file.path
        //  }
        // const customer = await stripe.customers.create({
        //     description: 'New Customer Created',
        // });
        // newRecord.stripe_id = customer.id;
        // newRecord.user_image = req.body.user_image ? req.body.user_image : ""
        // newRecord.user_image = req.body.user_image
        // newRecord.user_image = req.file ? req.file.path : req.body.user_image,
        (newRecord.user_social_token = req.body.user_social_token), ///
          (newRecord.user_social_type = req.body.user_social_type),
          (newRecord.user_device_type = req.body.user_device_type),
          (newRecord.user_device_token = req.body.user_device_token),
          // newRecord.user_name = req.body.user_name,////
          (newRecord.email = req.body.email),
          //newRecord.user_type = req.body.user_type,
          (newRecord.is_verified = 1);
        // await newRecord.generateAuthToken();
        const token = await jwt.sign(
          {
            email: newRecord.email,
            userId: newRecord._id,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "20hr",
          }
        );
        newRecord.user_authentication = token;
        const saveLogin = await newRecord.save();
        return res.status(200).send({
          status: 1,
          message: "Login Successfully",
          // socialUser: saveLogin,
          data: {
            UserId: saveLogin._id,
            user_social_token: saveLogin.user_social_token,
            user_social_type: saveLogin.user_social_type,
            user_device_type: saveLogin.user_device_type,
            user_device_token: saveLogin.user_device_token,
            email: saveLogin.email,
            is_verified: saveLogin.is_verified,
            name: saveLogin.name,
          },
          token: token,
        });
      } else {
        const token = jwt.sign(
          {
            email: checkUser.email,
            userId: checkUser._id,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "20hr",
          }
        );
        // await alreadyrecord.save()
        // User.findOneAndUpdate({ user_authentication: token })
        const upatedRecord = await User.findOneAndUpdate(
          { _id: checkUser._id },
          {
            user_device_type: req.body.user_device_type,
            user_device_token: req.body.user_device_token,
            is_verified: 1,
            user_authentication: token,
          },
          { new: true }
        );
        return res.status(200).send({
          status: 1,
          message: "Login Successfully",
          // socialUser: upatedRecord,
          data: {
            UserId: upatedRecord._id,
            user_social_token: upatedRecord.user_social_token,
            user_social_type: upatedRecord.user_social_type,
            user_device_type: upatedRecord.user_device_type,
            user_device_token: upatedRecord.user_device_token,
            email: upatedRecord.email,
            is_verified: upatedRecord.is_verified,
            name: upatedRecord.name,
          },
          token: token,
        });
      }
    }
    // console.log(upatedRecord)
  } catch (error) {
    // console.log('error *** ', error);
    res.status(500).json({
      status: 0,
      message: error.message + "catch error",
    });
  }
};

module.exports = {
  register,
  verifyUser,
  resendCode,
  login,
  forgotPassword,
  verifyCode,
  resetPassword,
  updatePassword,
  logOut,
  socialLogin,
};
