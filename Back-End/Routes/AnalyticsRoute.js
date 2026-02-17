const express = require("express");
const router = express.Router();

const AnalyticsController = require("../Controller/AnalyticsController");
const authController = require("../Controller/authController");
router
  .route("/DashboardSummary")
  .get(authController.protect, AnalyticsController.DashboardSummary);


module.exports = router;
