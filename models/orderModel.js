import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "An order item must reference a Product"],
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: [true, "An order item must have a price"],
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "An order must belong to a User"],
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: [true, "An order must have a total price"],
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
});

// orderSchema.pre(/^find/, function (next) {
//   this.populate("user").populate({
//     path: "items.product",
//     select: "name description price image",
//   });
// });

const Order = mongoose.model("Order", orderSchema);

export default Order;
