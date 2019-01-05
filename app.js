var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Place      = require("./models/place");

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
            res.render("places", {places: places, city:city, cityCap:cityCap});
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
    res.render("new", {city:city, cityCap: cityCap});

});

app.get("/:city/places/:id", function(req, res){
    var city = req.params.city;
    var cityCap = toTitleCase(city)
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
        }
        else{
            res.render("show", {place: place});
        }
    });


});



app.listen(3000, 'localhost', function(){
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
