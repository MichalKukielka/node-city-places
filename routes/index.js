var express  = require("express"),
    router   = express.Router(),
    passport = require("passport"),
    User     = require("../models/user"),
    Place    = require("../models/place");

    
router.get("/", function(req, res){
    
    res.render("landing", {currentUser: req.user});
});

//REGISTER FORM

router.get("/register", function(req, res){
    res.render("register", {currentUser: req.user});
});

router.post("/register", function(req, res){
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

router.get("/login", function(req, res){
    res.render("login", {currentUser: req.user});


});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){ });

router.get("/:city/places/:id/comments/new", function(req, res){
    
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

router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

module.exports = router




