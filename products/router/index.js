const express = require('express');
const productRrouter = express.Router();

const { getproducts, getProductById, setProduct } = require('../handlers');

productRrouter.get('/products', getproducts);
productRrouter.get('/products/:id', getProductById);
productRrouter.post('/products', setProduct);

module.exports = productRrouter;
