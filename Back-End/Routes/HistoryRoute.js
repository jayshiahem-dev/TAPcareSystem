const express = require("express");
const router = express.Router();

const HistoryController = require("../Controller/HistoryController");
const authController = require("../Controller/authController");
router
  .route("/")
  .get(authController.protect, HistoryController.DisplayHistoryDistribution);

router
  .route("/currentDay")
  .get(
    authController.protect,
    HistoryController.DisplayHistoryTodayDistribution,
  );

router
  .route("/displayBenificiaryAssistance/:assistanceId")
  .get(authController.protect, HistoryController.displayHistoryBenificiaryAssistance);

module.exports = router;
