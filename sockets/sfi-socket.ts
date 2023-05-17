import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export default (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const sfiSocket = io.of('/sfi');

    sfiSocket.on('connection', (socket) => {
        console.log('Connected to socket sfi');

        socket.on('join', (data, callback) => {
            const { id, user } = data;
            if (!!!id || !!!user) {
                sfiSocket.emit('after-join', `Username or Room ID is empty!`);
                return;
            }
            console.log(`Join to room [ ${id} ] in namespace [ sfi ] `);
            socket.join(id);
            socket.emit('after-join', `Welcome to room ${id}, ${user}!`);
            socket.to(id).emit('on-notification', `User [ ${user} ] joined the room!`);
            callback();
        });

        socket.on('leave', (data, callback) => {
            const { id, user } = data;
            console.log(data);
            
            if (!!!id) {
                sfiSocket.emit('after-join', `You are not part of Room [ ${id} ] !`);
                return;
            }
            socket.leave(id);
            socket.emit('after-join', `Welcome to room ${id}, ${user}!`);
            socket.to(id).emit('on-notification', `User [ ${user} ] leaved the room!`);
            callback();
        });

        socket.on('message', (data, callback) => {
            socket.to(data.id).emit('message', data);
            callback(data);
        });
    });

    return sfiSocket;
};
