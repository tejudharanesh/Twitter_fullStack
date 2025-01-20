import express from "express";
import { protectedRoute } from "../middleware/protectRoute.js";
import {
  getNotifications,
  deleteNotifications,
  deleteOneNotifications,
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);
router.delete("/:id", protectedRoute, deleteOneNotifications);

export default router;
