var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    middleware = require('../middleware/index'),
    async      = require('async'),
    nodemailer = require('nodemailer'),
    crypto     = require('crypto')
    User       = require("../models/user"),
    Place      = require("../models/place");

    
router.get("/", function(req, res){
    
    res.render("landing");
});

router.post("/", function(req, res){
    res.redirect("/" + req.body.search.toLowerCase() + "/places")

});

//REGISTER FORM

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
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

router.get("/login", function(req, res){

    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){ });

// LOGOUT LOGIC ROUTE

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged You Out!")
    res.redirect("/");
});

// USER PROFILE

router.get("/users/:id", middleware.isLoggedIn, function(req, res){
    
    User.findById(req.params.id, function (err, user){
        
        if(err){
            req.flash("error", "Something went wrong.");
            return res.redirect("/")
        }
        Place.find().where('author.id').equals(user._id).exec(function(err, places) {
            if(err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/");
            }
            res.render("users/show", {user: user, places: places});
            })
    });

});

router.get("/password/reset", function(req, res){
    res.render('forgot');
});

router.post("/password/reset", function(req, res, next){

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

router.get("/password/reset/:token", function(req, res){

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
        if(!user){
            req.flash("error", "Password reset token is invalid or expired.");
            return res.redirect('/password/reset');
        }
    });

        res.render('reset', {token: req.params.token});
});

router.post("/password/reset/:token", function(req, res){
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


module.exports = router




