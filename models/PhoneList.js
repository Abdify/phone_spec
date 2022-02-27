const mongoose = require('mongoose');
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

const phoneListSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: [50, "must be less than or equal to 20"],
    },

    brand: String,
    phone_name: String,
    image: String,
    detail: String 
    
});


phoneListSchema.plugin(mongoose_fuzzy_searching, { fields: ["phone_name"] });
const PhoneList = mongoose.model('PhoneList', phoneListSchema);
module.exports = PhoneList;
