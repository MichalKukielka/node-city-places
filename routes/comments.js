var express    = require("express"),
    router     = express.Router(),
    middleware = require('../middleware/index'),
    Place      = require("../models/place"),
    Comment    = require("../models/comment");
    Rating    = require("../models/rating");
    ObjectId = require('mongodb').ObjectID;


router.get("/:city/places/:id/comments/new", middleware.isLoggedIn, (req, res) => {

    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { place: place, currentUser: req.user });
        }
    });
});

router.get("/:city/places/:id/rating", function (req, res) {
    Rating.findOne({'author.id': req.user._id, 'place': ObjectId(req.params.id)}).populate("ratings").exec(function(err, rating){
        if(err){
            console.log(err);
        }
        else{
            if(rating == null) res.send({userRating : 0});
            else res.send({userRating : rating});
        }
    });
});

router.get("/:city/places/:id/avgRating", function (req, res) {
    Rating.aggregate([
        {"$match": { "place": ObjectId(req.params.id)}},
        {$group: {_id: "$place", avg: {$avg: "$rating"}, count: {$sum: 1}}}
    ]).then(function(result) {
        res.send(result);
    })
});

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

router.post("/:city/places/:id/setRating", function(req, res){
    var city = req.params.city;
    Place.findById(req.params.id).populate("ratings").exec(function (err, place) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong.");
            res.redirect("/:city/places");
        }
        else {
            Rating.count({'author.id': req.user._id, 'place': ObjectId(req.params.id)}, function(err, count){
                if(count == 0) {
                    Rating.create({rating: req.body.rating}, function (err, rating) {
                        if (err) {
                            console.log(err);
                            req.flash("error", "Something went wrong.");
                            res.redirect("/:city/places");
                        }
                        else {
                            rating.author.id = req.user._id;
                            rating.author.username = req.user.username;
                            rating.place = place;
                            rating.save();
                            place.ratings.push(rating);
                            place.save();
                            req.flash("success", "Successfully added rating.");
                            res.sendStatus(200);
                        }
                    });
                } else {
                    Rating.findOneAndUpdate({'author.id': req.user._id, 'place': ObjectId(req.params.id)}, {rating: req.body.rating}, function(err, rating){
                        if(err) {
                            console.log(err);
                            req.flash("error", "Something went wrong.");
                            res.redirect("/:city/places");
                        } else {
                            req.flash("success", "Rating updated.");
                            res.sendStatus(200);
                        }
                    });
                }
            })
        }
    });
});

router.delete("/:city/places/:id/deleteRating", function(req, res){
    var city = req.params.city;
    Place.findById(req.params.id).populate("ratings").exec(function (err, place) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong.");
            res.redirect("/:city/places");
        }else{
            Rating.deleteOne({'author.id': req.user._id, 'place': ObjectId(req.params.id)}, function(err) {
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong.");
                    res.sendStatus(502);
                } else {
                    req.flash("success", "Rating deleted.");
                    res.sendStatus(200);
                }
            })
        }
    });
});

router.post("/:city/places/:id/newComment", (req, res) => {
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

router.get("/:city/places/:id/comments/:comment_id/edit", middleware.checkCommentOwnership,  (req, res) => {
            
    Comment.findById(req.params.comment_id, function(err, comment){
        if (err) {
            console.log(err);
            res.redirect( "/" + req.params.city + "/places/" + id);
        } else {
            res.render('comments/edit', {city: req.params.city, id: req.params.id, comment:comment})
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

module.exports = router