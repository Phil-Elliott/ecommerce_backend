import express from "express";
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getCheckoutSession,
  // createOrderCheckout,
  handleStripeWebhook,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import bodyParser from "body-parser";

const router = express.Router();

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

// could use raw body here instead of express.json

router.use(protect);

// router.post("/create-order-checkout", createOrderCheckout);

router.post("/checkout-session", getCheckoutSession);

router.route("/").get(getAllOrders).post(createOrder);

router.route("/:id").get(getOrder).put(updateOrder).delete(deleteOrder);

export default router;
