const express = require("express");
const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const convertToBase64 = require("../utils/convertToBase64");

const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      //On récupère l'image à uploadé
      const offerPictureToUpload = req.files.picture;

      //créer une new Offer pour l'enregistrer dans MongoDB
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ETAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],

        owner: req.user,
      });

      //enregistrer l'image dans Cloudinary
      const result = await cloudinary.uploader.upload(
        convertToBase64(offerPictureToUpload),
        { folder: "vinted/offers/" + newOffer._id }
      );

      newOffer.product_image = result;

      //enregistrer l'offre dans mongoDB
      await newOffer.save();

      //retourner res
      res.status(200).json(newOffer);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

//route pour récupérer les détails de l'annonce
router.get("/offer/:id", async (req, res) => {
  const receivedOffer = await Offer.findById(req.params.id);

  //si l'id n'est pas reçu
  if (!receivedOffer) {
    return res.status(400).json({ error: "merci de rentrer un ID valable" });
  }

  return res.status(200).json(receivedOffer);
});

module.exports = router;
