const { Router } = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id })
            .populate('user.userId');

        res.render('orders', {
            title: `Orders page`,
            isOrders: true,
            orders: orders.map(o => {
                return {
                    ...o._doc,
                    price: o.products.reduce((total, p) => {
                        return total += p.count * p.product.price;
                    }, 0)
                }
            })
        })
    } catch(e) {
        console.log('Error ->', e);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user
        .populate('cart.items.productID').execPopulate();

        const products = user.cart.items.map(p => ({
            count: p.count,
            product: {...p.productID._doc},
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            products: products,
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch(e) {
        console.log('Error ->', e);
    }
});

module.exports = router;