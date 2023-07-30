"use strict";
// 3rd Party Resources
require("dotenv").config();
const port = process.env.PORT || 3001;
const port2 = process.env.PORT2 || 3001;

//--------------------------
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./auth/routes");
const v2Routes = require("./routes/v2.js");
const notFoundHandler = require("./error-handlers/404.js");
const errorHandler = require("./error-handlers/500.js");
// const logger = require("./middleware/logger.js");
const v1Routes = require("./routes/v1.js");
//_______---

const socket = require("socket.io");
const io = socket(port2);

io.on("connection", (newSocket) => {
  console.log("connected to clients", newSocket.id);
  newSocket.on('test',(test)=>{
    console.log(test)

  })
  newSocket.on("mota",(mota)=>{
    console.log(mota)
  })
})

//--------------------------
app.use(express.json());
// app.use(logger);
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
app.use(authRoutes);
app.get("/", welcomeHandler);
function welcomeHandler(req, res) {
  res.status(200).send("hello home");
}
app.use("*", notFoundHandler);
app.use(errorHandler);
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
