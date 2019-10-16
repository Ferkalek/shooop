const { Router } = require('express');
const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const auth = require('../middleware/auth');
const { productsValidators } = require('../utils/validators');
const router = Router();

function isOwner(product, req) {
    return product.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('userId', 'email name')
            .select('title description price');

        res.render('products', {
            title: 'Products | Shooopogolik',
            isProducts: true,
            userId: req.user ? req.user._id.toString() : null,
            products
        });
    } catch(e) {
        console.log('Error:', e);
    }
});

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }

    try {
        const product = await Product.findById(req.params.id);

        if (!isOwner(product, req)) {
            return res.redirect('/products');
        }

        res.render('edit-product', {
            title: `Edit product - ${product.title}`,
            product
        })
    } catch(e) {
        console.log('Error:', e);
    }
});

router.post('/edit', auth, productsValidators, async (req, res) => {
    const errors = validationResult(req);
    const { id, title, description, price } = req.body;

    if (!errors.isEmpty()) {
        return res.status(422).render(`edit-product`, {
            title: `Edit product - ${title}`,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price
            }
        });
    }
    
    try {
        await Product.findByIdAndUpdate(id, { title, description, price });
        res.redirect('/products');
    } catch(e) {
        console.log('Error:', e);
    }
});

router.post('/delete', auth, async (req, res) => {
    try {
        await Product.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/products');
    } catch (e) {
        console.log('Error:', e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('product', {
            layout: 'empty',
            title: `${product.title} | Shooopogolik`,
            product
        });
    } catch (e) {
        console.log('Error:', e);
    }
});

module.exports = router;