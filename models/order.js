const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    products: [
        {
            product: {
                type: Object,
                require: true,
            },
            count: {
                type: Number,
                require: true,
            },
        },
    ],
    user: {
        name: {
            type: String,
            require: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = model('Order', orderSchema);