const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
// const https = require("https");
const bodyParser = require("body-parser");
const server = http.createServer(app);
// const {push_notifications} = require("./utils/push_notification");
// const User = require("./models/userModel")

const { get_messages, send_message } = require("./utils/messages");
const { update_location } = require("./utils/location");


var io = require("socket.io")(server, {
  cors: {
    origin: "",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: false,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  },
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();

//Multer file upload
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT;

//MongoDB Connect
mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useCreateIndex: true,
  })
  .then((data) =>
    console.log(`MongoDB connected with server: ${data.connection.host}`)
  )
  .catch((err) => {
    console.log(err);
  });

//Route Middlewares
const apiRoutes = require("./routes/api");
const Content = require("./models/contentModel");
app.use("/api", apiRoutes);

const adminApiRoutes = require("./routes/adminApi");
const User = require("./models/userModel");
const Notification = require("./models/notificationModel");
const { push_notifications } = require("./utils/push_notification")
app.use("/admin", adminApiRoutes);

/** Content seeder */
const contentSeeder = [
  {
    title: "Privacy Policy",
    content:
      "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
    type: "privacy_policy",
  },
  {
    title: "Terms and Conditions",
    content:
      "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
    type: "terms_and_conditions",
  },
];

const dbSeed = async () => {
  await Content.deleteMany({});
  await Content.insertMany(contentSeeder);
};
dbSeed().then(() => {
  // mongoose.connection.close();
});

// Run when client connects
io.on("connection", (socket) => {
  console.log("socket connection ID:" + socket.id);
  //Location Emit
  socket.on("update_location", async function (object) {
    var lat = "user_" + object.lat;
    var long = "user_" + object.long;
    update_location(object, function (response_obj) {
      if (response_obj) {
        console.log("update_location has been successfully executed...");
        io.to(lat)
          .to(long)
          .emit("response", { object_type: "update_location", data: response_obj });
      } else {
        console.log("update_location has been failed...");
        io.to(lat).to(long).emit("error", {
          object_type: "update_location",
          message: "There is some problem in location...",
        });
      }
    });
  })
  //Location End
  socket.on("get_messages", async function (object) {
    var user_room = "user_" + object.sender_id;
    socket.join(user_room);
    get_messages(object, function (response) {
      if (response.length > 0) {
        console.log("get_messages has been successfully executed...");
        io.to(user_room).emit("response", {
          object_type: "get_messages",
          data: response,
        });
      } else {
        console.log("get_messages has been failed...");
        io.to(user_room).emit("error", {
          object_type: "get_messages",
          message: "There is some problem in get_messages...",
        });
      }
    });
  });
  // SEND MESSAGE EMIT
  socket.on("send_message", async function (object) {
    // notification start //
    const receiver_object = await User.find({
      _id: object.receiver_id,
    });

    const sender_object = await User.find({
      _id: object.sender_id,
    });

    console.log("sender_object:", sender_object);

    let receiver_device_token = "";
    let receiver_name = "";
    let is_notification_reciever = " ";
    for (let i = 0; i < receiver_object.length; i++) {
      receiver_device_token = receiver_object[i].user_device_token;
      receiver_name = receiver_object[i].userName;
      is_notification_reciever = receiver_object[i].is_notification;
    }

    let sender_device_token = "";
    let sender_name = "";
    let sender_image = "";
    // let sender_id = "";
    for (let i = 0; i < sender_object.length; i++) {
      sender_device_token = sender_object[i].user_device_token;
      sender_name = sender_object[i].userName;
      sender_image = sender_object[i].profilePicture;
      // sender_id = sender_object[i]._id;
    }

    // console.log("sender_name:", sender_name);

    const notification_obj_receiver = {
      user_device_token: receiver_device_token,
      title: receiver_name,
      body: `${sender_name} has send you a message.`,
      notification_type: "msg_notify",
      vibrate: 1,
      sound: 1,
      sender_id: object.sender_id,
      sender_name: sender_name,
      sender_image: sender_image,
    };
    // console.log("notification_obj_receiver:", notification_obj_receiver);
    // is_notification_reciever == "true"
    //  console.log("reciever_notificatrion:", is_notification_reciever);
    if (is_notification_reciever == 1) {
      push_notifications(notification_obj_receiver);
    }

    const notification = new Notification({
      user_device_token: notification_obj_receiver.user_device_token,
      title: notification_obj_receiver.title,
      body: notification_obj_receiver.body,
      notification_type: notification_obj_receiver.notification_type,
      sender_id: notification_obj_receiver.sender_id,
      sender_name: notification_obj_receiver.sender_name,
      sender_image: notification_obj_receiver.sender_image,
      receiver_id: notification_obj_receiver.receiver_id,
      date: moment(new Date()).format("YYYY-MM-DD"),
    });
    await notification.save();

    // notification end //

    var sender_room = "user_" + object.sender_id;
    var receiver_room = "user_" + object.receiver_id;
    send_message(object, function (response_obj) {
      if (response_obj) {
        console.log("send_message has been successfully executed...");
        io.to(sender_room)
          .to(receiver_room)
          .emit("response", { object_type: "get_message", data: response_obj });
      } else {
        console.log("send_message has been failed...");
        io.to(sender_room).to(receiver_room).emit("error", {
          object_type: "get_message",
          message: "There is some problem in get_message...",
        });
      }
    });
  });
});

server.listen(PORT, () => console.log(`Server Up and Running on Port ${PORT}`));
