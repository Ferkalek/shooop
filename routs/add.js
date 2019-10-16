const { Router } = require('express');
const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const auth = require('../middleware/auth');
const { productsValidators } = require('../utils/validators');
const router = Router();

router.get('/', auth, (req, res) => {
    res.render('add-product', {
        title: 'Add product | Shooopogolik',
        isAdd: true,
    });
});

router.post('/', auth, productsValidators, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('add-product', {
            title: 'Add product | Shooopogolik',
            isAdd: true,
            error: errors.array()[0].msg,
            // prevent clear data if have error
            data: {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price
            }
        });
    }

    const { title, description, price } = req.body;
    const product = new Product({ title, description, price, userId: req.user });

    try {
        await product.save();
        res.redirect('/products');
    } catch(e) {
        console.log('Error:', e);
    }
});

module.exports = router;