const { body } = require('express-validator/check');
const User = require('../models/user');

exports.registersValidators = [
    body('email').isEmail()
        .withMessage('Email is wrong!')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('User exist with this email!');
                }
            } catch (e) {
                console.log('Error:', e);
            }
        })
        .normalizeEmail(),
    body('password', 'Enter correct password (min 6 letters)!')
        .isLength({min: 6})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Password must be the same!')
            }
            return true;
        })
        .trim(),
    body('name')
        .isLength({min: 3})
        .withMessage('Enter correct name (min 3 letters)!')
        .trim()
];

exports.productsValidators = [
    body('title')
        .isLength({min: 3})
        .withMessage('Min letters length of title is 3!')
        .trim(),
    body('description')
        .isLength({min: 3})
        .withMessage('Min letters length of description is 6!')
        .trim(),
    body('price')
        .isNumeric()
        .withMessage('Enter correct price!'),
];