const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserInterviewScheme = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    interviewid: {
        type: Schema.Types.ObjectId,
        ref: 'interview',
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    }
});

module.exports = Post = mongoose.model('user_interview', UserInterviewScheme);