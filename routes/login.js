const express = require("express");

const User = require("../models/User");

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

router.post("/user/login", async (req, res) => {
  try {
    //find the user
    const user = await User.findOne({ email: req.body.email });

    //if error in email
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email",
      });
    }

    //generate hash
    const hash = SHA256(req.body.password + user.salt).toString(encBase64);

    //compare the generated hash with the saved one in the database

    if (hash !== user.hash) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    return res.status(200).json({
      _id: user._id,
      token: user.token,
      account: {
        username: user.account.username,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
