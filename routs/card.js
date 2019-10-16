const { Router } = require('express');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const router = Router();

function mapCartItems(cart) {
    return cart.items.map(p => ({
        ...p.productID._doc,
        id: p.productID.id,
        count: p.count,
    }))
}

function computPrice(products) {
    return products.reduce((total, product) => {
        return total += product.price * product.count;
    }, 0);
}

router.post('/add', auth, async (req, res) => {
    const product = await Product.findById(req.body.id);
    await req.user.addToCart(product);
    res.redirect('/card');
});

router.delete('/delete/:id', auth, async (req, res) => {
    await req.user.deleteFromCart(req.params.id);
    const user = await req.user.populate('cart.items.productID').execPopulate();
    const products = mapCartItems(user.cart);
    const cart = {
        products: products,
        price: computPrice(products),
    };

    res.status(200).json(cart);
});

router.get('/', auth, async (req, res) => {
    const user = await req.user
    .populate('cart.items.productID').execPopulate();

    const products = mapCartItems(user.cart);

    res.render('card', {
        title: 'Card',
        isCard: true,
        products: products,
        price: computPrice(products)
    });
});


module.exports = router;