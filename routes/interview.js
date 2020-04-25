const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const Interview = require('../models/interview');
const UserInterview = require('../models/user-interview');
const User = require('../models/user');

const checkConflicts = require('../util/checkConflicts');
const parseUserIds = require('../util/parseUserIds');
const router = express.Router();

router.use(express.urlencoded({extended:false}));
router.use(express.json());

// @route   GET api/interview/all
// @desc    Retrieves all interviews
// @access  Public
router.get('/all', async (req, res)=>{
    Interview.find({}).then(async data=>{
        let  resp = [];
        for (let i=0; i<data.length; i++) {
            resp.push([
                `<span class='interviews' id='${data[i].id}'>${data[i].title}</span>`,
                String(new Date(data[i].start.getTime())).substring(4,24),
                String(new Date(data[i].end.getTime())).substring(4,24),
                await UserInterview.find({interviewid: data[i].id}).then(async data=>{
                    let resp = [];
                    for (let i=0; i<data.length; i++) {
                        resp.push(await User.findById(data[i].userid).then(data=>data.username));
                    }
                    return resp;
                }),
            ]);
        }
        res.json({data:resp});
    });
});

// @route   GET api/interview/:id
// @desc    Retrieves interview :id
// @access  Public
router.get('/:id', async (req, res)=>{
    const id = req.params.id;
    Interview.findById(ObjectID(id)).then(async data=>{
        res.json({
            title: data.title,
            start: new Date(data.start.getTime()-data.diff*60000),
            end: new Date(data.end.getTime()-data.diff*60000),
        });
    });
});

// @route   DELETE api/interview/:interviewid/
// @desc    Deletes an interview
// @access  Public
router.delete('/:interviewid', async (req, res) => {
    const interviewid = req.params.interviewid;
    const response = {};
    console.log(interviewid);
    await Interview.deleteOne({_id:ObjectID(interviewid)}).then(async data=>{
        response.data = 'delete successful!';
        await UserInterview.deleteMany({interviewid:interviewid}).then(data=>{
            response.userints = data;
        })
    }).catch(_=>{
        response.error = "Something went wrong!";
    });
    res.json(response);
});

// @route   POST api/interview/schedule
// @desc    Schedules an interview if there's no conflict
// @access  Public
router.post('/schedule', async (req, res) => {
    const start = req.body.start;
    const end = req.body.end;
    const title = req.body.title;
    const response = {};
    let userids;

    try {
        userids = await parseUserIds(req.body['usernames[]']);
    } catch {
        response.error = 'haha';
        userids = [];
    }
    
    await checkConflicts(userids, start, end).then(async data => {
        if (!data) {
            // create a new interview
            const now = new Date();
            const params = {
                start: start,
                end: end,
                title: title,
                diff: now.getTimezoneOffset(),
            };
            await new Interview(params).save().then(async data => {
                for (let i=0; i<userids.length; i++) {
                    const interv_params = {
                        userid: ObjectID(userids[i]),
                        interviewid: data.id,
                    }
                    await new UserInterview(interv_params).save();
                }
                response.data = data;
            }).catch(_=>{
                response.error = 'Couldnt create interview!';
            });
        } else {
            response.error = 'Cannot create interview instance as one or many users are busy';
        };
    })
    res.json(response);
});

// @route   POST api/interview/edit
// @desc    Reschedules an interview if there's no conflict
// @access  Public
router.post('/edit', async (req, res) => {
    const title = req.body.title;
    const nstart = req.body.start;
    const nend = req.body.end;
    const interviewid = req.body.interviewid;
    const response = {};
    let userids = [];

    await UserInterview.find({
        interviewid: ObjectID(interviewid),
    }).then(async data=>{
        for (let i=0; i<data.length; i++) {
            userids.push(data[i].userid);
        }
    });

    await checkConflicts(userids, nstart, nend, interviewid).then(async data => {
        if (!data) {
            await Interview.updateOne({
                _id: interviewid
            }, {
                $set: { start: nstart, end: nend, title: title },
                $currentDate: { lastModified: true },
            }).then(data => {
                response.result = data;
            }).catch(_=>{
                response.error = 'Cannot update field values!';
            });
        } else {
            response.error = 'Cannot create interview instance as one or many users are busy';
        }
    })
    res.json(response);
});

module.exports = router;