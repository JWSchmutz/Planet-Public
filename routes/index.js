const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

router.get("/", (req, res) => res.render("index"));
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    username: req.username
  })
);
router.get("/trip", ensureAuthenticated, (req, res) =>
  res.render("trip", {
    username: req.username
  })
);
module.exports = router;
