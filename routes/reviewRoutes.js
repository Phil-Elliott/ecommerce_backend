import express from "express";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.route("/").get(getAllReviews).post(createReview);

router.route("/:id").get(getReview).put(updateReview).delete(deleteReview);

export default router;
