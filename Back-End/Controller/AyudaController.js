const Ayuda = require("../Models/AyudaSchema");
const mongoose = require("mongoose");
const HistoryDistribution = require("../Models/HistorySchema");
const AssistanceAssign = require("../Models/AssistanceAssign");

exports.releaseAssistanceAndDeleteAyuda = async (req, res) => {
  try {
    const { assistanceId } = req.body;
    if (!assistanceId) {
      return res.status(400).json({
        success: false,
        message: "assistanceId is required",
      });
    }

    const assistanceObjectId = new mongoose.Types.ObjectId(assistanceId);

    // 🔹 1. Find all Ayuda records for this assistanceId
    const ayudaRecords = await Ayuda.find({ assistanceId: assistanceObjectId });

    if (!ayudaRecords || ayudaRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Ayuda records found for this assistanceId",
      });
    }

    // 🔹 2. Extract beneficiaryIds from the found Ayuda records
    const beneficiaryIds = ayudaRecords.map((record) => record.beneficiaryId);

    // 🔹 3. Prepare history documents
    const historyDocs = beneficiaryIds.map((beneficiaryId) => ({
      assistanceId: assistanceObjectId,
      beneficiaryId: beneficiaryId,
      beneficiaryModel: "Resident", // o "Beneficiary" kung ibang model
      status: "Released",
    }));

    // 🔹 4. Insert into HistoryDistribution
    await HistoryDistribution.insertMany(historyDocs);

    // 🔹 5. Delete only the Ayuda records that match both assistanceId and the beneficiaries
    const deleteResult = await Ayuda.deleteMany({
      assistanceId: assistanceObjectId,
      beneficiaryId: { $in: beneficiaryIds },
    });

    return res.status(200).json({
      success: true,
      message: `History inserted and ${deleteResult.deletedCount} Ayuda record(s) deleted successfully`,
    });
  } catch (error) {
    console.error("releaseAssistanceAndDeleteAyuda Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.assignAyuda = async (req, res) => {
  try {
    const { assistanceId, residentIds } = req.body;
    const io = req.app.get("io");

    if (!assistanceId || !Array.isArray(residentIds)) {
      return res.status(400).json({
        success: false,
        message: "assistanceId and residentIds array are required",
      });
    }

    if (residentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No residents provided",
      });
    }

    const assistanceObjectId = new mongoose.Types.ObjectId(assistanceId);

    const validResidentObjectIds = residentIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validResidentObjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid resident IDs",
      });
    }

    // =========================
    // 🔎 GET ASSISTANCE & LIMIT
    // =========================
    const assistance = await AssistanceAssign.findById(assistanceObjectId);

    if (!assistance) {
      return res.status(404).json({
        success: false,
        message: "Assistance not found",
      });
    }

    const limit = assistance.beneficiaryLimit || 0;
    const currentCount = await Ayuda.countDocuments({
      assistanceId: assistanceObjectId,
    });
    const remainingSlotsInitial = limit - currentCount;

    // =========================
    // ✅ SINGLE MODE
    // =========================
    if (validResidentObjectIds.length === 1) {
      const singleId = validResidentObjectIds[0];

      const existing = await Ayuda.findOne({
        assistanceId: assistanceObjectId,
        beneficiaryId: singleId,
      });

      // 🔄 REMOVE
      if (existing) {
        await Ayuda.deleteOne({ _id: existing._id });

        // 🔥 Emit only assistanceId
        io.emit("AyudaCreate", assistanceObjectId.toString());

        return res.status(200).json({
          success: true,
          mode: "single",
          action: "removed",
          message: "Ayuda removed",
        });
      }

      // ➕ ADD (check limit)
      if (remainingSlotsInitial <= 0) {
        return res.status(400).json({
          success: false,
          message: `Beneficiary limit reached. 0 slot remaining.`,
          remainingSlots: 0,
          limit,
          currentCount,
        });
      }

      await Ayuda.create({
        assistanceId: assistanceObjectId,
        beneficiaryId: singleId,
        beneficiaryModel: "Resident",
      });

      // 🔥 Emit only assistanceId
      io.emit("AyudaCreate", assistanceObjectId.toString());

      return res.status(201).json({
        success: true,
        mode: "single",
        action: "added",
        message: `Ayuda assigned. Remaining slot(s): ${remainingSlotsInitial - 1}`,
        remainingSlots: remainingSlotsInitial - 1,
        limit,
        currentCount: currentCount + 1,
      });
    }

    // =========================
    // ✅ BULK MODE
    // =========================
    const existingRecords = await Ayuda.find({
      assistanceId: assistanceObjectId,
      beneficiaryId: { $in: validResidentObjectIds },
    });

    // 🔄 BULK REMOVE
    if (existingRecords.length === validResidentObjectIds.length) {
      await Ayuda.deleteMany({
        assistanceId: assistanceObjectId,
        beneficiaryId: { $in: validResidentObjectIds },
      });

      // 🔥 Emit only assistanceId
      io.emit("AyudaCreate", assistanceObjectId.toString());

      return res.status(200).json({
        success: true,
        mode: "bulk",
        action: "removed_all",
        message: `Bulk removal successful. ${existingRecords.length} record(s) deleted.`,
      });
    }

    // ➕ BULK ADD
    const existingCount = existingRecords.length;
    const newToInsert = validResidentObjectIds.length - existingCount;
    const remainingSlots = limit - currentCount;

    if (remainingSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: `Beneficiary limit reached. 0 slot remaining.`,
        remainingSlots: 0,
        limit,
        currentCount,
      });
    }

    if (newToInsert > remainingSlots) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingSlots} slot(s) remaining. You tried to add ${newToInsert}.`,
        remainingSlots,
        attemptedToAdd: newToInsert,
        limit,
        currentCount,
      });
    }

    const operations = validResidentObjectIds.map((id) => ({
      updateOne: {
        filter: { assistanceId: assistanceObjectId, beneficiaryId: id },
        update: {
          $setOnInsert: {
            assistanceId: assistanceObjectId,
            beneficiaryId: id,
            beneficiaryModel: "Resident",
          },
        },
        upsert: true,
      },
    }));

    await Ayuda.bulkWrite(operations);

    // 🔥 Emit only assistanceId once after bulk insert
    io.emit("AyudaCreate", assistanceObjectId.toString());

    return res.status(201).json({
      success: true,
      mode: "bulk",
      action: "added_all",
      message: `Bulk assignment successful. Remaining slot(s): ${remainingSlots - newToInsert}`,
      remainingSlots: remainingSlots - newToInsert,
      addedCount: newToInsert,
      limit,
      currentCount: currentCount + newToInsert,
    });
  } catch (error) {
    console.error("assignAyuda Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.displayGroupedPrograms = async (req, res) => {
  try {
    const data = await Ayuda.aggregate([
      // 🔹 Join AssistanceAssign
      {
        $lookup: {
          from: "assistanceassigns", // collection name
          localField: "assistanceId",
          foreignField: "_id",
          as: "program",
        },
      },
      {
        $unwind: {
          path: "$program",
          preserveNullAndEmptyArrays: true, // keep old/missing links
        },
      },

      // 🔹 Join Category
      {
        $lookup: {
          from: "categories",
          localField: "program.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔹 Optional: exclude archived programs
      {
        $match: {
          $or: [
            { "program.Archived": false },
            { program: null }, // include old data
          ],
        },
      },

      // 🔹 Group by assistanceName + scheduleDate
      {
        $group: {
          _id: {
            assistanceName: "$program.assistanceName",
            scheduleDate: "$program.scheduleDate",
          },
          assistanceId: { $first: "$program._id" },
          assistanceName: { $first: "$program.assistanceName" },
          beneficiaryLimit: { $first: "$program.beneficiaryLimit" },
          categoryName: { $first: "$category.categoryName" },
          status: { $first: "$program.status" },
        },
      },

      // 🔹 Cap totalBeneficiaries by beneficiaryLimit (optional)
      {
        $addFields: {
          totalBeneficiaries: {
            $cond: [
              { $gt: ["$totalBeneficiaries", "$beneficiaryLimit"] },
              "$beneficiaryLimit",
              "$totalBeneficiaries",
            ],
          },
        },
      },

      // 🔹 Final projection
      {
        $project: {
          _id: 0,
          assistanceId: 1,
          assistanceName: 1,
          beneficiaryLimit: 1,
          scheduleDate: "$_id.scheduleDate",
          categoryName: 1,
          status: 1,
          totalBeneficiaries: 1,
        },
      },

      // 🔹 Sort by latest scheduleDate
      { $sort: { scheduleDate: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("displayGroupedPrograms Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.displayBenificiaryAssistance = async (req, res) => {
  try {
    const { assistanceId } = req.params;
    const {
      scheduleDate,
      page = 1,
      limit = 4,
      search = "",
      municipality = "",
      barangay = "",
    } = req.query;

    const p = parseInt(page);
    const l = parseInt(limit);

    const cleanSearch = search.replace(/\+/g, " ").trim();
    const cleanMuni = municipality.trim();
    const cleanBarangay = barangay.trim();

    // --- Pipeline
    const pipeline = [
      // Lookup assistance program
      {
        $lookup: {
          from: "assistanceassigns",
          localField: "assistanceId",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },

      // Lookup category
      {
        $lookup: {
          from: "categories",
          localField: "program.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // Lookup beneficiary info
      {
        $lookup: {
          from: "residents",
          localField: "beneficiaryId",
          foreignField: "_id",
          as: "residentInfo",
        },
      },
      {
        $lookup: {
          from: "beneficiaries",
          localField: "beneficiaryId",
          foreignField: "_id",
          as: "beneficiaryInfo",
        },
      },

      // Merge beneficiary info
      {
        $addFields: {
          beneficiary: {
            $mergeObjects: [
              { $ifNull: [{ $arrayElemAt: ["$residentInfo", 0] }, { $arrayElemAt: ["$beneficiaryInfo", 0] }] },
              { status: "$status" },
            ],
          },
        },
      },

      // Compute fullName
      {
        $addFields: {
          fullName: {
            $concat: ["$beneficiary.lastname", ", ", "$beneficiary.firstname"],
          },
        },
      },

      // --- Filters
      {
        $match: {
          $and: [
            assistanceId ? { "program._id": new mongoose.Types.ObjectId(assistanceId) } : {},
            scheduleDate ? { "program.scheduleDate": new Date(scheduleDate) } : {},
            cleanSearch
              ? {
                  $or: [
                    { fullName: { $regex: cleanSearch, $options: "i" } },
                    { "beneficiary.firstname": { $regex: cleanSearch, $options: "i" } },
                    { "beneficiary.lastname": { $regex: cleanSearch, $options: "i" } },
                    { "beneficiary.household_id": { $regex: cleanSearch, $options: "i" } },
                  ],
                }
              : {},
            cleanMuni ? { "beneficiary.municipality": { $regex: cleanMuni, $options: "i" } } : {},
            cleanBarangay ? { "beneficiary.barangay": { $regex: cleanBarangay, $options: "i" } } : {},
            { $or: [{ "program.Archived": false }, { program: null }] },
          ],
        },
      },

      // --- Group per assistance program
      {
        $group: {
          _id: {
            assistanceName: "$program.assistanceName",
            scheduleDate: "$program.scheduleDate",
          },
          assistanceId: { $first: "$program._id" },
          assistanceName: { $first: "$program.assistanceName" },
          beneficiaryLimit: { $first: "$program.beneficiaryLimit" },
          categoryName: { $first: "$category.categoryName" },
          status: { $first: "$status" },
          beneficiaries: { $push: "$beneficiary" },
          totalBeneficiaries: { $sum: 1 },
        },
      },

      // --- Pagination at projection
      {
        $project: {
          _id: 0,
          assistanceId: 1,
          assistanceName: 1,
          beneficiaryLimit: 1,
          scheduleDate: "$_id.scheduleDate",
          categoryName: 1,
          status: 1,
          totalBeneficiaries: 1,
          beneficiaries: { $slice: ["$beneficiaries", (p - 1) * l, l] },
        },
      },

      { $sort: { scheduleDate: -1 } },
    ];

    const data = await Ayuda.aggregate(pipeline);
    const totalRecords = data.length > 0 ? data[0].totalBeneficiaries : 0;
    const totalPages = Math.ceil(totalRecords / l);

    res.status(200).json({
      success: true,
      currentPage: p,
      totalPages: totalPages || 1,
      totalRecords,
      data,
    });
  } catch (error) {
    console.error("displayBenificiaryAssistance Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
