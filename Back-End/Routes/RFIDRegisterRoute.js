const express = require("express");
const router = express.Router();
const RFIDRegisterController = require("../Controller/RFIDController");
const authController = require("../Controller/authController");
router
  .route("/")
  .get(
    authController.protect,
    authController.restrict("superadmin"),
    RFIDRegisterController.getAllRFID,
  )
  .post(
    authController.protect,
    authController.restrict("superadmin"),
    RFIDRegisterController.createRFID,
  );

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrict("superadmin"),
    RFIDRegisterController.updateRFID,
  )
  .delete(
    authController.protect,
    authController.restrict("superadmin"),
    RFIDRegisterController.deleteRFID,
  );

module.exports = router;
