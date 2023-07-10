import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.route("/").get(getAllUsers);

router.use(protect);

router.get("/me", getMe);

router.route("/updateMe").patch(updateMe);

router.route("/deleteMe").delete(deleteMe);

router.use(restrictTo("admin"));

router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
