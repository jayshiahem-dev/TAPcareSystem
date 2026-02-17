
const express = require("express");
const router = express.Router();//express router
const SuperAdminController=require('../Controller/SuperAdminController')
const authController = require('./../Controller/authController')
const upload = require("../middleware/fileUploader");
router.route('/')
    .get(authController.protect,SuperAdminController.DisplaySuperAdmin)



router.route('/:id')
    .delete(authController.protect,SuperAdminController.deleteSuperAdmin)
    .patch(authController.protect, upload.single("avatar"),SuperAdminController.UpdateSuperAdmin)




module.exports = router;