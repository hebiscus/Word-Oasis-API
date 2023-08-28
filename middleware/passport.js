const Admin = require("../models/admin");
const passport = require("passport");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, (async(jwt_payload, done) => {
  try {
      const admin = await Admin.findOne({name: jwt_payload.name});
      if (!admin) {
        return done(null, false);
      }
      return done(null, admin);
  } catch(err) {
    console.log(err)
    return done(err, false);
  }
})));
