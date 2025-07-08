const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SALTROUNDS = 10;
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });
userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(SALTROUNDS, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, null, (error, hash) => {
      if (error) {
        return next(error);
      }
      user.password = hash;
      next();
    });
  });
});


userSchema.methods.comparePassword = function (password) {
    console.log(password)
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.getTokens = function () {
  const accessToken = jwt.sign(
    {
      email: this.email,
      name: this.name,
    },
   process.env.DEV_ACCESS_SECRET,
    {
      expiresIn: process.env.DEV_ACCESS_EXPIRE,
    }
  );

  const refreshToken = jwt.sign(
    { name: this.name },
   process.env.DEV_REFRESH_SECRET,
    {
      expiresIn: process.env.DEV_REFRESH_EXPIRE,
    }
  );

  return { accessToken, refreshToken };
};

userSchema.methods.renewAccessToken = function () {
  const accessToken = jwt.sign(
    {
      name: this.name,
     
      email: this.email,
    },
    process.env.DEV_ACCESS_SECRET,
    {
      expiresIn: process.env.DEV_ACCESS_EXPIRE,
    }
  );

  return { accessToken };
};

module.exports = mongoose.model('User', userSchema);
