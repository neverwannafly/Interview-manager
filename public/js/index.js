const INTERVIEW_ALERT = 'interview-alert';
const EDIT_ALERT = 'edit-alert';
const USER_ALERT = 'user-alert';
let dataTable;

$(document).ready(function(){
    const createUser = document.getElementById("create-user");
    const createInterview = document.getElementById("create-interview");
    const editInterview = document.getElementById("edit-interview");
    const deleteInterview = document.getElementById("delete-interview");

    $('body').on('click', 'tr', event=>{
        $("#editInterview").modal();
        let el = event.srcElement || event.target;
        let interviewid = $(el).parent().parent().children().find('span').attr('id');
        console.log(interviewid);
        $("#interviewid").val(interviewid);
        $.ajax({
            url: `/api/interview/${interviewid}`,
            type: 'get',
            success: function(data) {
                $("#start-edit").val(data['start']);
                $("#end-edit").val(data['end']);
                $("#title-edit").val(data['title']);
            }
        })
    });

    createUser.addEventListener('click', event => {
        const username = $("#username").val();
        clearReponse(USER_ALERT);

        const data = {
            'username': username,
        }
        $.post({
            url: '/api/user/create',
            type: 'post',
            ContentType: 'application/x-www-form-urlencoded',
            data: data,
            success: function(data) {
                if (data.error) {
                    const type = `danger`;
                    const message = `${data.error}`;
                    showReponse(type, message, USER_ALERT);
                } else {
                    const type = `success`;
                    const message = `${data.data.username} added successfully!`;
                    showReponse(type, message, USER_ALERT);
                }
                console.log(data);
            },
        });
        event.preventDefault();
    });

    createInterview.addEventListener('click', event => {
        const raw_start = $("#start").val();
        const raw_end = $("#end").val();
        const userids = $("#userids").val();
        const title = $("#title").val();
        const data = {};
        clearReponse(INTERVIEW_ALERT);

        // Try date conversion!
        try {
            const start = parseDate(raw_start);
            const end = parseDate(raw_end);
            if (end < start) {
                const type = 'danger';
                const message = 'End date must be greater than start date';
                showReponse(type, message, INTERVIEW_ALERT);
                return;
            }
            data.start = start.toISOString();
            data.end = end.toISOString();
        } catch {
            const type = 'danger';
            const message = 'Please choose a proper date!';
            showReponse(type, message, INTERVIEW_ALERT);
            return;
        }
        
        // Try parsing usernames
        const usernames = parseUsernames(userids);
        if (usernames.length < 2) {
            const type = 'warning';
            const message = 'Please choose atleast 2 people for the interview!';
            showReponse(type, message, INTERVIEW_ALERT);
            return;
        }

        data.usernames = usernames;
        data.title = title;

        $.post({
            url: '/api/interview/schedule',
            type: 'post',
            ContentType: 'application/x-www-form-urlencoded',
            data: data,
            success: function(data) {
                if (data.error) {
                    const type = `danger`;
                    const message = `${data.error}`;
                    showReponse(type, message, INTERVIEW_ALERT);
                } else {
                    const type = `success`;
                    const message = `Interview Scheduled successfully!`;
                    showReponse(type, message, INTERVIEW_ALERT);
                }
                console.log(data);
            },
        });

        location.reload();
        event.preventDefault();
    });

    editInterview.addEventListener('click', event => {
        const raw_start = $("#start-edit").val();
        const raw_end = $("#end-edit").val();
        const title = $("#title-edit").val();
        const interviewid = $("#interviewid").val();

        const data = {};
        clearReponse(EDIT_ALERT);

        // Try date conversion!
        try {
            const start = parseDate(raw_start);
            const end = parseDate(raw_end);
            if (end < start) {
                const type = 'danger';
                const message = 'End date must be greater than start date';
                showReponse(type, message, INTERVIEW_ALERT);
                return;
            }
            data.start = start.toISOString();
            data.end = end.toISOString();
        } catch {
            const type = 'danger';
            const message = 'Please choose a proper date!';
            showReponse(type, message, INTERVIEW_ALERT);
            return;
        }

        data.title = title;
        data.interviewid = interviewid;

        $.post({
            url: '/api/interview/edit',
            type: 'post',
            ContentType: 'application/x-www-form-urlencoded',
            data: data,
            success: function(data) {
                if (data.error) {
                    const type = `danger`;
                    const message = `${data.error}`;
                    showReponse(type, message, EDIT_ALERT);
                } else {
                    const type = `success`;
                    const message = `Interview Rescheduled successfully!`;
                    showReponse(type, message, EDIT_ALERT);
                }
                console.log(data);
            },
        });

        location.reload();
        event.preventDefault();
    });

    deleteInterview.addEventListener('click', event => {
        const interviewid = $("#interviewid").val();
        const url = `/api/interview/${interviewid}`;
        $.ajax({
            type: 'delete',
            url: url,
        }).done(data=>{
            console.log(data);
            location.reload();
        });
        event.preventDefault();
    });

    $('#datetimepicker1').datetimepicker({
        format: 'YYYY/MM/DD HH:mm'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'YYYY/MM/DD HH:mm'
    });
    $('#datetimepicker3').datetimepicker({
        format: 'YYYY/MM/DD HH:mm'
    });
    $('#datetimepicker4').datetimepicker({
        format: 'YYYY/MM/DD HH:mm'
    });

    dataTable = $("#interviews-data").DataTable({
        ajax: {
            url: '/api/interview/all',
            dataSrc: 'data',
        },
        column: [
            {'data': '_id'},
            {'data': 'title'},
            {'data': 'start'},
            {'data': 'end'},
        ]
    });
});

function showReponse(type, message, htmlClass) {
    const html = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
        </div>
    `;
    const alert = document.getElementById(htmlClass);
    alert.innerHTML = html;
}

function parseUsernames(usernames) {
    let ids = [];
    let id = "";
    for (let i=0; i<usernames.length; i++) {
        if (usernames[i]==' ') {
            continue;
        }
        if (usernames[i]==',') {
            ids.push(id);
            id = "";
            continue;
        }
        id += usernames[i];
    }
    ids.push(id);
    return ids;
}

function clearReponse(htmlClass) {
    const alert = document.getElementById(htmlClass);
    alert.innerHTML = '';
}

function parseDate(date) {
    const year = parseInt(date.substring(0,4));
    const month = parseInt(date.substring(5,7));
    const day = parseInt(date.substring(8,10));
    const hour = parseInt(date.substring(11,13));
    const min = parseInt(date.substring(14,16));
    const d = new Date(year, month, day, hour, min);
    return d;
}