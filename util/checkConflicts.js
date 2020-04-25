const UserInterview = require('../models/user-interview');
const Interview = require('../models/interview');

const checkConflicts = async function(userId, startTime, endTime, exempt = null) {
    let conflicts = false;
    await UserInterview.find({
        'userid': { $in: userId }
    }).then(async function(userInterview){
        for (let i=0; i<userInterview.length; i++) {
            console.log(userInterview[i].interviewid,userInterview[i].userid, exempt);
            if (userInterview[i].interviewid == exempt) {
                continue;
            }
            await Interview.findById(userInterview[i].interviewid).then(interview=>{
                const start = new Date(startTime);
                const end = new Date(endTime);
                const intStart = new Date(interview.start);
                const intEnd = new Date(interview.end);
                console.log(intStart, intEnd);
                if ((intStart <= start && start < intEnd) || (intStart <= end && end < intEnd)) {
                    conflicts = true;
                }
            });
        }
    });
    return conflicts;
}

module.exports = checkConflicts;