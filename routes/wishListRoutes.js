import express from "express";
import {
  getAllWishListItems,
  addToWishList,
  removeFromWishList,
} from "../controllers/wishListController.js";

const router = express.Router();

router.route("/").get(getAllWishListItems);
router.route("/add").post(addToWishList);
router.route("/remove/:id").delete(removeFromWishList);

export default router;
