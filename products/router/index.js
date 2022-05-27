const express = require('express')
const productRrouter = express.Router()

const { getproducts, getProductById, setProduct } = require('../handler');

productRrouter.get('/api/products', getproducts);
productRrouter.get('/api/products/:id', getProductById);
productRrouter.post('/api/products', setProduct);

module.exports = productRrouter


