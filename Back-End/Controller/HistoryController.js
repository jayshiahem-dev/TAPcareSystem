const HistoryDistribution = require("../Models/HistorySchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Ayuda = require("../Models/AyudaSchema");
const mongoose = require("mongoose");

exports.DisplayHistoryTodayDistribution = AsyncErrorHandler(
  async (req, res) => {
    try {
      const {
        search = "",
        municipality = "",
        barangay = "",
        page = 1,
        limit = 20,
      } = req.query;

      const currentPage = Math.max(parseInt(page), 1);
      const perPage = Math.max(parseInt(limit), 1);
      const skip = (currentPage - 1) * perPage;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const matchStage = {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: "Released",
      };

      if (search) {
        matchStage.$or = [
          { residentName: { $regex: search, $options: "i" } },
          { rfid: { $regex: search, $options: "i" } },
          { contact: { $regex: search, $options: "i" } },
          { categoryName: { $regex: search, $options: "i" } },
        ];
      }
      if (municipality)
        matchStage.municipality = { $regex: municipality, $options: "i" };
      if (barangay) matchStage.barangay = { $regex: barangay, $options: "i" };

      const aggregation = await Ayuda.aggregate([
        { $match: matchStage },

        // 🔹 Lookup assistance
        {
          $lookup: {
            from: "assistanceassigns",
            localField: "assistanceId",
            foreignField: "_id",
            as: "assistance",
          },
        },
        { $unwind: { path: "$assistance", preserveNullAndEmptyArrays: true } },

        // 🔹 Lookup officer
        {
          $lookup: {
            from: "officers",
            localField: "userId",
            foreignField: "_id",
            as: "officer",
          },
        },
        { $unwind: { path: "$officer", preserveNullAndEmptyArrays: true } },

        // 🔹 Lookup Resident
        {
          $lookup: {
            from: "residents",
            localField: "beneficiaryId",
            foreignField: "_id",
            as: "resident",
          },
        },
        { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },

        // 🔹 Lookup Beneficiary
        {
          $lookup: {
            from: "beneficiaries",
            localField: "beneficiaryId",
            foreignField: "_id",
            as: "beneficiary",
          },
        },
        { $unwind: { path: "$beneficiary", preserveNullAndEmptyArrays: true } },

        // 🔹 Add fields for display
        {
          $addFields: {
            assistanceName: "$assistance.assistanceName",
            assistanceDistributionType: "$assistance.distributionType",
            assistanceCategoryId: "$assistance.categoryId",
            officerName: {
              $cond: [
                { $gt: ["$officer", null] },
                { $concat: ["$officer.first_name", " ", "$officer.last_name"] },
                "N/A",
              ],
            },
            officerAvatar: "$officer.avatar.url",
            assistanceIdLink: "$assistanceId",
            beneficiaryIdLink: "$beneficiaryId",
            beneficiaryName: {
              $cond: [
                { $eq: ["$beneficiaryModel", "Resident"] },
                {
                  $trim: {
                    input: {
                      $concat: [
                        "$resident.firstname",
                        " ",
                        "$resident.middlename",
                        " ",
                        "$resident.lastname",
                        " ",
                        "$resident.suffix",
                      ],
                    },
                  },
                },
                {
                  $trim: {
                    input: {
                      $concat: [
                        "$beneficiary.firstname",
                        " ",
                        "$beneficiary.middlename",
                        " ",
                        "$beneficiary.lastname",
                        " ",
                        "$beneficiary.suffix",
                      ],
                    },
                  },
                },
              ],
            },
          },
        },

        { $sort: { distributionDate: -1 } },

        {
          $facet: {
            metadata: [{ $count: "totalRecords" }],
            data: [{ $skip: skip }, { $limit: perPage }],
          },
        },
      ]);

      const totalRecords = aggregation[0].metadata[0]?.totalRecords || 0;
      const totalPages = Math.ceil(totalRecords / perPage) || 1;
      const data = aggregation[0].data;

      res.status(200).json({
        status: "success",
        totalRecords,
        currentPage,
        totalPages,
        limit: perPage,
        data,
      });
    } catch (error) {
      console.error("Error fetching history distribution:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch",
        error: error.message,
      });
    }
  },
);

exports.DisplayHistoryDistribution = async (req, res) => {
  try {
    const data = await HistoryDistribution.aggregate([
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

exports.displayHistoryBenificiaryAssistance = async (req, res) => {
  try {
    const { assistanceId } = req.params;
    const { scheduleDate, page = 1, limit = 4, search = "", municipality = "", barangay = "" } = req.query;

    const p = parseInt(page);
    const l = parseInt(limit);

    const cleanSearch = search.replace(/\+/g, " ").trim();
    const cleanMuni = municipality.trim();
    const cleanBarangay = barangay.trim();

    const pipeline = [
      // Lookup program
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

      // Lookup residents & beneficiaries (index-friendly)
      { $lookup: { from: "residents", localField: "beneficiaryId", foreignField: "_id", as: "residentInfo" } },
      { $lookup: { from: "beneficiaries", localField: "beneficiaryId", foreignField: "_id", as: "beneficiaryInfo" } },

      // Merge beneficiary info
      {
        $addFields: {
          beneficiary: {
            $mergeObjects: [
              { $ifNull: [{ $arrayElemAt: ["$residentInfo", 0] }, { $arrayElemAt: ["$beneficiaryInfo", 0] }] },
              { status: "$status" },
            ],
          },
          fullName: { $concat: ["$beneficiary.lastname", ", ", "$beneficiary.firstname"] },
        },
      },

      // Filters
      {
        $match: {
          $and: [
            assistanceId ? { "program._id": new mongoose.Types.ObjectId(assistanceId) } : {},
            scheduleDate ? { "program.scheduleDate": new Date(scheduleDate) } : {},
            { $or: [{ "program.Archived": false }, { program: null }] },
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
          ],
        },
      },

      // Group per assistance program
      {
        $group: {
          _id: { assistanceName: "$program.assistanceName", scheduleDate: "$program.scheduleDate" },
          assistanceId: { $first: "$program._id" },
          assistanceName: { $first: "$program.assistanceName" },
          beneficiaryLimit: { $first: "$program.beneficiaryLimit" },
          categoryName: { $first: "$category.categoryName" },
          status: { $first: "$status" },
          beneficiaries: { $push: "$beneficiary" },
          totalBeneficiaries: { $sum: 1 },
        },
      },

      // Pagination on grouped beneficiaries
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

    const data = await HistoryDistribution.aggregate(pipeline);

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
    console.error("displayHistoryBenificiaryAssistance Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
