const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    name: String,
    password: {
        type: String,
        required: true,
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    require: true,
                    default: 1,
                },
                productID: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    require: true
                }
            }
        ],
    },
});

userSchema.methods.addToCart = function(product) {
    const items = [...this.cart.items];
    const ind = items.findIndex(p => {
        return p.productID.toString() === product._id.toString();
    });

    if (ind >= 0) {
        items[ind].count++;
    } else {
        items.push({
            productID: product._id,
            count: 1,
        });
    }

    this.cart = { items };
    this.save();
};

userSchema.methods.deleteFromCart = function(id) {
    let items = [...this.cart.items];
    const idx = items.findIndex(p => p.productID.toString() === id.toString());
    
    if (items[idx].count === 1) {
        items = items.filter(p => p.productID.toString() !== id.toString());
    } else {
        items[idx].count--;
    }

    this.cart = { items };
    this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = model('User', userSchema);