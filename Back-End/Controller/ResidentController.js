const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Resident = require("../Models/ResidentSchema");
const ExcelJS = require("exceljs");
const { Readable } = require("stream");

const RfidActive = require("../Models/RFIDActiveSchema");

const Beneficiary = require("../Models/BenificiarySchema");

exports.CreateResident = AsyncErrorHandler(async (req, res) => {
  try {
    console.log("req.body", req.body);

    const { household_id, relationship } = req.body;

    const payload = {
      ...req.body,
      role: relationship,
    };

    let data;

    const existingHousehold = await Resident.findOne({ household_id });

    if (existingHousehold) {

      data = await Beneficiary.create(payload);
    } else {
   
      data = await Resident.create(payload);
    }

    res.status(201).json({
      success: true,
      message: existingHousehold
        ? "Saved as Beneficiary"
        : "Saved as Resident",
      data,
    });
  } catch (error) {
    console.error("Error creating resident:", error);

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


exports.UpdateResidentRFID = async (req, res) => {
  try {
    const { id } = req.params;
    const { rfid } = req.body;

    if (!rfid) {
      return res.status(400).json({ message: "RFID value is required" });
    }

    const activeRfid = await RfidActive.findOne({
      rfidNumber: rfid,
      status: "Active",
    });

    if (!activeRfid) {
      return res.status(400).json({
        message: "RFID not found or already assigned",
      });
    }

    const residentRFID = await Resident.findOne({
      rfid,
      _id: { $ne: id },
    });

    if (residentRFID) {
      return res.status(400).json({
        message: "RFID already assigned to another resident",
      });
    }

    const beneficiaryRFID = await Beneficiary.findOne({
      rfid,
      _id: { $ne: id },
    });

    if (beneficiaryRFID) {
      return res.status(400).json({
        message: "RFID already assigned to another beneficiary",
      });
    }

    let record = await Resident.findById(id);
    let modelUsed = "resident";

    if (!record) {
      record = await Beneficiary.findById(id);
      modelUsed = "beneficiary";
    }

    if (!record) {
      return res.status(404).json({
        message: "Resident or Beneficiary not found",
      });
    }

    record.rfid = rfid;
    record.lastUpdated = new Date();
    await record.save();

    activeRfid.status = "Assigned";
    activeRfid.assignedAt = new Date();
    await activeRfid.save();

    res.status(200).json({
      success: true,
      message: "RFID assigned successfully",
      updatedFrom: modelUsed,
      data: record,
    });
  } catch (error) {
    console.error("Error updating RFID:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.DisplayResidents = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      search = "",
      municipality = "",
      barangay = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);

    const residentMatch = {};

    if (search) {
      const cleanSearch = search.trim();
      const words = cleanSearch.split(/\s+/);

      residentMatch.$and = words.map((w) => ({
        $or: [
          { firstname: { $regex: w, $options: "i" } },
          { middlename: { $regex: w, $options: "i" } },
          { lastname: { $regex: w, $options: "i" } },
          { rfid: { $regex: w, $options: "i" } },
        ],
      }));
    }

    if (municipality) {
      residentMatch.municipality = {
        $regex: municipality.trim(),
        $options: "i",
      };
    }

    if (barangay) {
      residentMatch.barangay = { $regex: barangay.trim(), $options: "i" };
    }

    const residents = await Resident.find(residentMatch)
      .sort({ createdAt: -1 })
      .skip(0) 
      .limit(100) 
      .lean();

    const householdIds = residents.map((r) => r.household_id);

    const beneficiaries = await Beneficiary.find({
      household_id: { $in: householdIds },
    }).lean();

    let flatList = [];
    residents.forEach((r) => {
      flatList.push({ type: "resident", ...r });

      const matchedBeneficiaries = beneficiaries
        .filter((b) => b.household_id === r.household_id)
        .map((b) => ({
          type: "beneficiary",
          ...b,
          municipality: r.municipality,
          barangay: r.barangay,
        }));

      flatList.push(...matchedBeneficiaries);
    });

    flatList.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const totalItems = flatList.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginatedData = flatList.slice(start, end);

    res.status(200).json({
      status: "success",
      totalItems,
      currentPage,
      totalPages,
      limit: perPage,
      data: paginatedData,
    });
  } catch (error) {
    console.error(
      "Error fetching Residents + Beneficiaries (flat paginated):",
      error,
    );
    res.status(500).json({
      status: "error",
      message: "Failed to fetch data",
      error: error.message,
    });
  }
});
exports.DisplayResidentById = AsyncErrorHandler(async (req, res) => {
  const residentId = req.params.id;

  const resident = await Resident.findById(residentId);

  if (!resident) {
    return res.status(404).json({
      status: "fail",
      message: "Resident not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: resident,
  });
});

exports.UpdateResident = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    lastUpdated: new Date(),
  };

  let updatedRecord = await Resident.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  let updatedFrom = "resident";

  if (!updatedRecord) {
    updatedRecord = await Beneficiary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    updatedFrom = "beneficiary";
  }

  if (!updatedRecord) {
    return res.status(404).json({
      success: false,
      message: "Resident or Beneficiary not found",
    });
  }

  res.status(200).json({
    success: true,
    message: `${updatedFrom} updated successfully`,
    updatedFrom,
    data: updatedRecord,
  });
});

