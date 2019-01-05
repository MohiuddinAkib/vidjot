const express = require('express'),
  mongoose = require('mongoose'),
  debug = require('debug')('app:heart'),
  exphbs = require('express-handlebars'),
  path = require('path'),
  helmet = require('helmet'),
  compression = require('compression'),
  methodOverride = require('method-override'),
  flash = require('connect-flash'),
  cookieSession = require('cookie-session'),
  cookieParser = require('cookie-parser'),
  passport = require('passport'),
  config = require('config'),
  app = express();

// Passport config
require('./config/passport')(passport);

// Middleware
// Body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Method override
app.use(methodOverride('_method'));
// Helmet middleware
app.use(helmet());
app.use(compression());
// Express cookie-session middleware
app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    keys: [config.get('secretOrKey')],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);
// Init passport
app.use(passport.initialize());
app.use(passport.session());
// Connect flash middleware
app.use(flash());
// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Template engine
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');
// Morgan
if (app.get('env') === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
  debug('Morgan enabled...');
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Local variables
// App name
app.locals.APP_NAME = 'VidJot';

// Home route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', { title, page_title: 'Home', homePage: true });
});

// About page
app.get('/about', (req, res) => {
  const title = 'About',
    description =
      'This is a Node/Express app for jotting down ideas for future Youtube videos',
    version = '1.0.0';
  res.render('about', {
    title,
    description,
    version,
    page_title: title,
    aboutPage: true
  });
});

// Idea routes
app.use('/ideas', require('./routes/ideas'));
// User routes
app.use('/users', require('./routes/users'));

// Not found handling
app.use((req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.render('404', {
    status: err.status || 500,
    message: err.message,
    page_title: '404'
  });
});

// PORT number
const PORT = process.env.PORT || 8000;
// Listen for request
app.listen(PORT, () => {
  debug(`Server running on port ${PORT}`);
  // Mongoose promise
  mongoose.Promise = global.Promise;
  // Connect to DB
  mongoose.connect(
    config.get('MONGO_URI'),
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false
    }
  );
  // DB connection error handling
  mongoose.connection
    .once('open', () => debug('DB connection established'))
    .on('error', err => debug('DB connection error', err));
});
