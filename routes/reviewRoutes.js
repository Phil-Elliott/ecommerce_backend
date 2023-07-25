import express from "express";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUsersReview,
  getTopReviews,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), createReview);

router.route("/top-reviews/:gameId").get(getTopReviews);

router.route("/user").get(protect, restrictTo("user"), getUsersReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user", "admin"), updateReview)
  .delete(protect, restrictTo("user", "admin"), deleteReview);

export default router;

/*

- Also make a top reviews route that returns the top 3 reviews for a game
- Need to add helpfulness to reviews
- Also ask if people recommend the product
- Display stats of that under other stats


*/
