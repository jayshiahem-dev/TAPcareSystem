const express = require("express");
const router = express.Router();
const uploadExcel = require("../middleware/uploadExcel");

const ResidentController = require("../Controller/ResidentController");
const authController = require("../Controller/authController");
router
  .route("/")
  .get(authController.protect, ResidentController.DisplayResidents)
  .post(
    authController.protect,
    authController.restrict("admin","superadmin"),
    ResidentController.CreateResident,
  );

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrict("admin","superadmin"),
    ResidentController.UpdateResident,
  )
  .delete(
    authController.protect,
    authController.restrict("admin","superadmin"),
    ResidentController.DeleteResident,
  );

router
  .route("/UpdateResidentRFID/:id")
  .patch(authController.protect, ResidentController.UpdateResidentRFID);

router
  .route("/GetBarangaysByMunicipality")
  .get(authController.protect, ResidentController.GetBarangaysByMunicipality);

router
  .route("/DisplayResidentByRFID/:rfid")
  .post(authController.protect, ResidentController.DisplayResidentByRFID);

router
  .route("/upload-excel")
  .post(
    authController.protect,
    uploadExcel.single("file"),
    authController.restrict("admin","superadmin"),
    ResidentController.UploadResidentsExcel,
  );

module.exports = router;
