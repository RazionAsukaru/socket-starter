const socket = io('ws://localhost:8080/sfi', { forceNew: true, reconnectionAttempts: 10 });

// var id = window.btoa(Math.random(100));

const idInput = document.getElementById('idInput');
const usernameInput = document.getElementById('nameInput');
const messageInput = document.getElementById('msgInput');
const joinBtn = document.getElementById('joinBtn');
const sendMsgBtn = document.getElementById('sendMsgBtn');
var notification = [];

socket.on('connect', () => {
    const engine = socket.io.engine;

    engine.on('close', (reason) => {
        // called when the underlying connection is closed
    });
});

socket.on('after-join', (res) => {
    alert(res);
});

socket.on('unauthorized', (error) => {
    if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
        // redirect user to login page perhaps?
        console.log('User token has expired');
    }
});

socket.on('on-notification', (res) => {
    console.log(typeof res);
    notification.push(`<p>${typeof res === 'string' ? res : res.notification}</p>`);
    console.log(notification.toString().replace(/,/g, ''));
    document.getElementById('notification').innerHTML = JSON.stringify(notification.toString().replace(/,/g, ''));
});

messageInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMsgBtn.click();
    }
});

joinBtn.onclick = () => {
    socket.emit('join', { id: idInput.value, user: usernameInput.value });
};

sendMsgBtn.onclick = () => {
    httpPost('http://localhost:8080/message', {
        id: idInput.value,
        message: messageInput.value,
        user: usernameInput.value,
    }).then((res) => {
        res.clone().json();
        messageInput.value = '';
    });
};

const httpPost = (path, data) => {
    return fetch(path, getOptions('POST', data));
};

const getOptions = (verb, data) => {
    var options = {
        dataType: 'json',
        method: verb,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    return options;
};
