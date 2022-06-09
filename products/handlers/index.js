const productService = require("../services/product-service");

// GET /api/products
exports.getproducts = function (req, res) {
  productService
    .getproducts()
    .then((products) => res.send(products))
    .catch((err) => res.status(404).json({ msg: "No products found" + err }));
};

// GET /api/products/:id
exports.getProductById = function (req, res) {
  productService
    .getProductById(req.params.id)
    .then((products) => {
      res.send(products);
    })
    .catch((err) => {
      res.status(404).json({ msg: "No product found" + err });
    });
};

// POST /api/products
exports.setProduct = function (req, res) {
  try {
    const newProduct = {
      id: req.body.id,
      name: req.body.name,
      price: req.body.price,
      desc: req.body.desc,
    };
    let setProductResult = productService.setProduct(newProduct);
    res.send("User has been added successfully" + setProductResult);
  } catch (error) {
    return res.send("error: " + error);
  }
};
