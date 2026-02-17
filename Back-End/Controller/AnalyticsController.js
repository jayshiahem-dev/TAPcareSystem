const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Resident = require("../Models/ResidentSchema");
const Beneficiary = require("../Models/BenificiarySchema");
const AssistanceAssign = require("../Models/AssistanceAssign");
const RfidActive = require("../Models/RFIDActiveSchema");

exports.DashboardSummary = AsyncErrorHandler(async (req, res) => {
  try {
    const [residentCount, beneficiaryCount] = await Promise.all([
      Resident.countDocuments(),
      Beneficiary.countDocuments(),
    ]);
    const totalPeople = residentCount + beneficiaryCount;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentMonthAssign, lastMonthAssign] = await Promise.all([
      AssistanceAssign.countDocuments({
        created_at: { $gte: startOfMonth, $lte: now },
      }),
      AssistanceAssign.countDocuments({
        created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
    ]);

    let assistancePercentage = 0;
    if (lastMonthAssign > 0) {
      assistancePercentage =
        ((currentMonthAssign - lastMonthAssign) / lastMonthAssign) * 100;
    } else if (currentMonthAssign > 0) {
      assistancePercentage = 100;
    }

    const [totalRFID, assignedRFID] = await Promise.all([
      RfidActive.countDocuments(),
      RfidActive.countDocuments({ status: "Assigned" }),
    ]);

    const rfidAssignedPercentage =
      totalRFID > 0 ? (assignedRFID / totalRFID) * 100 : 0;

    const [residents, beneficiaries] = await Promise.all([
      Resident.find().select("municipality household_id"),
      Beneficiary.find().select("municipality household_id"),
    ]);

    const combined = [...residents, ...beneficiaries];
    const muniCounts = {};
    const countedHouseholds = new Set();

    combined.forEach((person) => {
      const householdId = person.household_id?.toString();
      if (!householdId) return;
      if (!countedHouseholds.has(householdId)) {
        const muni = person.municipality || "Unknown";
        muniCounts[muni] = (muniCounts[muni] || 0) + 1;
        countedHouseholds.add(householdId);
      }
    });

    const totalHouseholds = Object.values(muniCounts).reduce(
      (sum, val) => sum + val,
      0,
    );

    const municipalityData = Object.entries(muniCounts).map(
      ([municipality, count]) => ({
        municipality,
        count,
        percentage:
          totalHouseholds > 0
            ? ((count / totalHouseholds) * 100).toFixed(0) + "%"
            : "0%",
      }),
    );

    const { fromDate, toDate, status = "" } = req.query;
    const match = {};
    if (fromDate || toDate) {
      match.scheduleDate = {};
      if (fromDate) match.scheduleDate.$gte = new Date(fromDate);
      if (toDate) match.scheduleDate.$lte = new Date(toDate);
    }
    if (status) match.status = status;

    const assistanceData = await AssistanceAssign.aggregate([
      {
        $match: {
          scheduleDate: { $gte: startOfMonth, $lte: endOfMonth },
          ...match,
        },
      },

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
          as: "resident",
        },
      },
      { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "beneficiaries",
          localField: "residentIds",
          foreignField: "_id",
          as: "beneficiary",
        },
      },
      { $unwind: { path: "$beneficiary", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          category: "$category.categoryName",
          municipality: {
            $ifNull: ["$resident.municipality", "$beneficiary.municipality"],
          },
          scheduleDate: 1,
        },
      },

      {
        $group: {
          _id: {
            category: "$category",
            municipality: "$municipality",
            releaseDate: "$scheduleDate",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { category: "$_id.category", municipality: "$_id.municipality" },
          releaseDates: {
            $push: { date: "$_id.releaseDate", count: "$count" },
          },
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
