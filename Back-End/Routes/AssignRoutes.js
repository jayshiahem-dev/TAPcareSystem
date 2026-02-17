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
  .route("/:id")
  .patch(authController.protect, AssistanceController.UpdateAssistance)
  .delete(authController.protect, AssistanceController.DeleteAssistance);

router
  .route("/RfidID/:rfid")
  .post(
    authController.protect,
    AssistanceController.MoveAssignToHistoryAndDelete,
  );

router
  .route("/DisplayResidentAssistanceByRFID/:rfid")
  .post(
    authController.protect,
    AssistanceController.DisplayResidentAssistanceByRFID,
  );

router
  .route("/report")
  .post(authController.protect,AssistanceController.GenerateAssistanceReport);

module.exports = router;
