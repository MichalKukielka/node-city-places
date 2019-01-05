var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/cat_app", { useNewUrlParser: true });

var catSchema = new mongoose.Schema({
    name: String,
    age: Number,
    temperament: String
});

var Cat = mongoose.model("Cat", catSchema);

// Adding new cat do DB

// var george = new Cat({
//     name: "McGonnagal",
//     age: 543,
//     temperament: "Memes"
// });

// george.save(function(err, cat){
//     if(err){
//         console.log("Something went wrong!")
//     }
//     else {
//         console.log(cat);
//     }
// });

// retrive all cats from db

Cat.find({}, function(err, cats){
    if(err){
        console.log(err);
    }
    else {
        console.log(cats);
    }
});

// .create() - new and .save() at one method

// Cat.create({
//     name: "Tede",
//     age: 42,
//     temperament: "Raper"
// })