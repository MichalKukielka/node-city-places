var express = require("express"),
    router  = express.Router(),
    Place   = require("../models/place"),
    Comment   = require("../models/comment");


router.get("/:city/places/:id/comments/new", isLoggedIn, function (req, res) {

    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { place: place, currentUser: req.user });
        }
    });
});

router.post("/:city/places/:id/comments", isLoggedIn, function (req, res) {
    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
            res.redirect("/:city/places");
        }
        else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    place.comments.push(comment);
                    place.save();
                    res.redirect("/" + place.city + "/places");
                }
            });
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = router