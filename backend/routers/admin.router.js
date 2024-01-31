const express = require("express");
require("dotenv").config();
const { User } = require("../model/user.model.js");
const { podcast } = require("../model/podcast.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const { authMiddleware } = require("../middleware/authMiddleware.js");
const { Chapter } = require("../model/chapter.model.js");
const adminRouter = express.Router();
adminRouter.use(express.json());
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
/////////////////

const storageThumbnail = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "thumbnails/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
    return cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const uploadThumbnail = multer({ storage: storageThumbnail });
//////
adminRouter.use("/uploads", express.static("uploads"));

/////signup
adminRouter.post("/signup", upload.single("profileImage"), async (req, res) => {
  try {
    const { email, phoneNumber, name, password } = req.body;

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).send("Phone number must be a 10-digit number");
    }

    const isPresent = await User.findOne({ email });

    if (isPresent) {
      return res.status(409).send("Email already registered");
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
        role: "Admin",
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
adminRouter.post("/login", async (req, res) => {
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
adminRouter.get("/courses", authMiddleware, async (req, res) => {
  try {
    const courses = await podcast.findById(req.UserId);

    if (!courses) {
      return res
        .status(404)
        .json({ success: false, message: "Error while getting the courses" });
    } else {
      res
        .status(200)
        .json(
          { success: true, message: "courses Fetched successfully" },
          courses
        );
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.massage);
  }
});

adminRouter.post(
  "/add/courses",
  authMiddleware,
  uploadThumbnail.single("thumbnail"),
  async (req, res) => {
    try {
      // fetch the data from req.body
      let { coursename } = req.body;
      let UserId = req.UserId;

      // data vlidation
      if (!coursename || !UserId) {
        return res.status(404).json({
          success: false,
          msg: "unable to found the user ,provide coursename",
        });
      }
      const course = new podcast({
        coursename,
        UserId,
        thumbnail: req.file ? "/thumbnail/" + req.file.filename : undefined,
      });
      // create new course
      await course.save();
      res
        .status(200)
        .json({ success: true, msg: "Course Added Successfully", course });
    } catch (error) {
      res.status(500).json({ success: false, msg: "Errro while add Course" });
    }
  }
);

// Adding Course Chapter

const storageAudio = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "audio/"); // Set the destination to the "audio" folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
    return cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const uploadAudio = multer({ storage: storageAudio });
////////////Adding Course Chapter endpoint
adminRouter.post(
  "/add/courses/:id/chapters",
  authMiddleware,
  uploadAudio.array("audioFiles"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const { courseTitle } = req.body;

      // Check if the course exists
      const existingCourse = await podcast.findById(courseId);
      if (!existingCourse) {
        return res
          .status(404)
          .json({ success: false, msg: "Course not found" });
      }

      // Create an array to store audio file paths
      const audioFiles = req.files.map((file) => "/audio/" + file.filename);

      // Create a new chapter
      const newChapter = new Chapter({
        courseTitle,
        UserId: req.UserId,
        audio: audioFiles,
      });

      // Save the chapter
      await newChapter.save();

      // Add the chapter to the existing course
      existingCourse.chapters.push(newChapter._id);
      await existingCourse.save();

      res.status(200).json({ success: true, msg: "Chapter added to course" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, msg: "Error while adding chapter to course" });
    }
  }
);

//Delete Course
// Route to delete a course and its associated chapters
adminRouter.delete("/courses/:id", authMiddleware, async (req, res) => {
  try {
    const courseId = req.params.id;

    const courseToDelete = await podcast.findById(courseId);

    if (!courseToDelete) {
      return res.status(404).json({ success: false, msg: "Course not found" });
    }

    await Chapter.deleteMany({ _id: { $in: courseToDelete.chapters } });

    // Delete the course
    await podcast.findByIdAndDelete(courseId);

    res.status(200).json({ success: true, msg: "Course and chapters deleted" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, msg: "Error while deleting course" });
  }
});

// Route to delete a specific chapter of a course
adminRouter.delete(
  "/courses/:courseId/chapters/:chapterId",
  authMiddleware,
  async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const chapterId = req.params.chapterId;

      // Find the course by ID
      const course = await podcast.findById(courseId);

      if (!course) {
        return res
          .status(404)
          .json({ success: false, msg: "Course not found" });
      }

      if (!course.chapters.includes(chapterId)) {
        return res.status(404).json({
          success: false,
          msg: "Chapter not found in the specified course",
        });
      }

      // Delete the chapter
      await Chapter.findByIdAndDelete(chapterId);

      course.chapters = course.chapters.filter(
        (id) => id.toString() !== chapterId
      );
      await course.save();

      res.status(200).json({ success: true, msg: "Chapter deleted" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, msg: "Error while deleting chapter" });
    }
  }
);
module.exports = {
  adminRouter,
};
