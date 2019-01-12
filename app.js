var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    passport      = require("passport"),
    localStrategy = require("passport-local"),
    Place         = require("./models/place"),
    Comment       = require("./models/comment"),
    User          = require("./models/user"),
    seedDB        = require("./seeds");


seedDB();
mongoose.connect("mongodb://localhost:27017/city_places", { useNewUrlParser: true });


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "vfdsagjadfklgvadsfgbadfbdvpjmgbvzcjnxm`;Di3243tgqsradv90zhione;jkfavxc",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    
    res.render("landing", {currentUser: req.user});
});

app.get("/:city/places", function(req, res){

    var city = req.params.city;
    var cityCap = toTitleCase(city)

    Place.find({"city": city}, function(err, places){
        if(err){
            console.log(err);
        }
        else {

            res.render("places/places", {places: places, city:city, cityCap:cityCap, currentUser: req.user});

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

    res.render("places/new", {city:city, cityCap: cityCap, currentUser: req.user});

});

app.get("/:city/places/:id", function(req, res){
    var city = req.params.city;
    var cityCap = toTitleCase(city)
    Place.findById(req.params.id).populate("comments").exec(function(err, place){
        if(err){
            console.log(err);
        }
        else{
            res.render("places/show", {place: place, currentUser: req.user});
        }
    });
});

app.get("/:city/places/:id/comments/new", isLoggedIn, function(req, res){
    
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
        }
        else {
            res.render("comments/new", {place: place, currentUser: req.user});
        }
    });
});

app.post("/:city/places/:id/comments", isLoggedIn, function(req, res){
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

//AUTH ROUTES

//REGISTER FORM

app.get("/register", function(req, res){
    res.render("register", {currentUser: req.user});
});

app.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {currentUser: req.user})
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        });
    });
});

// LOGIN FORM

app.get("/login", function(req, res){
    res.render("login", {currentUser: req.user});


});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){ });

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

// LOGOUT LOGIC ROUTE

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});





app.listen(3001, 'localhost', function(){
    console.log('Course project app has started!');
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};


function toTitleCase(string){
    // \u00C0-\u00ff for a happy Latin-1
    return string.toLowerCase().replace(/_/g, ' ').replace(/\b([a-z\u00C0-\u00ff])/g, function (_, initial) {
        return initial.toUpperCase();
    }).replace(/(\s(?:de|a|o|e|da|do|em|ou|[\u00C0-\u00ff]))\b/ig, function (_, match) {
        return match.toLowerCase();
    });
}
