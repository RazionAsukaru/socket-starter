import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import e from './events/chat-events';

export default (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const chatSocket = io.of('/chat');

    chatSocket.on(e.connection, (socket) => {
        socket.on(e.join, (data, callback) => {
            const { id, user } = data;
            if (!!!id || !!!user) {
                callback({
                    status: 'error',
                    value: `Username or Room ID is empty!`,
                });
                return;
            }
            console.log(`User [ ${user} ] join to room [ ${id} ] in namespace [ chat ] `);
            socket.join(id);
            socket.to(id).emit(e.on_notification, `User [ ${user} ] joined the room!`);
            callback({
                status: 'ok',
                value: `Welcome to room ${id}, ${user}!`,
            });
        });

        socket.on(e.leave, (data, callback) => {
            const { id, user } = data;
            if (!!!id) {
                callback({
                    status: 'error',
                    value: `You are not part of Room [ ${id} ] !`,
                });
                return;
            }
            socket.leave(id);
            socket.to(id).emit(e.on_notification, `User [ ${user} ] leaved the room!`);
            callback({
                status: 'ok',
                value: `You leaved room [ ${id} ]`,
            });
        });

        socket.on(e.message, (data, callback) => {
            socket.to(data.id).emit(e.message, data);
            callback(data);
        });
    });

    return chatSocket;
};
