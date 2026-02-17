const HistoryDistribution = require("../Models/HistorySchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.DisplayHistoryDistribution = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      search = "",
      municipality = "",
      barangay = "",
      distributionStatus = "",
      statusSelection = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const matchStage = {};

    if (search) {
      matchStage.$or = [
        { residentName: { $regex: search, $options: "i" } },
        { rfid: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
      ];
    }

    if (municipality) {
      matchStage.municipality = { $regex: municipality, $options: "i" };
    }

    if (barangay) {
      matchStage.barangay = { $regex: barangay, $options: "i" };
    }

    if (distributionStatus) {
      matchStage.distributionStatus = distributionStatus;
    }

    if (statusSelection) {
      matchStage.statusSelection = statusSelection;
    }

    const aggregation = await HistoryDistribution.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "officers",
          localField: "userId",
          foreignField: "_id",
          as: "officer",
        },
      },

      {
        $unwind: {
          path: "$officer",
          preserveNullAndEmptyArrays: true, 
        },
      },

      {
        $addFields: {
          categoryName: { $ifNull: ["$categoryName", "0"] },
          categoryDescription: { $ifNull: ["$categoryDescription", ""] },

          officerName: {
            $cond: {
              if: { $gt: ["$officer", null] },
              then: {
                $concat: [
                  "$officer.first_name",
                  " ",
                  "$officer.last_name",
                ],
              },
              else: "N/A",
            },
          },

          officerAvatar: "$officer.avatar.url",
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
      message: "Failed to Fetch",
      error: error.message,
    });
  }
});

exports.DisplayHistoryTodayDistribution = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      search = "",
      municipality = "",
      barangay = "",
      distributionStatus = "",
      statusSelection = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const matchStage = {};
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); 
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); 

    matchStage.createdAt = { $gte: startOfDay, $lte: endOfDay };

    if (search) {
      matchStage.$or = [
        { residentName: { $regex: search, $options: "i" } },
        { rfid: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
      ];
    }

    if (municipality) matchStage.municipality = { $regex: municipality, $options: "i" };
    if (barangay) matchStage.barangay = { $regex: barangay, $options: "i" };
    if (distributionStatus) matchStage.distributionStatus = distributionStatus;
    if (statusSelection) matchStage.statusSelection = statusSelection;

    const aggregation = await HistoryDistribution.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "officers",
          localField: "userId",
          foreignField: "_id",
          as: "officer",
        },
      },
      {
        $unwind: {
          path: "$officer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          categoryName: { $ifNull: ["$categoryName", "0"] },
          categoryDescription: { $ifNull: ["$categoryDescription", ""] },
          officerName: {
            $cond: {
              if: { $gt: ["$officer", null] },
              then: { $concat: ["$officer.first_name", " ", "$officer.last_name"] },
              else: "N/A",
            },
          },
          officerAvatar: "$officer.avatar.url",
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
});


