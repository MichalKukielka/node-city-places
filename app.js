var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Place      = require("./models/place"),
    Comment    = require("./models/comment"),
    seedDB     = require("./seeds");


seedDB();
mongoose.connect("mongodb://localhost:27017/city_places", { useNewUrlParser: true });


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/:city/places", function(req, res){

    var city = req.params.city;
    var cityCap = toTitleCase(city)

    Place.find({"city": city}, function(err, places){
        if(err){
            console.log(err);
        }
        else {
            res.render("places/places", {places: places, city:city, cityCap:cityCap});
        }
    })
});

app.post("/:city/places", function(req, res){

    var city = req.params.city;
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newPlace = {
        city: city, 
        name: name, 
        image: image,
        description: description};

    Place.create(newPlace, function(err, place){
        if(err){
            console.log(err);
        }
        else {
            res.redirect("/" + place.city + "/places")
        }
    });
});

app.get("/:city/places/new", function(req, res){
    var city = req.params.city;
    var cityCap = toTitleCase(city)
    res.render("places/new", {city:city, cityCap: cityCap});

});

app.get("/:city/places/:id", function(req, res){
    var city = req.params.city;
    var cityCap = toTitleCase(city)
    Place.findById(req.params.id).populate("comments").exec(function(err, place){
        if(err){
            console.log(err);
        }
        else{
            res.render("places/show", {place: place});
        }
    });
});

app.get("/:city/places/:id/comments/new", function(req, res){
    
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
        }
        else {
            res.render("comments/new", {place: place});
        }
    });
});

app.post("/:city/places/:id/comments", function(req, res){
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
            res.redirect("/:city/places");
        }
        else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else {
                    place.comments.push(comment);
                    place.save();
                    console.log(place.city + "/places/")
                    res.redirect("/" + place.city + "/places");
                }    
            });
        }
    });
});


app.listen(3001, 'localhost', function(){
    console.log('Course project app has started!');
});


function toTitleCase(string)
{
    // \u00C0-\u00ff for a happy Latin-1
    return string.toLowerCase().replace(/_/g, ' ').replace(/\b([a-z\u00C0-\u00ff])/g, function (_, initial) {
        return initial.toUpperCase();
    }).replace(/(\s(?:de|a|o|e|da|do|em|ou|[\u00C0-\u00ff]))\b/ig, function (_, match) {
        return match.toLowerCase();
    });
}
