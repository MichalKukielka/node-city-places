var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    city: String,
    name: String,
    image: String,
    description: String
});

module.exports = mongoose.model("Place", placeSchema);