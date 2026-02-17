const express = require("express");
const router = express.Router();
const categoryController = require("../Controller/CategoryController");
const authController = require("../Controller/authController");
router
  .route("/")
  .get(authController.protect, categoryController.DisplayCategories)
  .post(authController.protect, categoryController.CreateCategory);

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrict("admin","superadmin"),
    categoryController.UpdateCategory,
  )
  .delete(
    authController.protect,
    authController.restrict("admin","superadmin"),
    categoryController.DeleteCategory,
  );

module.exports = router;
