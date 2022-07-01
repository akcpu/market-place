const { ajv } = require("../validation");
const validate_getID = ajv.getSchema("getID");
const validate_setData = ajv.getSchema("setData");
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
  if (validate_getID(req.params)) {
    productService
      .getProductById(req.params.id)
      .then((products) => {
        res.send(products);
      })
      .catch((err) => {
        res.status(404).json({ msg: "No product found" + err });
      });
  } else {
    console.log(validate_getID.errors);
    res
      .status(404)
      .json({ msg: "No user found" + JSON.stringify(validate_getID.errors) });
  }
};

// POST /api/products
exports.setProduct = function (req, res) {
  if (validate_setData(req.body)) {
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
  } else {
    console.log(validate_setData.errors);
    res
      .status(404)
      .json({ msg: "No user found" + JSON.stringify(validate_setData.errors) });
  }
};
