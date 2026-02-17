const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const uploadExcel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      cb(null, true);
    } else {
      cb(
        new Error("Only Excel or CSV files are allowed (.xlsx, .xls, .csv)"),
        false,
      );
    }
  },
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
  },
});

module.exports = uploadExcel;
