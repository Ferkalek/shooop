const express = require('express');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoos = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const exphbs = require('express-handlebars');
const sessin = require('express-session');
const MongoStore = require('connect-mongodb-session')(sessin);
const errorHandler = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const keys = require('./keys');

// import routes
const homeRoute = require('./routs/home');
const cardRoute = require('./routs/card');
const addRoute = require('./routs/add');
const ordersRout = require('./routs/orders');
const productsRoute = require('./routs/products');
const authRouts = require('./routs/auth');
const profileRouts = require('./routs/profile');
// END import routes

const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');

const app = express();

const store = new MongoStore({
    colection: 'sessions',
    uri: keys.MONGODB_URL
});

// START настройка handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    // create helpers for conditions hide/show buttons depend on users
    helpers: require('./utils/hbs-helpers')
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
// END настройка handlebars

// doing folder public and images like static 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// get data after send form (add product)
app.use(express.urlencoded({
    extended: true
}));

// setting express-sessin
app.use(sessin({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
}));
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

// use rout
app.use('/', homeRoute);
app.use('/products', productsRoute);
app.use('/add-product', addRoute);
app.use('/card', cardRoute);
app.use('/orders', ordersRout);
app.use('/auth', authRouts);
app.use('/profile', profileRouts);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoos.connect(keys.MONGODB_URL, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
         });
         app.listen(PORT, () => {
            console.log(`Server was running on port ${PORT}`); 
        });
    } catch(e) {
        console.log('Error:', e);
    }
}

start();