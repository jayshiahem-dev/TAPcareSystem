const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Officer = require("../Models/OfficerSchema");
const Apifeatures = require("../Utils/ApiFeatures");
const UserLoginSchema = require("../Models/OfficerSchema");
exports.DisplayOfficer = AsyncErrorHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const searchQuery = search
      ? {
          $or: [
            { first_name: { $regex: search, $options: "i" } },
            { middle_name: { $regex: search, $options: "i" } },
            { last_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const aggregationPipeline = [
      {
        $match: searchQuery, 
      },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $unwind: {
          path: "$departmentInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          middle_name: 1,
          email: 1,
          gender: 1,
          avatar: 1,
          created_at: 1,
          dob: 1,
          password: 1,
          contact_number: 1,
          isActive: 1,
          department: "$departmentInfo.department",
        },
      },
    ];

    const countPipeline = [
      ...aggregationPipeline.slice(0, 1), 
      { $count: "total" },
    ];

    const countResult = await Officer.aggregate(countPipeline);
    const totalOfficers = countResult.length > 0 ? countResult[0].total : 0;

    const paginatedPipeline = [
      ...aggregationPipeline,
      { $skip: skip },
      { $limit: perPage },
      { $sort: { created_at: -1 } }, 
    ];

    let officers = await Officer.aggregate(paginatedPipeline);

    const formattedOfficers = officers.map((off) => {
      if (off.dob) {
        const dob = new Date(off.dob);
        const year = dob.getFullYear();
        const month = String(dob.getMonth() + 1).padStart(2, "0");
        const day = String(dob.getDate()).padStart(2, "0");
        off.dob = `${year}-${month}-${day}`;
      }
      return off;
    });

    const totalPages = Math.ceil(totalOfficers / perPage);

    res.status(200).json({
      status: "success",
      data: formattedOfficers,
      pagination: {
        totalOfficers,
        totalPages,
        currentPage,
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching officer data:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching officer data.",
      error: error.message,
    });
  }
});

exports.deleteOfficer = AsyncErrorHandler(async (req, res, next) => {
  const officerID = req.params.id;
  const userLogin = await UserLoginSchema.findOne({ linkedId: officerID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }
  const deleteOfficer = await Officer.findByIdAndDelete(officerID);
  if (!deleteOfficer) {
    return res.status(404).json({
      status: "fail",
      message: "Officer not found.",
    });
  }
  res.status(200).json({
    status: "success",
    message: "Officer and related login deleted successfully.",
    data: null,
  });
});

exports.UpdateOfficer = AsyncErrorHandler(async (req, res, next) => {
  const updateOfficer = await Officer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.status(200).json({
    status: "success",
    data: updateOfficer,
  });
});
