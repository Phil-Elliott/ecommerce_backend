import express from "express";
import {
  getAllCartItems,
  addToCart,
  removeFromCart,
  changeQuantity,
} from "../controllers/cartController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAllCartItems).post(changeQuantity);
router.route("/add").post(addToCart);
router.route("/remove/:gameId").delete(removeFromCart);

export default router;
