var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Favorite = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dishes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }]
},
{
    timestamps: true
});

module.exports = mongoose.model('Favorite', Favorite);
