var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    middleware = require('../middleware/index'),
    async      = require('async'),
    nodemailer = require('nodemailer'),
    crypto     = require('crypto')
    User       = require("../models/user"),
    Place      = require("../models/place");
    NodeGeocoder = require('node-geocoder');

var options = {
    provider: "google",
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

var geocoder = NodeGeocoder(options)
    
router.get("/", (req, res) => {
    
    res.render("landing");
});

router.post("/", (req, res) => {
    geocoder.geocode({address: req.body.search}, (err, data) => {

        if(err || !data.length) {
            req.flash("error", "City not found");
            res.redirect("/");
        } else {
            console.log(data);
            res.redirect("/" + data[0].extra.googlePlaceId + "/places");
        }
    });

});

//REGISTER FORM

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var newUser = new User({
        username: req.body.username,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message + ".");
            return res.render("register")
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to CityPlaces: " + user.username);
            res.redirect("/");
        });
    });
});

// LOGIN FORM

router.get("/login", (req, res) => {

    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){ });

// LOGOUT LOGIC ROUTE

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged You Out!")
    res.redirect("/");
});

router.get("/password/reset",  (req, res) => {
    res.render('forgot');
});

router.post("/password/reset", (req, res, next) => {

    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if (!user) {
                    req.flash("error", "No account with that email exists.");
                    return res.redirect('/password/reset');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'aghwowlegion@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'aghwowlegion@gmail.com',
                subject: 'CityPlaces - reset password',
                text: 'http://' + req.headers.host + '/password/reset/' + token  
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('Mail sent!')
                req.flash("success", "An email has been sent to " + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if(err){
            req.flash("error", "Something has gone wrong.");
            return next(err);
        }

        res.redirect('/password/reset')
    });

});

router.get("/password/reset/:token", (req, res) => {

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
        if(!user){
            req.flash("error", "Password reset token is invalid or expired.");
            return res.redirect('/password/reset');
        }
    });

        res.render('reset', {token: req.params.token});
});

router.post("/password/reset/:token", (req, res) => {
    async.waterfall([
        function(done){
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
                if(!user){
                    req.flash("error", "Password reset token is invalid or expired.");
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err){
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err){
                            req.login(user, function(err){
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done){
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'aghwowlegion@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'aghwowlegion@gmail.com',
                subject: 'CityPlaces - your password has been changed',
                text: 'Confirmation message: ' + user.email 
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('Mail sent!')
                req.flash("success", "Your password has been changed.");
                done(err);
            });
        }, function(err){
            res.redirect("/");
        }
    ]);
});

router.get("/users/:id", middleware.isLoggedIn, (req, res) => {
    
    User.findById(req.params.id, function (err, user){
        
        if(err){
            req.flash("error", "Something went wrong.");
            return res.redirect("/")
        }
        Place.find().where('author.id').equals(user._id).exec(function(err, places) {
            if(err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/");
            } else {
                
                var gPlaces = geocodePlaces(places, 0, res, user);

            }  
        })
    });

});

function geocodePlaces(geoPlaces, i, res, user) {
    console.log(i);
    geocoder.geocode({googlePlaceId: geoPlaces[i].city}, (err, data) => {
        if(!err) {
            geoPlaces[i].city = data[0].formattedAddress;
        } else {
            geoPlaces[i].city = geoPlaces[i].city;
            console.log(err);
        }
        
        if(i == geoPlaces.length - 1) {]
            res.render("users/show", {user: user, places: geoPlaces});
            //return geoPlaces;
        } else {
            geocodePlaces(geoPlaces, i+1, res, user);
        }
    })
}


module.exports = router




