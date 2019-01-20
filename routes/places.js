var express = require("express"),
    router  = express.Router(),
    Place   = require("../models/place");

router.get("/:city/places", function(req, res){

    var city = req.params.city;
    var cityCap = toTitleCase(city);

    Place.find({"city": city}, function(err, places){
        if(err){
            console.log(err);
        }
        else {

            res.render("places/places", {places: places, city:city, cityCap:cityCap, currentUser: req.user});

        }
    })
});

router.post("/:city/places", isLoggedIn, function(req, res){

    var city = req.params.city;
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };

    var newPlace = {
        city: city, 
        name: name, 
        image: image,
        description: description,
        author: author
    };
    
    Place.create(newPlace, function(err, place){
        if(err){
            console.log(err);
        }
        else {
            res.redirect("/" + place.city + "/places")
        }
    });
});

router.get("/:city/places/new", isLoggedIn, function(req, res){
    var city = req.params.city;
    var cityCap = toTitleCase(city);

    res.render("places/new", {city:city, cityCap: cityCap});

});

router.get("/:city/places/:id", function(req, res){
    var city = req.params.city;
    Place.findById(req.params.id).populate("comments").exec(function(err, place){
        if(err){
            console.log(err);
        }
        else{
            res.render("places/show", {place: place,});
        }
    });
});

// EDIT PLACE ROUTE
router.get("/:city/places/:id/edit", checkPlaceOwnership, function(req, res){

    Place.findById(req.params.id, function(err, place){
        
        if(err){
            console.log(err)
        } else {
            res.render("places/edit", {place: place});
        }

    });

});

// UPDATE PLACE ROUTE
router.put("/:city/places/:id", checkPlaceOwnership, function(req, res){
    Place.findByIdAndUpdate(req.params.id, req.body.place, function(err, updatedPlace){
        if(err){
            res.redirect("/" + updatedPlace.city + "/places");
        } else {
            res.redirect("/" + updatedPlace.city + "/places/" + updatedPlace._id);
        }
    });
});

// DESTROY PLACE ROUTE
router.delete("/:city/places/:id", checkPlaceOwnership, function(req, res){
    city = req.params.city
    Place.findByIdAndRemove(req.params.id, function(err, place){
        if (err) {
            res.redirect("/" + city + "/places");
        } else {
            res.redirect("/" + city + "/places");
        }
    });
});

function toTitleCase(string){
    // \u00C0-\u00ff for a happy Latin-1
    return string.toLowerCase().replace(/_/g, ' ').replace(/\b([a-z\u00C0-\u00ff])/g, function (_, initial) {
        return initial.toUpperCase();
    }).replace(/(\s(?:de|a|o|e|da|do|em|ou|[\u00C0-\u00ff]))\b/ig, function (_, match) {
        return match.toLowerCase();
    });
}
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

function checkPlaceOwnership(req, res, next){

    if(req.isAuthenticated()){
        Place.findById(req.params.id, function(err, place){
            if(err){
                res.redirect("/" + place.city + "/places");
            } else {

                if(place.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
                
            }
        });
    
    } else { 
        res.redirect("back");
    }

}

module.exports = router