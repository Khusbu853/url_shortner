const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    // The code after the domain, e.g. "abc123" in http://localhost:5000/abc123.
    // Holds either a random code or the user's custom alias.
    shortCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },
    // true when the user picked the alias, false for a random code
    isCustom: {
        type: Boolean,
        default: false
    },
    clicks: {
        type: Number,
        default: 0
    },
    expirationDate: {
        type: Date,
        default: null
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Url', urlSchema);
