import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} from "../controllers/authController.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);

// Protected routes
router.use(protect);

router.route("/updatePassword").patch(updatePassword);

// Admin routes
router.use(restrictTo("admin"));

export default router;
