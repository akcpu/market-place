//const db = require('../db');
const Products = require('../models/ models/product');  
// GET /api/products
exports.getproducts = function (req, res) {
    res.send(Products);
}

// GET /api/products/:id
exports.getProductById = function (req, res) {
    var reqId = req.params.id;
    const product = Products.filter((product) => {
        if ((reqId == product.id)) {
            return true
        }
        else {
            return false
        }
    })
    if (product) {
        return res.send(product);
    } else {
        return res.send('ID not correct.');
    }
}

// POST /api/products
exports.setProduct = function (req, res) {
    var product = {
        id: req.body.id,
        "name": req.body.name,
        price: req.body.price,
        "desc": req.body.desc
    };
    Products.push(product);

    return res.send('product has been added successfully');
}