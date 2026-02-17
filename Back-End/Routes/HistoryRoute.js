const express = require("express");
const router = express.Router();

const HistoryController = require("../Controller/HistoryController");
const authController = require("../Controller/authController");
router
  .route("/")
  .get(authController.protect, HistoryController.DisplayHistoryDistribution);

router
  .route("/currentDay")
  .get(authController.protect, HistoryController.DisplayHistoryTodayDistribution);

module.exports = router;
