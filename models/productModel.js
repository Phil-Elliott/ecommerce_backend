import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product must have a name"],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, "A product must have a price"],
  },
  description: {
    type: String,
    required: [true, "A product must have a description"],
  },
  image: {
    type: String,
    required: [true, "A product must have an image"],
  },
  categories: {
    type: [String],
    required: [true, "A product must have at least one category"],
  },
  stock: {
    type: Number,
    required: [true, "A product must have a stock"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
