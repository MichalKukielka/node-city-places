
var middlewareObj = {},
    Place         = require("../models/place"),
    Comment       = require("../models/comment");

middlewareObj.checkPlaceOwnership = function(req, res, next){

    if(req.isAuthenticated()){
        Place.findById(req.params.id, function(err, place){
            if(err){
                req.flash("error", "Place not found.")
                res.redirect("/" + place.city + "/places");
            } else {

                if(place.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that.");
                    res.redirect("back");
                }
                
            }
        });
    
    } else { 
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }

};


middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    req.session.redirectUrl = req.url;
    
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
};

middlewareObj.doLogin = function(req, res, next) {
    if(req.query.login){
        const url = require('url');
        req.session.redirectUrl = url.parse(req.url).pathname;
        res.redirect('/login');
    }else{
        next();
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){

    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err){
                res.redirect("back");
            } else {

                if(comment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You dont have permission to do that.");
                    res.redirect("back");
                }
                
            }
        });
    
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }

};



module.exports = middlewareObj;