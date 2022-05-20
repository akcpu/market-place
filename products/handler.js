// GET /api/products
app.get('/api/products', function (req, res) {
    res.send(db.products);
});

// GET /api/products/:id
app.get('/api/products/:id', function (req, res) {
    var reqId = req.params.id;
    const product = db.products.filter((product) =>{
        if ((reqId == product.id) ) {
            return true
        }
        else {
            return false
        }
    })
    if (product){
        return res.send(product);
    } else {
        return res.send ('ID not correct.');
    }
});

app.post('/api/products', function (req, res) {
    var product = {
        id: req.body.id,
        "name": req.body.name,
        price: req.body.price,
        "desc": req.body.desc
    };
    db.products.push(product);

    return res.send('product has been added successfully');
});