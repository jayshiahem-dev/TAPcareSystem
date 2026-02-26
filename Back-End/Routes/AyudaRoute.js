const express = require("express");
const router = express.Router();
const AyudaController = require("../Controller/AyudaController");
const authController = require("../Controller/authController");
router.route("/").post(authController.protect, AyudaController.assignAyuda);
router
  .route("/displayGroupedPrograms")
  .get(authController.protect, AyudaController.displayGroupedPrograms);

router
  .route("/displayBenificiaryAssistance/:assistanceId")
  .get(authController.protect, AyudaController.displayBenificiaryAssistance);

router
  .route("/deleteAyuda")
  .delete(
    authController.protect,
    AyudaController.releaseAssistanceAndDeleteAyuda,
  );

module.exports = router;
