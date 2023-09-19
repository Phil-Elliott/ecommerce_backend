import express from "express";
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getCheckoutSession,
  createOrderCheckout,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.post("/create-order-checkout", createOrderCheckout);

router.post("/checkout-session", getCheckoutSession);

router.route("/").get(getAllOrders).post(createOrder);

router.route("/:id").get(getOrder).put(updateOrder).delete(deleteOrder);

export default router;
