import { Router } from 'express';
import e from '../sockets/events/chat-events';

export default (socket) => {
    var router = Router();

    router.post('/update-notification', (req, res) => {
        const { id, data } = req.body;
        socket.to(id).emit(e.on_notification, data)
        res.status(201).send('ok');
    });

    return router;
};

