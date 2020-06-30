const express = require("express");
const userRouter = express.Router({ mergeParams: true });
const folderRouter = require("./folders");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");
const Folder = require("../../models/Folder");

// @route POST api/users/register
// @desc Register user
// @access Public
userRouter.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        education_institution: req.body.education_institution,
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then((user) => {
            const likedVideosFolder = new Folder({
              is_required: true,
              folder_name: "Liked Videos",
              added_by: user.id,
            });
            likedVideosFolder.save().then(() => {
              res.json({ message: "User created!" });
            });
          });
        });
      });
    }
  });
});

userRouter.get("/", (req, res) => {
  return res.status(403).json({ message: "Forbidden" });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
userRouter.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

userRouter.post("/getUser", (req, res) => {
  const userId = req.body.user_id;
  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      const payload = {
        name: user.name,
        education_institution: user.education_institution,
      };
      res.status(200).json(payload);
    } else {
      const payload = {
        name: "Deleted User",
      };
      res.status(404).json(payload);
    }
  });
});

userRouter.get("/inLikedVideos", (req, res) => {
  const videoId = req.query.video_id;
  const userId = req.query.user_id;
  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      if (user.liked_videos.includes(videoId)) {
        res.status(200).json({ video_liked: true });
      } else {
        res.status(200).json({ video_liked: false });
      }
    } else {
      res.status(500).json({ error: "Server Error" });
    }
  });
});

userRouter.get("/inDislikedVideos", (req, res) => {
  const videoId = req.query.video_id;
  const userId = req.query.user_id;
  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      if (user.disliked_videos.includes(videoId)) {
        res.status(200).json({ video_disliked: true });
      } else {
        res.status(200).json({ video_disliked: false });
      }
    } else {
      res.status(500).json({ error: "Server Error" });
    }
  });
});

userRouter.post("/addToLikedVideos", (req, res) => {
  const videoId = req.body.video_id;
  const userId = req.body.user_id;

  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      User.updateOne(
        { _id: userId },
        {
          $push: {
            liked_videos: videoId,
          },
        }
      ).then(res.json({ message: "Video added to liked videos!" }));
    } else {
      res.status(500).json({ error: "Server Error" });
    }
  });
});

userRouter.delete("/removeFromLikedVideos", (req, res) => {
  const videoId = req.body.video_id;
  const userId = req.body.user_id;
  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      User.updateOne(
        { _id: userId },
        {
          $pull: {
            liked_videos: videoId,
          },
        }
      ).then(res.json({ message: "Video removed from liked videos!" }));
    } else {
      res.status(500).json({ error: "Server Error" });
    }
  });
});

userRouter.post("/addToDislikedVideos", (req, res) => {
  const videoId = req.body.video_id;
  const userId = req.body.user_id;
  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      User.updateOne(
        { _id: userId },
        {
          $push: {
            disliked_videos: videoId,
          },
        }
      ).then(res.json({ message: "Video added to disliked videos!" }));
    } else {
      res.status(500).json({ error: "Server Error" });
    }
  });
});

userRouter.delete("/removeFromDislikedVideos", (req, res) => {
  const videoId = req.body.video_id;
  const userId = req.body.user_id;
  User.findOne({ _id: userId }).then((user) => {
    // Check if user exists
    if (user) {
      User.updateOne(
        { _id: userId },
        {
          $pull: {
            disliked_videos: videoId,
          },
        }
      ).then(res.json({ message: "Video removed from disliked videos!" }));
    } else {
      res.status(500).json({ error: "Server Error" });
    }
  });
});

userRouter.use("/folders/", folderRouter);

module.exports = userRouter;
