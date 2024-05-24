const express = require("express");
const User = require("../models/User");

//Import des packages pour mdp et token
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const convertToBase64 = require("../utils/convertToBase64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dj2q88eqs",
  api_key: "314766898135614",
  api_secret: "h8YLXUS7hcKaR8lnvdBcpAsTQWg",
});

const router = express.Router();

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    //si le username n'est pas renseigné

    if (!req.body.username) {
      return res.status(400).json({
        message: "Please, insert a username",
      });
    }

    //si l'email renseigné à l'inscription existe déjà dans la base de données

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({
        message: "Email already exists, please insert a different email",
      });
    }

    //On récupère l'image uploadé
    const avatarPhoto = req.files.picture;

    //enregistrer l'image dans Cloudinary
    const result = await cloudinary.uploader.upload(
      convertToBase64(avatarPhoto)
    );

    //generate salt
    const salt = uid2(64);

    //generate hash
    hash = SHA256(req.body.password + salt).toString(encBase64);

    //generate token
    const token = uid2(64);

    //create new Signup
    const newSignup = new User({
      email: req.body.email,
      newsletter: req.body.newsletter,
      account: {
        username: req.body.username,
        avatar: result,
      },
      token: token,
      hash: hash,
      salt: salt,
    });

    //save newSignup in dataBase
    await newSignup.save();

    //generate response
    return res.status(201).json({
      _id: newSignup._id,
      token: newSignup.token,
      account: {
        username: newSignup.account.username,
        avatar: result,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
