const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Officer = require("../Models/OfficerSchema");
const Apifeatures = require("../Utils/ApiFeatures");
const SuperAdmin = require("../Models/superAdminSchema");
const UserLogin = require("../Models/usermodel");
exports.DisplaySuperAdmin = AsyncErrorHandler(async (req, res) => {
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
      { $match: searchQuery },
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
          password:1,
          avatar: 1,
          created_at: 1,
          dob: 1,
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

    const countResult = await SuperAdmin.aggregate(countPipeline);
    const totalSuperAdmins =
      countResult.length > 0 ? countResult[0].total : 0;

    const paginatedPipeline = [
      ...aggregationPipeline,
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: perPage },
    ];

    let superAdmins = await SuperAdmin.aggregate(paginatedPipeline);

    const formattedSuperAdmins = superAdmins.map((sa) => {
      if (sa.dob) {
        const dob = new Date(sa.dob);
        const year = dob.getFullYear();
        const month = String(dob.getMonth() + 1).padStart(2, "0");
        const day = String(dob.getDate()).padStart(2, "0");
        sa.dob = `${year}-${month}-${day}`;
      }
      return sa;
    });

    const totalPages = Math.ceil(totalSuperAdmins / perPage);

    res.status(200).json({
      status: "success",
      data: formattedSuperAdmins,
      pagination: {
        totalSuperAdmins,
        totalPages,
        currentPage,
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching superadmin data:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching superadmin data.",
      error: error.message,
    });
  }
});


exports.deleteSuperAdmin = AsyncErrorHandler(async (req, res, next) => {
  try {
    const superAdminId = req.params.id;
    const superAdmin = await SuperAdmin.findById(superAdminId);

    if (!superAdmin) {
      return res.status(404).json({
        status: "fail",
        message: "SuperAdmin not found.",
      });
    }

    const userLogin = await UserLogin.findOne({ linkedId: superAdmin._id });
    if (userLogin) {
      await UserLogin.findByIdAndDelete(userLogin._id);
    }

    await SuperAdmin.findByIdAndDelete(superAdmin._id);

    res.status(200).json({
      status: "success",
      message: "SuperAdmin and related login deleted successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting SuperAdmin:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while deleting SuperAdmin.",
      error: error.message,
    });
  }
});


exports.UpdateSuperAdmin = AsyncErrorHandler(async (req, res, next) => {
  const updateOfficer = await SuperAdmin.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.status(200).json({
    status: "success",
    data: updateOfficer,
  });
});
