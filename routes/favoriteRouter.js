const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({"user":req.user._id})
  .populate('user')
  .populate('dishes')
  .then((fav) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(fav);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  Favorites.findOne({"user":req.user._id})
  .then((fav) => {
    if (fav != null) {              // If favorites are already added
        var index;
        for (index = 0; index < req.body.length; ++index) {
          if(fav.dishes.indexOf(req.body[index]._id)===-1){
            fav.dishes.push(req.body[index]._id);
          }
        }
        fav.save()
        .then((fav) => {
            console.log('Favorites Added', fav);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        var index;
        var arrDishes = [];
        for (index = 0; index < req.body.length; ++index) {
          if(arrDishes.indexOf(req.body[index]._id)===-1){
            arrDishes.push(req.body[index]._id);
          }
        }
        Favorites.create({
            "user":req.user._id,
            "dishes":arrDishes
        })
        .then((fav)=>{
            console.log('Favorites Created', fav);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  Favorites.findOne({"user":req.user._id})
  .then((fav) => {
    if (fav != null) {              // If favorites are already added
        fav.remove();
        fav.save()
          .then((fav) => {
              console.log('Favorites Added', fav);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(fav);
          }, (err) => next(err))
          .catch((err) => next(err));
    }
    else{
        console.log('No Favorites added to delete:', fav);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({"user":req.user._id})
    .then((fav) => {
      if (fav != null) {              // If favorites are already added

          if(fav.dishes.indexOf(req.params.dishId) > -1){ // If that dish is already  Added before
            console.log('This dish is already added', fav);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
          }
          else{
            fav.dishes.push(req.params.dishId);
            fav.save()
            .then((fav) => {
                console.log('Favorite Added', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err));
          }
      }
      else {
          var arrDishes = [];
          arrDishes.push(req.params.dishId);
          Favorites.create({
              "user":req.user._id,
              "dishes":arrDishes
          })
          .then((fav)=>{
              console.log('Favorite Created', fav);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(fav);
          }, (err) => next(err))
          .catch((err) => next(err));
      }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  Favorites.findOne({"user":req.user._id})
  .then((fav) => {
      if (fav != null) {

        if(fav.dishes.indexOf(req.params.dishId) > -1){
          fav.dishes.splice(fav.dishes.indexOf(req.params.dishId),1);
        }
          fav.save()
          .then((fav) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(fav);
          }, (err) => next(err));
      }
      else {
          err = new Error('No favourite dishes added for this user to delete dish!');
          err.status = 404;
          return next(err);
      }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = favoriteRouter;
