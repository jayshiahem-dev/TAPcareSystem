const express = require("express");
const router = express.Router();
const AssistanceController = require("../Controller/AssistanceController");
const authController = require("../Controller/authController");
router
  .route("/")
  .get(authController.protect, AssistanceController.DisplayAssistances)
  .post(authController.protect, AssistanceController.CreateAssistance);
router
  .route("/DisplayAllAssistances")
  .get(authController.protect, AssistanceController.DisplayAllAssistances);
router
  .route("/GetLatestAssistance")
  .get(authController.protect, AssistanceController.GetLatestAssistance);

router
  .route("/:id")
  .patch(authController.protect, AssistanceController.UpdateAssistance)
  .delete(authController.protect, AssistanceController.DeleteAssistance);

router
  .route("/RfidID")
  .post(
    authController.protect,
    AssistanceController.MoveAssignToReleasedStatusOnly,
  );

router
  .route("/DisplayResidentAssistanceByRFID/:rfid")
  .post(
    authController.protect,
    AssistanceController.DisplayResidentAssistanceByRFID,
  );

router
  .route("/report")
  .post(authController.protect, AssistanceController.GenerateAssistanceReport);

router
  .route("/updateStatusCreated/:id")
  .patch(authController.protect, AssistanceController.updateStatusCreated);

module.exports = router;
