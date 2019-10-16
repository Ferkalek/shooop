const { Schema, model } = require('mongoose');

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

// deleted from object _id and create id
productSchema.method('toClient', function() {
    const product = this.toObject();
    product.id = product._id;
    delete product._id;
    return product;
});

module.exports = model('Product', productSchema);