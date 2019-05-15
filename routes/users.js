const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;
  let errors = [];
  if (!username || !email || !password || !passwordConfirm) {
    errors.push({ msg: "All fields are required" });
  }
  if (!username) {
    console.log("no username");
  }
  if (!email) {
    console.log("no email");
  }
  if (!password) {
    console.log("no password");
  }
  if (!passwordConfirm) {
    console.log("no password2");
  }
  if (password !== passwordConfirm) {
    errors.push({ msg: "Passwords do not match" });
  }
  if (password.length < 8) {
    errors.push({ msg: "Passwords must be at least 8 characters." });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      username,
      email,
      password,
      passwordConfirm
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: "Email already in use." });
        res.render("register", {
          errors,
          username,
          email,
          password,
          passwordConfirm
        });
      } else {
        const newUser = new User({
          username,
          email,
          password
        });
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  "success_msg",
                  "You are now registered.  Please login."
                );
                res.redirect("./login");
              })
              .catch(err => console.log(err));
          })
        );
        console.log(newUser);
      }
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
  // console.log(res);
});

router.get("/logout", (req, res, next) => {
  req.logout();
  req.flash("success_msg", "You have been logged out");
  res.redirect("/users/login");
});

module.exports = router;
