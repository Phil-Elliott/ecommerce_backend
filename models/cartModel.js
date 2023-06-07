import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        game: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Game",
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity can not be less then 1']          
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
