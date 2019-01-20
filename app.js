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


var placeRoutes   = require("./routes/places"),
    commentRoutes = require("./routes/comments"),
    indexRoutes   = require("./routes/index");

// seedDB();
mongoose.connect("mongodb://localhost:27017/city_places", { useNewUrlParser: true });


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use(placeRoutes);
app.use(commentRoutes);

app.listen(3000, 'localhost', function(){
    console.log('Course project app has started!');
});

