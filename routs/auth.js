const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const key = require('../keys');
const registrationLetter = require('../emails/registration');
const resetLetter = require('../emails/reset');
const changedPasswordLetter = require('../emails/changedpass');
const { registersValidators } = require('../utils/validators');
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: key.SENDGRID_API_KEY},
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Login page',
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
        isLogin: true
    });
});

router.get('/logout', async (req, res) => {
    // req.session.isAuthenticated = false;
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const candidate = await User.findOne({ email: email });

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);

            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                req.flash('loginError', 'Wrong email or password!');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'Wrong email or password!');
            res.redirect('/auth/login#login');
        }
    } catch(e) {
        console.log('Error:', e);
    }
});

// registersValidators - middleware validator
router.post('/register', registersValidators, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }
        
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, name, password: hashPassword, cart: {items: []} });
        await user.save();
        res.redirect('/auth/login#login');
        await transporter.sendMail(registrationLetter(email));
    } catch(e) {
        console.log('Error:', e);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset password',
        resetError: req.flash('resetError')
    });
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('resetError', err);
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');

            const candidate = await User.findOne({email: req.body.email});

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 3600000;
                await candidate.save();
                await transporter.sendMail(resetLetter(candidate.email, token));
                res.redirect('/auth/login#login');
            } else {
                req.flash('resetError', 'Not exist email in database');
                res.redirect('/auth/reset');
            }
        });
    } catch (e) {
        console.log('Error:', e);
    } 
});

router.get('/changepass/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login#login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            return res.redirect('/auth/login#login');
        } else {
            res.render('auth/password', {
                title: 'Set new password',
                resetError: req.flash('resetError'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (e) {
        console.log('Error:', e);
    }
});

router.post('/password', async (req, res) => {
    try {
        if (req.body.password !== req.body.confirm) {
            req.flash('resetError', 'Wrong password!');
            return res.redirect(`/auth/changepass/${req.body.token}`);
        }

        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login#login');
            await transporter.sendMail(changedPasswordLetter(user.email));
        } else {
            req.flash('loginError', 'Token was expaired');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log('Error:', e);
    }
});

module.exports = router;