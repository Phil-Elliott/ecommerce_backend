import express from "express";
import {
  getAllCartItems,
  addToCart,
  removeFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.route("/").get(getAllCartItems);
router.route("/add").post(addToCart);
router.route("/remove/:id").delete(removeFromCart);

export default router;
