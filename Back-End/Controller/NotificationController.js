const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Notification = require("./../Models/NotificationSchema");
const userLoginSchema = require("./../Models/LogInSchema");
const mongoose = require("mongoose");

exports.createNotification = AsyncErrorHandler(async (req, res) => {
  const { message, userIds } = req.body; // userIds: [array of linkId]

  const viewers = userIds.map((id) => ({
    user: new mongoose.Types.ObjectId(id),
    isRead: false,
  }));

  const newNotification = await Notification.create({ message, viewers });

  res.status(201).json({
    status: "success",
    data: newNotification,
  });
});



exports.getByLinkId = AsyncErrorHandler(async (req, res) => {
  const { linkId } = req.params;
  const { limit = 20, page = 1 } = req.query; 
  const pageSize = parseInt(limit, 10);
  const currentPage = parseInt(page, 10);
  const skip = (currentPage - 1) * pageSize;

  const user = await userLoginSchema.findOne({
    linkedId: linkId
  });

  if (!user) {
    console.log("No user found with linkId:", linkId);
    return res.status(404).json({
      status: "fail",
      message: "User not found using linkId",
    });
  }

  console.log("Found user _id:", user._id);

  const notifications = await Notification.find({
    "viewers.user": user._id,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);
  const totalNotifications = await Notification.countDocuments({
    "viewers.user": user._id,
  });

  res.status(200).json({
    status: "success",
    userId: user._id,
    results: notifications.length,
    total: totalNotifications,
    page: currentPage,
    totalPages: Math.ceil(totalNotifications / pageSize),
    data: notifications,
  });
});




exports.markAsRead = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { linkId } = req.body;

  if (!linkId) {
    return res.status(400).json({ message: "linkId is required" });
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  const viewer = notification.viewers.find(
    (v) => v.user.toString() === linkId
  );

  if (!viewer) {
    return res.status(403).json({ message: "Not authorized to read this notification" });
  }

  if (!viewer.isRead) {
    viewer.isRead = true;
    await notification.save();
  }

  res.status(200).json({ message: "Notification marked as read" });
});

exports.DisplayNotification = AsyncErrorHandler(async (req, res) => {
  let limit = 5; // default limit
  if (req.query.showAll === "true") {
    limit = null;
  }

  let query = Notification.find().sort({ createdAt: -1 });

  if (limit) {
    query = query.limit(limit);
  }

  const dataNotification = await query;

  res.status(200).json({
    status: "success",
    results: dataNotification.length,
    data: dataNotification,
  });
});



exports.deleteNotification = AsyncErrorHandler(async (req, res) => {
  const deleted = await Notification.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      status: "fail",
      message: "Notification not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});



