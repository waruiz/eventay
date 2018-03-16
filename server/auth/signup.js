var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user.js");
var bCrypt = require("bcryptjs");

module.exports = passport => {
  passport.use(
    "signup",
    new LocalStrategy(
      {
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      (req, username, password, done) => {
        // console.log(userModel);
        // findOrCreateUser = () => {
        // find a user in Mongo with provided username
        User.findOne({ username: username }, (err, user) => {
          // In case of any error, return using the done method
          if (err) {
            console.log("Error in SignUp: " + err);
            return done(err);
          }
          // already exists
          if (user) {
            console.log("User already exists with username: " + username);
            return done(
              null,
              false
              // req.flash("message", "User Already Exists")
            );
          } else {
            // create new  user
            var newUser = new User();

            // set the user's local credentials
            newUser.username = username;
            newUser.password = createHash(password);
            // newUser.email = req.param("email");
            // newUser.firstName = req.param("firstName");
            // newUser.lastName = req.param("lastName");

            // save the user
            console.log("saving the user");
            newUser.save(err => {
              if (err) {
                console.log("Error in Saving user:", err);
                throw err;
              }
              console.log("User Registration succesful");
              return done(null, newUser);
            });
          }
        });
        // };
        // Delay the execution of findOrCreateUser and execute the method
        // in the next tick of the event loop
        // process.nextTick(findOrCreateUser);
      }
    )
  );

  // Generates hash using bCrypt
  var createHash = password => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };
};
