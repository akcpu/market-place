const Product = require('../models/product');
exports.getproducts = function () {
  return Product.find();
};
exports.getProductById = function (productId) {
  return Product.findOne({ id: productId });
};

exports.setProduct = function (newProduct) {
  const setProduct = new Product({
    id: newProduct.id,
    name: newProduct.name,
    price: newProduct.price,
    desc: newProduct.desc,
  });

  return setProduct.save();
};
