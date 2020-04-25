const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();

const User = require('../models/user');

router.use(express.urlencoded({extended:false}));
router.use(express.json());

// @route   GET api/users/create
// @desc    Adds an user
// @access  Public
router.post('/create', async (req, res) => {
    const username = req.body.username;
    const params = {
        username: username,
    };
    const response = {};
    await User.find({username: username}).then(async data=>{
        if (data.length != 0) {
            response.error = "user already exists!";
        } else {
            await new User(params).save().then(data => {
                response.data = data;
                console.log("user created");
            }).catch(err => {
                response.error = err;
            });
        }
    })
    res.json(response);
});

module.exports = router;