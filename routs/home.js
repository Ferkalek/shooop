const { Router } = require('express'); // OR const express.Router = ...
const router = Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home | Shooopogolik',
        isHome: true,
    });
});

module.exports = router;