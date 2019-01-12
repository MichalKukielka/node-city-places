var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    city: String,
    name: String,
    image: String,
    description: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

module.exports = mongoose.model("Place", placeSchema);