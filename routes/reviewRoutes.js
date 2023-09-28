import express from "express";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUsersReview,
  getTopReviews,
  voteReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), createReview);

router.route("/top-reviews/:gameId").get(getTopReviews);

router.route("/user").get(protect, restrictTo("user"), getUsersReview);

router.route("/:id/vote").patch(protect, restrictTo("user"), voteReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user", "admin"), updateReview)
  .delete(protect, restrictTo("user", "admin"), deleteReview);

export default router;
