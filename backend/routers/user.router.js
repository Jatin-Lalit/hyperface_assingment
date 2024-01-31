const express = require("express");
require("dotenv").config();
const { User } = require("../model/user.model.js");
const { podcast } = require("../model/podcast.model.js");

const jwt = require("jsonwebtoken");
const { blacklist } = require("../blacklist.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

const bcrypt = require("bcryptjs");
const multer = require("multer");
const { Chapter } = require("../model/chapter.model.js");
const userrouter = express.Router();

userrouter.use(express.json());
//////////////////////////
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
    return cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
////
const upload = multer({ storage: storage });
userrouter.use("/uploads", express.static("uploads"));

// userrouter.get("/uploads/:filename", (req, res) => {
//   const filename = req.params.filename;
//   res.sendFile(filename, { root: "uploads" });
// });
////
/////signup
userrouter.post("/signup", upload.single("profileImage"), async (req, res) => {
  try {
    const { email, phoneNumber, name, password } = req.body;

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).send("Phone number must be a 10-digit number");
    }

    const isEmailPresent = await User.findOne({ email });
    const isPhonePresent = await User.findOne({ phoneNumber });

    if (isEmailPresent) {
      return res.status(409).send("Email already registered");
    }

    if (isPhonePresent) {
      return res.status(409).send("Phone number already registered");
    }

    bcrypt.hash(password, 5, async (err, hash_password) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }

      const user = new User({
        email,
        phoneNumber,
        name,
        password: hash_password,
        profileImage: req.file ? "/uploads/" + req.file.filename : undefined,
        role: "User",
      });

      await user.save();
      res.status(201).send("Registration Completed");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

///login
userrouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, UserId: user._id },
        process.env.securityKey,
        {
          expiresIn: "24h",
        }
      );

      res.status(200).json({
        success: true,
        token,
        user,
        msg: "User login sucessfully",
      });
    } else {
      res.status(200).json({
        success: false,
        msg: "Passowrd is Incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "User login failed",
    });
  }
});
/////get Data
userrouter.get("/courses", authMiddleware, async (req, res) => {
  try {
    const courses = await podcast.find();

    if (!courses) {
      return res.status(404).send({ msg: "courses not found" });
    } else {
      res.status(200).send(courses);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.massage);
  }
});

/////get perticular courses
userrouter.get("/courses/:id", authMiddleware, async (req, res) => {
  let id = req.params.id;
  try {
    const courses = await podcast.findById({ _id: id });

    if (!courses) {
      return res.status(404).send({ msg: "course not found" });
    } else {
      res.status(200).send(courses);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.massage);
  }
});

///getting perticulag chapters of a course
userrouter.get("/courses/chapters/:id", authMiddleware, async (req, res) => {
  let id = req.params.id;
  try {
    const chapter = await Chapter.findById({ _id: id });

    if (!chapter) {
      return res.status(404).send({ msg: "Chapter not found" });
    } else {
      res.status(200).send(chapter);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.massage);
  }
});
////logout
userrouter.get("/logout", (req, res) => {
  try {
    const token = req.headers.authorization;
    blacklist.push(token);
    res.send("you are loged out");
  } catch (err) {
    console.log(err.massage);
  }
});

//////////
module.exports = {
  userrouter,
};
