//const db = require('../db');
const Product = require('./models/product');

// GET /api/products
exports.getproducts = function (req, res) {
    Product.find()
    .then(product => res.send(product))
    .catch(err => res.status(404).json({ msg: 'No products found' }));
}

// GET /api/products/:id
exports.getProductById = function (req, res) {
    try{
        if(req.params.id){
            Product.findOne({ id: req.params.id }, function (err, product) {
                return res.send(product);
            });
        }else{
            return res.send('ID not correct.');
        }
      }catch(error){
        throw error
      }
}

// POST /api/products
exports.setProduct = function (req, res) {
      const newProduct = new Product({
        "id": req.body.id,
        "name": req.body.name,
        "price": req.body.price,
        "desc": req.body.desc
      })
    newProduct.save().then(product => res.send(product));
}