import Notification from "../models/notification.model.js";

// Controller for getting notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        select: "username profileImage",
      })
      .sort({ createdAt: -1 });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error during getNotifications", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for deleting notifications
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error during deleteNotifications", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for deleting one notification
export const deleteOneNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.to.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error during deleteOneNotifications", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
