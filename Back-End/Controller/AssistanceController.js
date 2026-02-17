const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const AssistanceAssign = require("../Models/AssistanceAssign");
const Resident = require("../Models/ResidentSchema");
const Category = require("../Models/Category");
const HistoryDistribution = require("../Models/HistorySchema");
const Notification = require("../Models/NotificationSchema");
const userLoginSchema = require("../Models/LogInSchema");
const mongoose = require("mongoose");
const { Types } = mongoose;
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

exports.GenerateAssistanceReport = async (req, res) => {
  try {
    const {
      statusSelection,
      selectedFields = [],
      format = "pdf",
      municipality = "",
      barangay = "",
      categoryId = "",
      fromDate = "",
      toDate = "",
      reportTitle = "Assistance Program Report",
      search = "",
      status = "",
    } = req.body;

    const matchConditions = {};

    if (statusSelection && statusSelection !== "All") {
      matchConditions.statusSelection = statusSelection;
    }

    if (
      categoryId &&
      categoryId !== "All" &&
      mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      matchConditions.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (status && status !== "" && status !== "All") {
      matchConditions.status = status;
    }

    if (fromDate || toDate) {
      matchConditions.createdAt = {};
      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        matchConditions.createdAt.$gte = startDate;
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = endDate;
      }
    }

    const aggregationPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "residents",
          localField: "residentId",
          foreignField: "_id",
          as: "residentData",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$residentData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
    ];

    const additionalFilters = {};
    if (search) {
      additionalFilters.$or = [
        { "residentData.firstname": { $regex: search, $options: "i" } },
        { "residentData.lastname": { $regex: search, $options: "i" } },
        { "residentData.rfid": { $regex: search, $options: "i" } },
      ];
    }

    if (municipality && municipality !== "All") {
      additionalFilters["residentData.municipality"] = {
        $regex: municipality,
        $options: "i",
      };
    }

    if (barangay && barangay !== "All") {
      additionalFilters["residentData.barangay"] = {
        $regex: barangay,
        $options: "i",
      };
    }

    if (Object.keys(additionalFilters).length > 0) {
      aggregationPipeline.push({ $match: additionalFilters });
    }

    aggregationPipeline.push({ $sort: { "residentData.lastname": 1 } });

    const assistances = await AssistanceAssign.aggregate(aggregationPipeline);

    if (!assistances || assistances.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No records found" });
    }

    const fieldDefinitions = {
      name: {
        label: "Full Name",
        getValue: (item) =>
          `${item.residentData?.lastname || ""}, ${item.residentData?.firstname || ""} ${item.residentData?.middlename || ""}`.trim(),
        width: 120,
      },
      firstname: {
        label: "First Name",
        getValue: (item) => item.residentData?.firstname || "N/A",
        width: 80,
      },
      middlename: {
        label: "Middle Name",
        getValue: (item) => item.residentData?.middlename || "N/A",
        width: 80,
      },
      lastname: {
        label: "Last Name",
        getValue: (item) => item.residentData?.lastname || "N/A",
        width: 80,
      },
      nickname: {
        label: "Nickname",
        getValue: (item) => item.residentData?.nickname || "N/A",
        width: 60,
      },
      suffix: {
        label: "Suffix",
        getValue: (item) => item.residentData?.suffix || "",
        width: 40,
      },
      age: {
        label: "Age",
        getValue: (item) => item.residentData?.age?.toString() || "N/A",
        width: 35,
      },
      gender: {
        label: "Gender",
        getValue: (item) => item.residentData?.gender || "N/A",
        width: 50,
      },
      birth_date: {
        label: "Birth Date",
        getValue: (item) => formatDate(item.residentData?.birthdate),
        width: 80,
      },
      birth_place: {
        label: "Birth Place",
        getValue: (item) => item.residentData?.birthplace || "N/A",
        width: 100,
      },
      religion: {
        label: "Religion",
        getValue: (item) => item.residentData?.religion || "N/A",
        width: 70,
      },
      civil_status: {
        label: "Civil Status",
        getValue: (item) => item.residentData?.civilStatus || "N/A",
        width: 70,
      },
      educationalAttainment: {
        label: "Education",
        getValue: (item) => item.residentData?.educationalAttainment || "N/A",
        width: 90,
      },
      employment_status: {
        label: "Employment",
        getValue: (item) => item.residentData?.employmentStatus || "N/A",
        width: 80,
      },
      occupation: {
        label: "Occupation",
        getValue: (item) => item.residentData?.occupation || "N/A",
        width: 80,
      },
      income: {
        label: "Income",
        getValue: (item) => item.residentData?.income || "0",
        width: 60,
      },
      household_id: {
        label: "HH ID",
        getValue: (item) => item.residentData?.householdId || "N/A",
        width: 80,
      },
      householdSize: {
        label: "HH Size",
        getValue: (item) => item.residentData?.householdSize?.toString() || "0",
        width: 40,
      },
      role: {
        label: "Role",
        getValue: (item) => item.residentData?.role || "N/A",
        width: 70,
      },
      classifications: {
        label: "Classifications",
        getValue: (item) => item.residentData?.classifications || "N/A",
        width: 100,
      },
      contact: {
        label: "Contact",
        getValue: (item) => item.residentData?.contact || "N/A",
        width: 80,
      },
      contact_number: {
        label: "Contact #",
        getValue: (item) => item.residentData?.contact || "N/A",
        width: 80,
      },
      rfid: {
        label: "RFID",
        getValue: (item) => item.residentData?.rfid || "N/A",
        width: 80,
      },
      barangay: {
        label: "Barangay",
        getValue: (item) => item.residentData?.barangay || "N/A",
        width: 80,
      },
      municipality: {
        label: "Municipality",
        getValue: (item) => item.residentData?.municipality || "N/A",
        width: 80,
      },
      address: {
        label: "Address",
        getValue: (item) => item.residentData?.address || "N/A",
        width: 100,
      },
      sitio: {
        label: "Sitio",
        getValue: (item) => item.residentData?.sitio || "N/A",
        width: 70,
      },
      categoryName: {
        label: "Program",
        getValue: (item) => item.categoryData?.categoryName || "N/A",
        width: 100,
      },
      categoryDescription: {
        label: "Description",
        getValue: (item) => item.categoryData?.categoryDescription || "N/A",
        width: 120,
      },
      amount: {
        label: "Amount",
        getValue: (item) =>
          item.categoryData?.amount
            ? `₱${parseFloat(item.categoryData.amount).toLocaleString()}`
            : "₱0",
        width: 70,
      },
      assistance_status: {
        label: "Status",
        getValue: (item) => item.status || "N/A",
        width: 60,
      },
      status: {
        label: "Status",
        getValue: (item) => item.status || "N/A",
        width: 60,
      },
      statusSelection: {
        label: "Type",
        getValue: (item) => item.statusSelection || "N/A",
        width: 70,
      },
      dateAssisted: {
        label: "Date Assisted",
        getValue: (item) => formatDate(item.createdAt),
        width: 80,
      },
      release_date: {
        label: "Release Date",
        getValue: (item) => formatDate(item.scheduleDate),
        width: 80,
      },
      dateRegistered: {
        label: "Date Reg.",
        getValue: (item) => formatDate(item.residentData?.createdAt),
        width: 80,
      },
      createdAt: {
        label: "Created At",
        getValue: (item) => formatDate(item.createdAt),
        width: 80,
      },
      updatedAt: {
        label: "Updated At",
        getValue: (item) => formatDate(item.updatedAt),
        width: 80,
      },
    };

    let fieldsToInclude =
      selectedFields.length > 0
        ? selectedFields.filter((f) => f !== "assistance_id")
        : ["name", "barangay", "categoryName", "amount", "status"];

    fieldsToInclude = fieldsToInclude.filter((f) => fieldDefinitions[f]);

    const headers = fieldsToInclude.map((f) => fieldDefinitions[f].label);
    const data = assistances.map((item, idx) =>
      fieldsToInclude.map((f) => fieldDefinitions[f].getValue(item, idx)),
    );

    const summary = {
      totalRecords: assistances.length,
      totalAmount: `₱${assistances
        .reduce(
          (sum, item) => sum + (parseFloat(item.categoryData?.amount) || 0),
          0,
        )
        .toLocaleString()}`,
    };

    if (format.toLowerCase() === "excel") {
      await generateExcel(
        res,
        headers,
        data,
        summary,
        reportTitle,
        fieldsToInclude,
        fieldDefinitions,
      );
    } else {
      await generatePDF(
        res,
        headers,
        data,
        summary,
        reportTitle,
        fieldsToInclude,
        fieldDefinitions,
      );
    }
  } catch (error) {
    console.error("❌ Report Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const generatePDF = async (
  res,
  headers,
  data,
  summary,
  reportTitle,
  fieldsToInclude,
  fieldDefinitions,
) => {
  const isLandscape = fieldsToInclude.length > 7;
  const doc = new PDFDocument({
    size: "LEGAL",
    layout: isLandscape ? "landscape" : "portrait",
    margin: 30,
    bufferPages: true,
  });

  const filename = `${reportTitle.replace(/\s+/g, "_")}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  const logoPath = path.join(__dirname, "../public/image/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, (doc.page.width - 50) / 2, 30, { width: 50 });
    doc.moveDown(4);
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#000080")
    .text("Republic of the Philippines", { align: "center" });
  doc.fontSize(10).text("Province Of Biliran", { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(8)
    .text("6560 Naval, Biliran", { align: "center" })
    .moveDown(1.5);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#000")
    .text(reportTitle.toUpperCase(), { align: "center" })
    .moveDown(1);

  const availableWidth = doc.page.width - 60;
  let columnWidths = fieldsToInclude.map(
    (f) => fieldDefinitions[f].width || 80,
  );
  const totalPlannedWidth = columnWidths.reduce((a, b) => a + b, 0);
  const scaleFactor = availableWidth / totalPlannedWidth;
  columnWidths = columnWidths.map((w) => w * scaleFactor);

  const drawHeaders = (y) => {
    doc.rect(30, y, availableWidth, 18).fill("#2C3E50");
    doc
      .fillColor("#FFF")
      .font("Helvetica-Bold")
      .fontSize(fieldsToInclude.length > 10 ? 6 : 7);
    let curX = 30;
    headers.forEach((h, i) => {
      doc.text(h, curX + 3, y + 5, {
        width: columnWidths[i] - 5,
        align: "left",
      });
      curX += columnWidths[i];
    });
    return y + 18;
  };

  let currentY = drawHeaders(doc.y);

  data.forEach((row, rowIndex) => {
    const rowHeight = 15;
    if (currentY + rowHeight > doc.page.height - 70) {
      doc.addPage();
      currentY = drawHeaders(30);
    }

    const rowColor = rowIndex % 2 === 0 ? "#FFFFFF" : "#F8F9FA";
    doc
      .rect(30, currentY, availableWidth, rowHeight)
      .fill(rowColor)
      .stroke("#DDDDDD");
    doc
      .fillColor("#333")
      .font("Helvetica")
      .fontSize(fieldsToInclude.length > 10 ? 6 : 7);

    let cellX = 30;
    row.forEach((text, i) => {
      doc.text(text.toString(), cellX + 3, currentY + 4, {
        width: columnWidths[i] - 5,
        ellipsis: true,
      });
      cellX += columnWidths[i];
    });
    currentY += rowHeight;
  });

  doc.moveDown(2);
  const finalY = doc.y > doc.page.height - 50 ? 30 : doc.y;
  doc.rect(30, finalY, availableWidth, 25).fill("#EBF5FB").stroke("#AED6F1");
  doc
    .fillColor("#1B4F72")
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      `TOTAL RECORDS: ${summary.totalRecords}    |    TOTAL AMOUNT: ${summary.totalAmount}`,
      40,
      finalY + 8,
    );

  doc.end();
};

const generateExcel = async (
  res,
  headers,
  data,
  summary,
  reportTitle,
  fieldsToInclude,
  fieldDefinitions,
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Assistance Report");

  sheet.addRow([reportTitle.toUpperCase()]).font = { bold: true, size: 14 };
  sheet.addRow([
    `Total Records: ${summary.totalRecords}`,
    "",
    `Total Amount: ${summary.totalAmount}`,
  ]).font = { bold: true };
  sheet.addRow([]);

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2C3E50" },
    };
    cell.font = { color: { argb: "FFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  data.forEach((row) => sheet.addRow(row));

  sheet.columns = fieldsToInclude.map((f) => ({
    width: fieldDefinitions[f].width / 5 || 15,
  }));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=AssistanceReport.xlsx",
  );
  await workbook.xlsx.write(res);
  res.end();
};

exports.MoveAssignToHistoryAndDelete = AsyncErrorHandler(async (req, res) => {
  try {
    let { rfid } = req.params;
    const io = req.app.get("io");
    const userId = req.user.linkId;
    const { distributedBy, remarks } = req.body;

    rfid = rfid.replace(/^RFID/i, "").trim();

    const resident = await Resident.findOne({ rfid });
    if (!resident) {
      return res.status(404).json({
        status: "fail",
        message: "No resident found with this RFID",
      });
    }

    console.log("resident",resident)

    const earliestAssistance = await AssistanceAssign.aggregate([
      { $match: { residentId: resident._id, status: "Pending" } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $sort: { scheduleDate: 1, createdAt: 1 } },
      { $limit: 1 },
    ]);

    if (!earliestAssistance.length) {
      return res.status(404).json({
        status: "fail",
        message: "No pending assistance found for this resident",
      });
    }

    const assistance = earliestAssistance[0];

    const residentName =
      `${resident.firstname} ${resident.middlename || ""} ${resident.lastname}`.trim();

    const assistanceAmount =
      assistance.totalAmount || 0;

    const history = await HistoryDistribution.create({
      rfid: resident.rfid,
      statusSelection: assistance.statusSelection,
      distributionStatus: "released",
      residentId: resident._id,
      residentId: resident.items,
      residentName,
      age: resident.age,
      gender: resident.gender,
      barangay: resident.barangay,
      municipality: resident.municipality,
      contact: resident.contact,
      userId,
      items: assistance.items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
      })),
      categoryId: assistance.category._id,
      categoryName: assistance.category.categoryName,
      categoryDescription: assistance.category.description,
      amount: assistance.category.amount,
      scheduleDate: assistance.scheduleDate || null,
      assistanceAmount,
      distributedBy,
      remarks,
      distributionDate: new Date(),
    });

    const admins = await userLoginSchema.find({ role: "admin" }).select("_id");
    const viewers = admins.map((admin) => ({ user: admin._id }));

    await Notification.create({
      types: "Release Assistance",
      message: `Assistance for ${residentName} has been released and added to history.`,
      viewers,
    });

    await AssistanceAssign.deleteOne({ _id: assistance._id });

    io.emit("newresident-claim", history);

    res.status(200).json({
      success: true,
      message:
        "Earliest pending assistance moved to history, deleted, and notification created for admins",
      data: history,
    });
  } catch (error) {
    console.error("MoveEarliestPendingToHistory error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.CreateAssistance = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      categoryId,
      distributionType,
      statusSelection,
      filters = {},
      scheduleDate,
      residentIds: bodyResidentIds,
      remarks,
      items = [],
    } = req.body;

    if (!distributionType) {
      return res.status(400).json({
        success: false,
        message:
          "distributionType is required (Cash, Goods, Relief, Medical, Other)",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    let processedItems = [...items];
    let totalAmount = 0;

    if (distributionType.toLowerCase() === "cash") {
      totalAmount = processedItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0,
      );
      if (totalAmount === 0) {
        totalAmount = category.amount || 0;
      }
    } else {
      processedItems = processedItems.map(({ amount, ...rest }) => rest);
      totalAmount = category.amount || 0;
    }

    let residentIds = [];

    if (statusSelection === "All") {
      const query = {};

      if (filters.municipality && filters.municipality !== "All") {
        query.municipality = filters.municipality;
      }
      if (filters.barangay && filters.barangay !== "All") {
        query.barangay = filters.barangay;
      }
      if (filters.search?.trim()) {
        query.$or = [
          { firstname: { $regex: filters.search.trim(), $options: "i" } },
          { lastname: { $regex: filters.search.trim(), $options: "i" } },
          { rfid: { $regex: filters.search.trim(), $options: "i" } },
        ];
      }

      const residents = await Resident.find(query).select("_id");
      if (!residents.length) {
        return res.status(400).json({
          success: false,
          message: "No residents found based on current filters",
        });
      }
      residentIds = residents.map((r) => r._id);
    } else {
      if (!Array.isArray(bodyResidentIds) || bodyResidentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "residentIds is required when statusSelection is not All",
        });
      }
      residentIds = bodyResidentIds.map((id) =>
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id,
      );
    }

    const assistanceDocs = [];

    for (const residentId of residentIds) {
      const existing = await AssistanceAssign.findOne({
        residentId: residentId,
        categoryId: categoryId,
        status: "Pending",
      });

      if (existing) {
        console.log(
          `Resident ${residentId} already has category ${categoryId}, skipping.`,
        );
        continue;
      }

      assistanceDocs.push({
        residentId,
        categoryId,
        distributionType,
        statusSelection,
        scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
        items: processedItems,
        totalAmount,
        remarks,
        status: "Pending",
      });
    }

    if (!assistanceDocs.length) {
      return res.status(400).json({
        success: false,
        message: "All selected residents already have this category assigned",
      });
    }

    const saved = await AssistanceAssign.insertMany(assistanceDocs);

    return res.status(201).json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    console.error("Error creating assistance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create assistance",
      error: error.message,
    });
  }
});

exports.UpdateAssistance = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.distributionType && updateData.items) {
      const isCash = updateData.distributionType.toLowerCase() === "cash";
      if (!isCash) {
        updateData.items = updateData.items.map(({ amount, ...rest }) => rest);
      }
    }

    const updated = await AssistanceAssign.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Assistance not found" });
    }

    res.status(200).json({
      success: true,
      message: "Assistance updated",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating assistance:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});


exports.DisplayAssistances = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      search = "",
      municipality = "",
      barangay = "",
      categoryId = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const matchConditions = { statusSelection: "Priority" };

    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      matchConditions.categoryId = new Types.ObjectId(categoryId);
    }

    const aggregationPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "residents",
          localField: "residentId",
          foreignField: "_id",
          as: "residentData",
        },
      },
      { $unwind: { path: "$residentData", preserveNullAndEmptyArrays: false } },

      {
        $match: {
          ...(search &&
            (() => {
              const cleanSearch = search.trim();
              const words = cleanSearch.split(/\s+/);
              return {
                $and: words.map((w) => ({
                  $or: [
                    { "residentData.firstname": { $regex: w, $options: "i" } },
                    { "residentData.middlename": { $regex: w, $options: "i" } },
                    { "residentData.lastname": { $regex: w, $options: "i" } },
                    { "residentData.rfid": { $regex: w, $options: "i" } },
                  ],
                })),
              };
            })()),
          ...(municipality && {
            "residentData.municipality": {
              $regex: municipality.trim(),
              $options: "i",
            },
          }),
          ...(barangay && {
            "residentData.barangay": { $regex: barangay.trim(), $options: "i" },
          }),
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          statusSelection: 1,
          status: 1,
          createdAt: 1,
          resident: {
            _id: "$residentData._id",
            name: {
              $trim: {
                input: {
                  $concat: [
                    "$residentData.firstname",
                    " ",
                    { $ifNull: ["$residentData.middlename", ""] },
                    " ",
                    "$residentData.lastname",
                  ],
                },
              },
            },
            age: "$residentData.age",
            gender: "$residentData.gender",
            barangay: "$residentData.barangay",
            municipality: "$residentData.municipality",
            contact: "$residentData.contact",
            rfid: "$residentData.rfid",
          },
          category: {
            _id: "$category._id",
            categoryName: "$category.categoryName",
            description: "$category.description",
            amount: "$category.amount",
          },
        },
      },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: perPage }],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const result = await AssistanceAssign.aggregate(aggregationPipeline);

    const assistances = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / perPage) || 1;

    res.status(200).json({
      status: "success",
      total,
      currentPage,
      totalPages,
      limit: perPage,
      data: assistances,
    });
  } catch (error) {
    console.error("Error fetching assistances:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch assistances",
      error: error.message,
    });
  }
});


exports.DisplayAllAssistances = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      search = "",
      municipality = "",
      barangay = "",
      categoryId = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const matchConditions = { statusSelection: "All" };

    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      matchConditions.categoryId = new Types.ObjectId(categoryId);
    }

    const aggregationPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: "residents",
          localField: "residentId",
          foreignField: "_id",
          as: "residentData",
        },
      },
      { $unwind: { path: "$residentData", preserveNullAndEmptyArrays: false } },

      {
        $match: {
          ...(search && {
            $or: [
              {
                "residentData.firstname": {
                  $regex: search.trim(),
                  $options: "i",
                },
              },
              {
                "residentData.middlename": {
                  $regex: search.trim(),
                  $options: "i",
                },
              },
              {
                "residentData.lastname": {
                  $regex: search.trim(),
                  $options: "i",
                },
              },
              { "residentData.rfid": { $regex: search.trim(), $options: "i" } },
            ],
          }),
          ...(municipality && {
            "residentData.municipality": {
              $regex: municipality.trim(),
              $options: "i",
            },
          }),
          ...(barangay && {
            "residentData.barangay": { $regex: barangay.trim(), $options: "i" },
          }),
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          statusSelection: 1,
          status: 1,
          createdAt: 1,
          resident: {
            _id: "$residentData._id",
            name: {
              $trim: {
                input: {
                  $concat: [
                    "$residentData.firstname",
                    " ",
                    { $ifNull: ["$residentData.middlename", ""] },
                    " ",
                    "$residentData.lastname",
                  ],
                },
              },
            },
            age: "$residentData.age",
            gender: "$residentData.gender",
            barangay: "$residentData.barangay",
            municipality: "$residentData.municipality",
            contact: "$residentData.contact",
            rfid: "$residentData.rfid",
          },
          category: {
            _id: "$category._id",
            categoryName: "$category.categoryName",
            description: "$category.description",
            amount: "$category.amount",
          },
        },
      },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: perPage }],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const result = await AssistanceAssign.aggregate(aggregationPipeline);

    const assistances = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / perPage) || 1;

    res.status(200).json({
      status: "success",
      total,
      currentPage,
      totalPages,
      limit: perPage,
      data: assistances,
    });
  } catch (error) {
    console.error("Error fetching assistances:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch assistances",
      error: error.message,
    });
  }
});


exports.DisplayAssistanceById = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const assistance = await AssistanceAssign.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "residents",
          localField: "residentId",
          foreignField: "_id",
          as: "resident",
        },
      },
      { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ]);

    if (!assistance || assistance.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Assistance not found" });
    }

    res.status(200).json({ status: "success", data: assistance[0] });
  } catch (error) {
    console.error("Error fetching assistance by ID:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

exports.DeleteAssistance = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await AssistanceAssign.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "fail", message: "Assistance not found" });
    }

    await AssistanceAssign.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Assistance deleted", data: null });
  } catch (error) {
    console.error("Error deleting assistance:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

exports.DisplayResidentAssistanceByRFID = AsyncErrorHandler(
  async (req, res) => {
    try {
      let { rfid } = req.params;

      rfid = rfid.replace(/^RFID/i, "").trim();

      const resident = await Resident.findOne({ rfid });
      if (!resident) {
        return res.status(404).json({
          status: "fail",
          message: "No resident found with this RFID",
        });
      }

      const earliestAssistance = await AssistanceAssign.aggregate([
        {
          $match: {
            residentId: resident._id,
            status: "Pending",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $sort: { scheduleDate: 1, createdAt: 1 } },
        { $limit: 1 },
        {
          $project: {
            _id: 1,
            statusSelection: 1,
            scheduleDate: 1,
            createdAt: 1,
            totalAmount: 1,
            categoryId: "$category._id",
            categoryName: "$category.categoryName",
            categoryDescription: "$category.description",
            amount: "$category.amount",
            items: 1,
          },
        },
      ]);

      const assistance =
        earliestAssistance.length > 0 ? earliestAssistance[0] : {};

      const combinedData = {
        id: resident._id,
        rfid: resident.rfid,
        name: `${resident.firstname} ${resident.middlename || ""} ${resident.lastname}`.trim(),
        age: resident.age,
        gender: resident.gender,
        barangay: resident.barangay,
        municipality: resident.municipality,
        contact: resident.contact,
        items: assistance.items || [],
        assistanceId: assistance._id || null,
        statusSelection: assistance.statusSelection || null,
        scheduleDate: assistance.scheduleDate || null,
        categoryId: assistance.categoryId || null,
        categoryName: assistance.categoryName || null,
        categoryDescription: assistance.categoryDescription || null,
        totalAmount: assistance.totalAmount || 0,
        amount: assistance.amount || null,
      };

      res.status(200).json({
        success: true,
        message: "Resident with earliest pending assistance fetched",
        data: combinedData,
      });
    } catch (error) {
      console.error("DisplayResidentAssistanceByRFID error:", error);
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
);
