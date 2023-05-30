import express from "express";
import {
  getAllCartItems,
  addToCart,
  removeFromCart,
} from "../controllers/cartController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAllCartItems);
router.route("/add").post(addToCart);
router.route("/remove/:id").delete(removeFromCart);

export default router;
