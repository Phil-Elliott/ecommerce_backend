import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.route("/").get(getAllUsers);

router.route("/:id").get(getUserById).put(updateUser);

router.use(protect);

router.route("/updateMe").patch(updateMe);

router.route("/deleteMe").delete(deleteMe);

export default router;
