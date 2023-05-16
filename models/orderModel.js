import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "An order must belong to a User"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "An order must contain a Product"],
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: [true, "An order must have a price"],
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  // Add other fields as necessary, such as shipping address, payment method, etc.
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
