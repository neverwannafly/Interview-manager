const User = require('../models/user');

const parseUserIds = async function(usernames) {
    let userids = [];
    for (let i=0; i<usernames.length; i++) {
        await User.findOne({
            'username': usernames[i]
        }).then(data=>{
            if (data) {
                userids.push(data.id);
            } else {
                throw new Error(`Please check the user names you've entered!`);
            }
        })
    }
    return userids;
}

module.exports = parseUserIds;