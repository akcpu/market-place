const productService = require('./services/product-service')

// GET /api/products
exports.getproducts = function (req, res) {
    productService.getproducts()
    .then(products => res.send(products))
    .catch(err => res.status(404).json({ msg: 'No products found' + err}));
}

// GET /api/products/:id
exports.getProductById = function (req, res) {
    try{
        if(req.params.id){
            productService.getProductById(req.params.id)
            .then((products)=>{res.send(products)})
            .catch(err => {res.status(404).json({msg: 'No product found' + err})});
        }else{
            return res.send('ID not correct.');
        }
      }catch(error){
        throw error
      }
}

// POST /api/products
exports.setProduct = function (req, res) {
      try {
        const newProduct = {
          id: req.body.id,
          name: req.body.name,
          price: req.body.price,
          desc: req.body.desc
        }
        productService.setProduct(newProduct);
        res.send('User has been added successfully');
      } catch (error) {
        return res.send('error: ' + error);
      }
}