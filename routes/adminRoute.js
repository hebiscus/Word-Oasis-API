const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

//login route post
router.post("/log-in", (async(req, res, next) => {
    let {name, password } = req.body;
    try {
        const admin = await Admin.findOne({name: name});
        if (!admin) {
            return res.status(401).json({message: "Bad admin name!"})
        }
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({message: "Bad admin password!"})
        }
        const token = jwt.sign(admin.toJSON(), process.env.JWT_SECRET);
        return res.status(200).json({
            message: "Auth Passed",
            token
        })
    } catch(err) {
        return next(err);
    }
    
}));

//sign-up post route
router.post("/sign-up", (async(req, res, next) => {
    const salt =  bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(req.body.password, salt);
    try {
        const newAdmin = new Admin({name: req.body.name, password: hashed});
        await newAdmin.save();
        res.json({ admin: newAdmin});
    } catch(err) {
        return next(err);
    }
}));

module.exports = router;