var express    = require("express"),
    router     = express.Router(),
    middleware = require('../middleware/index'),
    Place      = require("../models/place"),
    Comment    = require("../models/comment");
    Rating    = require("../models/rating");
    ObjectId = require('mongodb').ObjectID;

router.get("/:city/places/:id/comments", function (req, res) {

    Place.findById(req.params.id).populate("comments").exec(function(err, place){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/commentsSection",{ place: place, currentUser: req.user });
        }
    });
});

router.post("/:city/places/:id/comments", middleware.isLoggedIn, (req, res) => {
    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong.");
            res.redirect("/:city/places");
        }
        else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    place.comments.push(comment);
                    place.save();
                    req.flash("success", "Successfully added comment.");
                    res.redirect("/" + place.city + "/places/" + place.id);
                }
            });
        }
    });
});

router.post("/:city/places/:id/newComment", middleware.isLoggedIn, (req, res) => {
    var city = req.params.city;
    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong.");
            res.redirect("/:city/places");
        }
        else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("ASS");
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    place.comments.push(comment);
                    place.save();
                    req.flash("success", "Successfully added comment.");
                    res.sendStatus(200);
                }
            });
        }
    });
});

router.put("/:city/places/:id/comments/:comment_id", middleware.checkCommentOwnership,  (req, res) => {

    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err) {
            res.redirect("back")
        } else {
            req.flash("success", "Comment updated.");
            res.redirect("/" + req.params.city + "/places/" + req.params.id)
        }
    });

});

router.delete("/:city/places/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {

    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
            req.flash("error", "Something went wrong.");
            res.sendStatus(500);
        } else {
            req.flash("warning", "Comment deleted.");
            res.sendStatus(200);
        }
    });

});

module.exports = router