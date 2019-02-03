var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    city: String,
    name: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Place", placeSchema);