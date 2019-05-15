const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
// api stuff
const axios = require("axios");
const apiKey = require("../api-key").MY_KEY;

router.post("/events", ensureAuthenticated, (req, res) => {
  const location = req.body.location;
  const arrive = req.body.arrive;
  const leave = req.body.leave;
  const arriveJustNumbers = arrive.replace(/[^A-Za-z0-9]/g, "") + "00";
  const leaveJustNumbers = leave.replace(/[^A-Za-z0-9]/g, "") + "00";
  const dateRange = arriveJustNumbers + "-" + leaveJustNumbers;
  var calls = [0, "popular"];
  const axiosRequests = [
    axios.get(
      "http://api.eventful.com/json/events/search?app_key=" +
        apiKey +
        "&l=" +
        location +
        "&date=" +
        dateRange +
        "&page_number=1&page_size=10&sort_order=popularity"
    )
  ];

  if (req.body.music === "on") {
    axiosRequests.push(
      axios.get(
        "http://api.eventful.com/json/events/search?app_key=" +
          apiKey +
          "&l=" +
          location +
          "&date=" +
          dateRange +
          "&page_number=1&page_size=10&sort_order=popularity&c=music"
      )
    );
    calls.push("music");
  }
  if (req.body.outdoor === "on") {
    axiosRequests.push(
      axios.get(
        "http://api.eventful.com/json/events/search?app_key=" +
          apiKey +
          "&l=" +
          location +
          "&date=" +
          dateRange +
          "&page_number=1&page_size=10&sort_order=popularity&c=outdoors_recreation"
      )
    );
    calls.push("outdoor");
  }
  if (req.body.sports === "on") {
    axiosRequests.push(
      axios.get(
        "http://api.eventful.com/json/events/search?app_key=" +
          apiKey +
          "&l=" +
          location +
          "&date=" +
          dateRange +
          "&page_number=1&page_size=10&sort_order=popularity&category=sports"
      )
    );
    calls.push("sports");
  }
  var events;
  axios
    .all(axiosRequests)
    .then(
      axios.spread((response1, response2, response3, response4) => {
        events = {
          popular: response1.data.events
        };
        if (calls.includes("music")) {
          events.music = response2.data.events;
        }
        if (calls.includes("outdoor")) {
          if (calls.indexOf("outdoor") === 2) {
            events.outdoor = response2.data.events;
          } else {
            events.outdoor = response3.data.events;
          }
        }
        if (calls.includes("sports")) {
          if (calls.indexOf("sports") === 2) {
            events.sports = response2.data.events;
          } else if (calls.indexOf("sports") === 3) {
            events.sports = response3.data.events;
          } else {
            events.sports = response4.data.events;
          }
        }
        res.render("trip", events);
        console.log(events.popular.event[0]);
        // console.log(events.popular.event[0].venue_address);
        // console.log(events.music.event[0].venue_address);
        // console.log(events.outdoor.event[0].venue_address);
        // console.log(events.sports.event[0].venue_address);
      })
    )
    .catch(error => console.log(error));
});

module.exports = router;
