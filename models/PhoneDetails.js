const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: [50, "must be less than or equal to 20"],
    },

    brand: String,
    name: String,
    image: String,
    releaseDate: String,

    mainFeatures: {
        storage: String,
        displaySize: String,
        chipSet: String,
        memory: String,
        sensors: mongoose.Schema.Types.Mixed,
    },
    others: mongoose.Schema.Types.Mixed,
});


const PhoneDetails = mongoose.model('PhoneDetail', phoneSchema);
module.exports = PhoneDetails;
