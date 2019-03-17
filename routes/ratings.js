var express    = require("express"),
    router     = express.Router(),
    middleware = require('../middleware/index'),
    Place      = require("../models/place"),
    Comment    = require("../models/comment");
    Rating    = require("../models/rating");
    ObjectId = require('mongodb').ObjectID;

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
        Place.findByIdAndUpdate(req.params.id, { ratingsAvg: Math.round(result[0].avg * 100)/100,
                                                ratingsCount: result[0].count }, function(err, result){
            if (err) {
                console.log(err);
            }
        });
        res.send(result);
    })
});

router.post("/:city/places/:id/setRating", (req, res) => {
    console.log(req.query);
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


module.exports = router