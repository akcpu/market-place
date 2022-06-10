const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: "1",
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
