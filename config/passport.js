const LocalStrategy = require('passport-local').Strategy,
  User = require('../models/User');

module.exports = passport => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      (req, email, password, done) => {
        User.findOne({ email })
          .exec()
          .then(user => {
            if (!user) {
              return done(
                null,
                false,
                req.flash('error_msg', 'Authentication failed')
              );
            }
            // user exists
            user.comparePassword(password, isMatch => {
              if (!isMatch) {
                return done(
                  null,
                  false,
                  req.flash('error_msg', 'Authentication failed')
                );
              }
              // Password matched
              done(
                null,
                user,
                req.flash('success_msg', 'You are now logged in')
              );
            });
          });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .exec()
      .then(user => {
        done(null, user);
      });
  });
};
