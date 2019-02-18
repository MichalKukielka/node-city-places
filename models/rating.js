var mongoose = require("mongoose");

var ratingSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place"
    }
});

module.exports = mongoose.model("Rating", ratingSchema);