import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export default (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const sfi = io.of('/sfi');

    sfi.on('connection', (socket) => {
        console.log('Connected to socket sfi');
        
        socket.on('join', ({ id, user }) => {
            if (!!!id || !!!user) {
                socket.emit('after-join', `Username or Room ID is empty!`);
                return;
            }
            console.log(`Join to room [ ${id} ] in namespace [ sfi] `);
            socket.join(id);
            socket.emit('after-join', `Welcome to room ${id}, ${user}!`);
            socket.to(id).emit('on-notification', `User [ ${user} ] joined the room!`);
        });
    });

    return sfi;
};
