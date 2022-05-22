let db = {}
db.users = [{
  id: 11,
  fullName: "John Doe",
  userName: "John",
  password: "23",
  email: "john@doe.com"
},
{
  id: 12,
  fullName: "John2 Doe",
  userName: "John2",
  password: "24",
  email: "john2@doe.com"
},]

db.products = [{
  id: 1,
  name: "Product1",
  price: 1000,
  "desc": "product1 desc"
},
{
  id: 2,
  name: "Product2",
  price: 2000,
  "desc": "product2 desc"
},]

module.exports = db


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  id: {
    type: BigInt,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    default: "Product Description"
  }
});

module.exports = Product = mongoose.model('product', ProductSchema);