exports.DeleteResident = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  let deletedRecord = await Resident.findByIdAndDelete(id);
  let deletedFrom = "resident";

  if (!deletedRecord) {
    deletedRecord = await Beneficiary.findByIdAndDelete(id);
    deletedFrom = "beneficiary";
  }


  if (!deletedRecord) {
    return res.status(404).json({
      success: false,
      message: "Resident or Beneficiary not found",
    });
  }

  res.status(200).json({
    success: true,
    message: `${deletedFrom} deleted successfully`,
    deletedFrom,
    data: null,
  });
});

exports.GetBarangaysByMunicipality = AsyncErrorHandler(async (req, res) => {
  try {
    const { municipality } = req.query;

    if (!municipality) {
      return res.status(400).json({
        status: "error",
        message: "Municipality is required",
      });
    }

    const barangays = await Resident.distinct("barangay", {
      municipality: { $regex: `^${municipality}$`, $options: "i" },
    });

    res.status(200).json({
      status: "success",
      total: barangays.length,
      data: barangays,
    });
  } catch (error) {
    console.error("Error fetching barangays:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch barangays",
      error: error.message,
    });
  }
});

exports.DisplayResidentByRFID = AsyncErrorHandler(async (req, res) => {
  try {
    let { rfid } = req.params;

    if (!rfid) {
      return res.status(400).json({
        status: "fail",
        message: "RFID is required",
      });
    }

    rfid = rfid.replace(/^RFID/i, "").trim();

    const resident = await Resident.findOne({ rfid });

    if (!resident) {
      return res.status(404).json({
        status: "fail",
        message: "No resident found with this RFID",
      });
    }

    res.status(200).json({
      status: "success",
      data: resident,
    });
  } catch (error) {
    console.error("Error fetching resident by RFID:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch resident",
      error: error.message,
    });
  }
});

