var express    = require("express"),
    router     = express.Router(),
    middleware = require('../middleware/index'),
    Place      = require("../models/place"),
    Comment    = require("../models/comment");


router.get("/:city/places/:id/comments/new", middleware.isLoggedIn, function (req, res) {

    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { place: place, currentUser: req.user });
        }
    });
});


router.post("/:city/places/:id/comments", middleware.isLoggedIn, function (req, res) {
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
                    res.redirect("/" + place.city + "/places");
                }
            });
        }
    });
});

router.get("/:city/places/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
            
    Comment.findById(req.params.comment_id, function(err, comment){
        if (err) {
            console.log(err);
            res.redirect( "/" + req.params.city + "/places/" + id);
        } else {
            res.render('comments/edit', {city: req.params.city, id: req.params.id, comment:comment})
        }
    });

});

router.put("/:city/places/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){

    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err) {
            res.redirect("back")
        } else {
            req.flash("success", "Comment deleted.");
            res.redirect("/" + req.params.city + "/places/" + req.params.id)
        }
    });

});

router.delete("/:city/places/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){

    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
            res.redirect("back")
        } else {
            
            res.redirect("/" + req.params.city + "/places/" + req.params.id)
        }
    });

});



module.exports = router