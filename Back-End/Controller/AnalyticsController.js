const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Resident = require("../Models/ResidentSchema");
const Beneficiary = require("../Models/BenificiarySchema");
const AssistanceAssign = require("../Models/AssistanceAssign");
const RfidActive = require("../Models/RFIDActiveSchema");

exports.DashboardSummary = AsyncErrorHandler(async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ✅ Parallel counts for residents, beneficiaries, RFID
    const [
      residentCount,
      beneficiaryCount,
      currentMonthAssign,
      lastMonthAssign,
      totalRFID,
      assignedRFID,
    ] = await Promise.all([
      Resident.countDocuments(),
      Beneficiary.countDocuments(),
      AssistanceAssign.countDocuments({ created_at: { $gte: startOfMonth, $lte: now } }),
      AssistanceAssign.countDocuments({ created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      RfidActive.countDocuments(),
      RfidActive.countDocuments({ status: "Assigned" }),
    ]);

    const totalPeople = residentCount + beneficiaryCount;
    const assistancePercentage =
      lastMonthAssign > 0
        ? ((currentMonthAssign - lastMonthAssign) / lastMonthAssign) * 100
        : currentMonthAssign > 0
        ? 100
        : 0;

    const rfidAssignedPercentage = totalRFID > 0 ? (assignedRFID / totalRFID) * 100 : 0;

    // ✅ Aggregate for municipality counts instead of fetching all documents
    const muniPipeline = [
      {
        $project: {
          municipality: { $ifNull: ["$municipality", "Unknown"] },
          household_id: 1,
        },
      },
      { $group: { _id: "$household_id", municipality: { $first: "$municipality" } } }, // unique households
      { $group: { _id: "$municipality", count: { $sum: 1 } } },
    ];

    const [residentMuni, beneficiaryMuni] = await Promise.all([
      Resident.aggregate(muniPipeline),
      Beneficiary.aggregate(muniPipeline),
    ]);

    const muniCountsMap = {};

    [...residentMuni, ...beneficiaryMuni].forEach((r) => {
      muniCountsMap[r._id] = (muniCountsMap[r._id] || 0) + r.count;
    });

    const totalHouseholds = Object.values(muniCountsMap).reduce((a, b) => a + b, 0);
    const municipalityData = Object.entries(muniCountsMap).map(([municipality, count]) => ({
      municipality,
      count,
      percentage: totalHouseholds ? ((count / totalHouseholds) * 100).toFixed(0) + "%" : "0%",
    }));

    // ✅ Assistance data aggregation optimized
    const { fromDate, toDate, status = "" } = req.query;
    const match = { scheduleDate: { $gte: startOfMonth, $lte: endOfMonth } };
    if (fromDate || toDate) {
      if (!match.scheduleDate) match.scheduleDate = {};
      if (fromDate) match.scheduleDate.$gte = new Date(fromDate);
      if (toDate) match.scheduleDate.$lte = new Date(toDate);
    }
    if (status) match.status = status;

    const assistanceData = await AssistanceAssign.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "categories",
          localField: "categoryIId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "residents",
          localField: "residentIds",
          foreignField: "_id",
          as: "residents",
        },
      },
      {
        $lookup: {
          from: "beneficiaries",
          localField: "residentIds",
          foreignField: "_id",
          as: "beneficiaries",
        },
      },
      {
        $project: {
          _id: 1,
          category: "$category.categoryName",
          municipality: {
            $ifNull: [
              { $arrayElemAt: ["$residents.municipality", 0] },
              { $arrayElemAt: ["$beneficiaries.municipality", 0] },
            ],
          },
          scheduleDate: 1,
        },
      },
      {
        $group: {
          _id: { category: "$category", municipality: "$municipality", releaseDate: "$scheduleDate" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { category: "$_id.category", municipality: "$_id.municipality" },
          releaseDates: { $push: { date: "$_id.releaseDate", count: "$count" } },
          totalCount: { $sum: "$count" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          municipality: "$_id.municipality",
          totalCount: 1,
          releaseDates: 1,
        },
      },
      { $sort: { category: 1, municipality: 1 } },
    ]);

    res.status(200).json({
      success: true,
      totals: {
        residents: residentCount,
        beneficiaries: beneficiaryCount,
        totalPeople,
        assistanceAssign: currentMonthAssign,
        lastMonthAssign,
        assistancePercentage: assistancePercentage.toFixed(2),
        rfidAssigned: assignedRFID,
        rfidAssignedPercentage: rfidAssignedPercentage.toFixed(2),
      },
      municipalityData,
      assistanceData,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
});
