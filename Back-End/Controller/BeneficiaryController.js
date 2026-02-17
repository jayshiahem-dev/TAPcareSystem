const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Beneficiary = require("../Models/BenificiarySchema");
const ExcelJS = require("exceljs");
const { Readable } = require("stream");
const mongoose = require("mongoose");

const ALLOWED_GENDERS = ["Male", "Female"];
const ALLOWED_STATUS = ["Active", "Inactive"];

exports.CreateBeneficiary = AsyncErrorHandler(async (req, res) => {
  try {
    const beneficiary = await Beneficiary.create(req.body);

    res.status(201).json({
      success: true,
      data: beneficiary,
    });
  } catch (error) {
    console.error("Error creating beneficiary:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create beneficiary",
      error: error.message,
    });
  }
});

exports.DisplayBeneficiaries = AsyncErrorHandler(async (req, res) => {
  try {
    const { search = "", household_id = "", page = 1, limit = 20 } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const query = {};

    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { middlename: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
      ];
    }

    if (household_id) {
      query.household_id = household_id;
    }

    const total = await Beneficiary.countDocuments(query);
    const totalPages = Math.ceil(total / perPage) || 1;

    const beneficiaries = await Beneficiary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      status: "success",
      total,
      currentPage,
      totalPages,
      limit: perPage,
      data: beneficiaries,
    });
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch beneficiaries",
      error: error.message,
    });
  }
});

exports.DisplayBeneficiaryById = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  const beneficiary = await Beneficiary.findById(id);

  if (!beneficiary) {
    return res.status(404).json({
      status: "fail",
      message: "Beneficiary not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: beneficiary,
  });
});

exports.UpdateBeneficiary = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const oldRecord = await Beneficiary.findById(id);
  if (!oldRecord) {
    return res.status(404).json({
      status: "fail",
      message: "Beneficiary not found",
    });
  }

  const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Beneficiary updated successfully",
    data: updatedBeneficiary,
  });
});

exports.DeleteBeneficiary = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const existing = await Beneficiary.findById(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Beneficiary not found",
    });
  }

  await Beneficiary.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Beneficiary deleted successfully",
    data: null,
  });
});


exports.UploadBeneficiariesExcel = AsyncErrorHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const mimetype = req.file.mimetype.toLowerCase();

    if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimetype === "application/vnd.ms-excel"
    ) {
      await workbook.xlsx.load(req.file.buffer);
    } else if (mimetype === "text/csv" || req.file.originalname.endsWith(".csv")) {
      const stream = Readable.from(req.file.buffer.toString());
      await workbook.csv.read(stream);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Only XLSX, XLS, or CSV allowed",
      });
    }

    const worksheet = workbook.worksheets[0];
    const inserted = [];
    const skipped = [];

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values.slice(1).map((h) => h.toString().trim());

    const parseDate = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = {};
      row.values.slice(1).forEach((cell, idx) => {
        rowData[headers[idx]] = cell;
      });

      const beneficiary = {
        household_id: rowData.household_id?.toString() || "N/A",
        firstname: rowData.firstname?.toString().trim() || "Unknown",
        middlename: rowData.middlename?.toString().trim() || "",
        lastname: rowData.lastname?.toString().trim() || "Unknown",
        suffix: rowData.suffix?.toString() || "",
        relationship: rowData.relationship?.toString() || "Member",
        gender: ALLOWED_GENDERS.includes(rowData.gender) ? rowData.gender : "Female",
        religion: rowData.religion?.toString() || "",
        age: Number(rowData.age) || undefined,
        birth_date: parseDate(rowData.birth_date),
        birth_place: rowData.birth_place?.toString() || "",
        contact_number: rowData.contact_number?.toString() || "",
        educational_status: rowData.educational_status?.toString() || "",
        educational_year: rowData.educational_year?.toString() || "",
        course: rowData.course?.toString() || "",
        school: rowData.school?.toString() || "",
        status: ALLOWED_STATUS.includes(rowData.status) ? rowData.status : "Active",
        _rowNumber: rowNumber,
      };

      inserted.push(beneficiary);
    });

    const successfullyInserted = [];

    for (const beneficiary of inserted) {
      try {
        const exists = await Beneficiary.findOne({
          firstname: beneficiary.firstname,
          middlename: beneficiary.middlename,
          lastname: beneficiary.lastname,
          birth_date: beneficiary.birth_date,
          household_id: beneficiary.household_id,
        });

        if (exists) {
          skipped.push({
            row: beneficiary._rowNumber,
            fullname: `${beneficiary.firstname} ${beneficiary.lastname}`,
            reason: "Already exists",
          });
          continue;
        }

        delete beneficiary._rowNumber;
        const saved = await Beneficiary.create(beneficiary);
        successfullyInserted.push(saved);
      } catch (err) {
        skipped.push({
          row: beneficiary._rowNumber,
          fullname: `${beneficiary.firstname} ${beneficiary.lastname}`,
          reason: "Database insert error",
          error: err.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Beneficiaries processed",
      inserted: successfullyInserted.length,
      skipped: skipped.length,
      skippedDetails: skipped,
      data: successfullyInserted,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload beneficiaries",
      error: error.message,
    });
  }
});
