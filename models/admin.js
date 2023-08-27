const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    name: {type: String, minlength: 3, maxlength: 10, required: true},
    password: {type: String, minlength: 7, required: true}, 
});

module.exports = mongoose.model("Admin", adminSchema);