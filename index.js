require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

//Import des routes
const signupRoutes = require("./routes/signup");
const loginRoutes = require("./routes/login");
const offerRoutes = require("./routes/offer");
const offersRoutes = require("./routes/offers");

//Utilisation des routes
app.use(signupRoutes);
app.use(loginRoutes);
app.use(offerRoutes);
app.use(offersRoutes);

app.all("*", (req, res) => {
  res.status(404).json("Page not found");
});

app.listen(process.env.PORT, () => {
  console.log("server started");
});
