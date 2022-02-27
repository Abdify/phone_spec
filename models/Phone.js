const mongoose = require('mongoose');
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

const phoneSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: [50, "must be less than or equal to 20"],
    },

    brand: String,
    phone_name: String,
    thumbnail: String,
    phone_images: [{ type: String }],
    release_date: String,
    dimension: String,
    os: String,
    storage: String,
    specifications: [{
      title: String,
      specs: [{
        key: String,
        val: Array,
      }]
    }]
});


const Phone = mongoose.model('Phone', phoneSchema);
module.exports = Phone;
