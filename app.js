require('dotenv').config();

var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    localStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    flash          = require("connect-flash"),


    Place          = require("./models/place"),
    Comment        = require("./models/comment"),
    User           = require("./models/user"),
    seedDB         = require("./seeds");


var placeRoutes    = require("./routes/places"),
    commentRoutes  = require("./routes/comments"),
    indexRoutes    = require("./routes/index");
    

// seedDB();
mongoose.connect("mongodb://localhost:27017/city_places", { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "vfdsagjadfklgvadsfgbadfbdvpjmgbvzcjnxm`;Di3243tgqsradv90zhione;jkfavxc",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});

app.use(indexRoutes);
app.use(placeRoutes);
app.use(commentRoutes);

app.listen(3000, 'localhost', function(){
    console.log('Course project app has started!');
});

