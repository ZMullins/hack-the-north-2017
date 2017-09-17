var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

var request = require('request');

// Used for the recipe API
const APP_ID = "f6c0736d";
const APP_KEY = "640e60b4821cfee24b35ab6743008a97";
const EDAMAM_URL = "https://api.edamam.com/search?";

router.route('/user')
    // Create new user
    .post(function(req, res) {
        var user = new User(req.body);
        user.save(function (err) {
            if (err) response.send(err);
            return res.json({User: user});
        });
    }); 

router.route('/user/:id')
    .get(function(res, req) {
        User.findById(req.params.id, function(err, user) {
            if (err) response.send(err);
            return res.json({User: user});
        })
    })
    // Update existing user
    .put(function(req, res) {
        User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
            if (err) response.send(err);
            return res.json({User: user});
        });
    }); 

router.route('/login')
    .post(function(req, res) {
        User.findOne({"email": req.body.email, "password": req.body.password}, function(err, user) {
            if (err) response.send(err);
            return res.json({User: user});
        })
    });

router.route('/meal')
    // Fetch a meal based on the user's nutrition profile
    .post(function(req, res) {
        let ingredient = req.body.ingredients;
        User.findById(req.body.userId, function(err, user) {
            if (!user) {
                user = "";
            }

            request.get(
                EDAMAM_URL + 'q=' + ingredient + '&app_id=' + APP_ID + '&app_key=' + APP_KEY 
                + '&calories=lte%20' + user.remainingCalories + '&to=1',
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        let recipe = JSON.parse(body).hits[0].recipe;
                        //Subtract remaining calories with recipe
                        user.remainingCalories -= Integer.parseInt(recipe.calories);

                        res.send(recipe);
                    }
                }
            );
        });
    });

// Update user's nutrition profile based on the user's goals and body stats
router.route('/user/:id/nutrition')
    .put(function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) response.send(err);
            // Use the Harris-Benedict equation to calculate user's BMR and caloric req
            return res.json({User: user});
        })
    })

module.exports = router;