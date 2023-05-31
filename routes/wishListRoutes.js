import express from "express";
import {
  getAllWishListItems,
  addToWishList,
  removeFromWishList,
} from "../controllers/wishListController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAllWishListItems);
router.route("/add").post(addToWishList);
router.route("/remove/:gameId").delete(removeFromWishList);

export default router;