const ALLOWED_GENDERS = ["Male", "Female"];
const ALLOWED_CIVIL_STATUS = ["Single", "Married", "Widowed", "Separated"];
const ALLOWED_EMPLOYMENT_STATUS = [
  "Employed",
  "Unemployed",
  "Self-Employed",
  "Student",
  "Retired",
];
const ALLOWED_CLASSIFICATIONS = [
  "PWD",
  "Solo Parent",
  "Student",
  "Senior Citizen",
];
const ALLOWED_STATUS = ["Active", "Inactive"];
exports.UploadResidentsExcel = AsyncErrorHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
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
    } else if (
      mimetype === "text/csv" ||
      req.file.originalname.endsWith(".csv")
    ) {
      const stream = Readable.from(req.file.buffer);
      await workbook.csv.read(stream);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Only XLSX, XLS, or CSV allowed",
      });
    }

    const worksheet = workbook.worksheets[0]; 
    const insertedResidents = [];
    const insertedBeneficiaries = [];
    const skippedRows = [];

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values.slice(1).map((h) => h.toString().trim());

    const parseDate = (val) => {
      if (!val) return new Date("2000-01-01");
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date("2000-01-01") : d;
    };

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; 

      const rowData = {};
      row.values.slice(1).forEach((cell, idx) => {
        rowData[headers[idx]] = cell;
      });

      const isBeneficiary =
        rowData.relationship && rowData.relationship.toString().trim() !== "";

      if (isBeneficiary) {
        const beneficiary = {
          firstname: rowData.firstname?.toString().trim() || "Unknown",
          middlename: rowData.middlename?.toString().trim() || "",
          lastname: rowData.lastname?.toString().trim() || "Unknown",
          suffix: rowData.suffix?.toString() || "",
          household_id: rowData.household_id?.toString() || "N/A",
          relationship: rowData.relationship?.toString().trim(),
          gender: ALLOWED_GENDERS.includes(rowData.gender)
            ? rowData.gender
            : "Female",
          religion: rowData.religion?.toString() || "",
          age: Number(rowData.age) || 0,
          birth_date: parseDate(rowData.birth_date),
          birth_place: rowData.birth_place?.toString() || "",
          contact_number: rowData.contact_number?.toString() || "",
          educational_status: rowData.educational_status?.toString() || "",
          educational_year: rowData.educational_year?.toString() || "",
          course: rowData.course?.toString() || "",
          school: rowData.school?.toString() || "",
          status: ALLOWED_STATUS.includes(rowData.status)
            ? rowData.status
            : "Active",
          rfid: rowData.rfid?.toString() || null,
          _rowNumber: rowNumber,
        };
        insertedBeneficiaries.push(beneficiary);
      } else {
        const resident = {
          household_id: rowData.household_id?.toString() || "N/A",
          firstname: rowData.firstname?.toString().trim() || "Unknown",
          middlename: rowData.middlename?.toString().trim() || "",
          lastname: rowData.lastname?.toString().trim() || "Unknown",
          nickname: rowData.nickname?.toString() || "",
          suffix: rowData.suffix?.toString() || "",
          role: rowData.role?.toString() || "Resident",
          gender: ALLOWED_GENDERS.includes(rowData.gender)
            ? rowData.gender
            : "Female",
          religion: rowData.religion?.toString() || "",
          civil_status: ALLOWED_CIVIL_STATUS.includes(rowData.civil_status)
            ? rowData.civil_status
            : "Single",
          birth_date: parseDate(rowData.birth_date),
          birth_place: rowData.birth_place?.toString() || "",
          contact_number: rowData.contact_number?.toString() || "",
          employment_status: ALLOWED_EMPLOYMENT_STATUS.includes(
            rowData.employment_status,
          )
            ? rowData.employment_status
            : "Unemployed",
          classifications: Array.isArray(rowData.classifications)
            ? rowData.classifications.filter((c) =>
                ALLOWED_CLASSIFICATIONS.includes(c),
              )
            : [],
          address: rowData.address?.toString() || "Unknown",
          barangay: rowData.barangay?.toString() || "Unknown",
          sitio: rowData.sitio?.toString() || "",
          municipality: rowData.municipality?.toString() || "Unknown",
          occupation: rowData.occupation?.toString() || "",
          rfid: rowData.rfid?.toString() || null,
          status: ALLOWED_STATUS.includes(rowData.status)
            ? rowData.status
            : "Active",
          _rowNumber: rowNumber,
        };
        insertedResidents.push(resident);
      }
    });

    const successfullyInsertedResidents = [];
    const successfullyInsertedBeneficiaries = [];

    for (const resident of insertedResidents) {
      try {
        const exists = await Resident.findOne({
          firstname: resident.firstname,
          middlename: resident.middlename,
          lastname: resident.lastname,
          birth_date: resident.birth_date,
          barangay: resident.barangay,
          municipality: resident.municipality,
        });

        if (exists) {
          skippedRows.push({
            row: resident._rowNumber,
            fullname: `${resident.firstname} ${resident.lastname}`,
            reason: "Already exists as Resident",
          });
          continue;
        }

        delete resident._rowNumber;
        const saved = await Resident.create(resident);
        successfullyInsertedResidents.push(saved);
      } catch (err) {
        console.error(
          "Resident insert failed at row",
          resident._rowNumber,
          err.message,
        );
        skippedRows.push({
          row: resident._rowNumber,
          fullname: `${resident.firstname} ${resident.lastname}`,
          reason: "Resident insert error",
          error: err.message,
        });
      }
    }
    for (const beneficiary of insertedBeneficiaries) {
      try {
        const exists = await Beneficiary.findOne({
          firstname: beneficiary.firstname,
          middlename: beneficiary.middlename,
          lastname: beneficiary.lastname,
          birth_date: beneficiary.birth_date,
          household_id: beneficiary.household_id,
        });

        if (exists) {
          skippedRows.push({
            row: beneficiary._rowNumber,
            fullname: `${beneficiary.firstname} ${beneficiary.lastname}`,
            reason: "Already exists as Beneficiary",
          });
          continue;
        }

        delete beneficiary._rowNumber;
        const saved = await Beneficiary.create(beneficiary);
        successfullyInsertedBeneficiaries.push(saved);
      } catch (err) {
        console.error(
          "Beneficiary insert failed at row",
          beneficiary._rowNumber,
          err.message,
        );
        skippedRows.push({
          row: beneficiary._rowNumber,
          fullname: `${beneficiary.firstname} ${beneficiary.lastname}`,
          reason: "Beneficiary insert error",
          error: err.message,
        });
      }
    }

    const allSavedResidents = await Resident.find({
      _id: { $in: successfullyInsertedResidents.map((r) => r._id) },
    });

    const allSavedBeneficiaries = await Beneficiary.find({
      _id: { $in: successfullyInsertedBeneficiaries.map((b) => b._id) },
    });

    res.status(201).json({
      success: true,
      message: "Upload processed with full report",
      insertedResidents: allSavedResidents.length,
      insertedBeneficiaries: allSavedBeneficiaries.length,
      skipped: skippedRows.length,
      skippedDetails: skippedRows,
      residents: allSavedResidents,
      beneficiaries: allSavedBeneficiaries,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload residents/beneficiaries",
      error: error.message,
    });
  }
});
