import express from "express";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), createReview);

router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

export default router;
