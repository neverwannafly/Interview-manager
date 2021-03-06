const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const InterviewSchema = new Schema({
    title: {
        type: String,
    },
    start : {
        type: Date,
    },
    end : {
        type: Date,
    },
    diff: {
        type: Date,
    }
});

module.exports = Post = mongoose.model('interview', InterviewSchema);