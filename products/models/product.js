const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  id: {
    type: Number,
    required: true,
    default: 0.0,
  },
  name: {
    type: String,
    required: true,
    default: "tv",
  },
  price: {
    type: String,
    required: true,
    default: "3000",
  },
  desc: {
    type: String,
    default: "Product Description",
  },
});

module.exports = mongoose.model("product", ProductSchema);
