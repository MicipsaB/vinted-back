const express = require("express");
const Offer = require("../models/Offer");

const router = express.Router();

router.get("/offers", async (req, res) => {
  try {
    //Ajouter des filtres

    const filters = {};

    //si je reçois un filtre title
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    //-----------------------------------------------------------------

    //si je reçois un filtre priceMin et priceMax
    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }

    //si je reçois un filtre priceMax uniquement
    if (req.query.priceMax && !req.query.priceMin) {
      filters.product_price = { $lte: req.query.priceMax };
    }

    //si je reçois un filtre priceMin uniquement
    if (!req.query.priceMax && req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }

    //----------------------------------------------------------

    //selon page *********************
    let page = 1;
    let limit = 4;

    if (req.query.page) {
      page = req.query.page;
    }
    const skip = limit * page - limit;

    //--------------------------------------------------
    //trier les éléments

    const direction = {};
    if (req.query.sort) {
      if (req.query.sort === "price-desc") {
        direction.product_price = -1;
      } else if (req.query.sort === "price-asc") {
        direction.product_price = 1;
      }
    }

    //---------------------------------------------------

    //Construire notre requette à la BDD

    const offersTab = await Offer.find(filters)
      .sort(direction)
      .limit(limit)
      .skip(skip)
      .populate("owner", "account");
    //.select("product_name product_price -_id");
    //----------------------------------------------------------------

    //on retourn le résultat de la recherche
    res.status(200).json(offersTab);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
