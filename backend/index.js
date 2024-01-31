const express = require("express");
const cors = require("cors");

const { connection } = require("./config/mongeDb.js");
const { userrouter } = require("./routers/user.router");

const { adminRouter } = require("./routers/admin.router.js");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/user", userrouter);
app.use("/admin", adminRouter);
app.listen(9090, async () => {
  try {
    await connection;
    console.log("connected to the DB");
  } catch (err) {
    console.log(err);
  }
  console.log("Server is running on port no. 9090");
});
