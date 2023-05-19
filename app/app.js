const socket = io('ws://localhost:8080/chat', { forceNew: true, reconnectionAttempts: 10 });

const idInput = document.getElementById('idInput');
const usernameInput = document.getElementById('nameInput');
const messageInput = document.getElementById('msgInput');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const sendMsgBtn = document.getElementById('sendMsgBtn');
const messagesDiv = document.getElementById('messages');

let messages = [];
let rooms = [];

socket.on('connect', () => {
    console.log(socket.id);
});

socket.on('unauthorized', (error) => {
    if (error.data.type == 'UnauthorizedError' || error.data.code == 'invalid_token') {
        // redirect user to login page perhaps?
        console.log('User token has expired');
    }
});

socket.on('on-notification', (res) => {
    messages.push(res);
    drawMessages();
});

socket.on('message', (res) => {
    messages.push(res);
    drawMessages();
});

messageInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMsgBtn.click();
    }
});

joinBtn.onclick = () => {
    socket.emit('join', { id: idInput.value, user: usernameInput.value }, ({ status, value }) => {
        alert(value);

        if (status === 'error') return;

        rooms.push(idInput.value);
        joinBtn.style.display = 'none';
        usernameInput.setAttribute('disabled', 'disabled');
        idInput.setAttribute('disabled', 'disabled');
        leaveBtn.style.display = 'block';
    });
};

leaveBtn.onclick = () => {
    socket.emit('leave', { id: idInput.value, user: usernameInput.value }, ({ status, value }) => {
        alert(value);
        if (status === 'error') {
            return;
        }
        messages.push(value)
        joinBtn.style.display = 'block';
        usernameInput.removeAttribute('disabled');
        idInput.removeAttribute('disabled');
        leaveBtn.style.display = 'none';
    });
};

sendMsgBtn.onclick = () => {
    const currentdate = new Date();
    const hours = currentdate.getHours();
    const minutes = currentdate.getMinutes();
    socket.emit(
        'message',
        {
            id: idInput.value,
            message: messageInput.value,
            user: usernameInput.value,
            time: hours + ':' + (minutes > 9 ? minutes : '0' + minutes),
        },
        (res) => {
            messages.push(res);
            messageInput.value = '';
            drawMessages();
        }
    );
};

const drawMessages = () => {
    messagesDiv.replaceChildren([]);
    messages.forEach((val) => {
        if (typeof val === 'string') {
            const para = document.createElement('div');
            para.innerHTML = `<div style="display: flex; justify-content: center; width 100%">
            <div style="border: 1px solid #cd2f78; background: #feca07; padding: 5px; border-radius: 6px; font-family: Helvetica; max-width: 400px; width: auto; text-align: center">
            <span style="font-weight: bold;">${val}</span>
            </div>
          </div>`;
            messagesDiv.appendChild(para);
        } else {
            const para = document.createElement('div');
            para.innerHTML = `
            <div style="display: flex; justify-content: ${
                val.user === usernameInput.value ? 'flex-end' : 'flex-start'
            }">
            <div style="border: 1px solid #cd2f78; background: #cd2f78; color: #fff; padding: 5px; border-radius: 6px; font-family: Helvetica; margin: 2px; text-align:${
                val.user === usernameInput.value ? 'right' : 'left'
            }">
            <span style="font-weight: bold; margin-right:15px">${
                val.user
            }</span><span style="font-size:12px; margin-left:15px">${val.time}</span>
              </br>
              <span>${val.message}</span>
            </div></div>`;
            messagesDiv.appendChild(para);
        }
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};
