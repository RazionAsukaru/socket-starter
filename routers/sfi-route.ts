import { Router } from 'express';
import e from '../sockets/events/sfi-events';

export default (socket) => {
    var router = Router();
    //   router.get('/', function (req, res) {
    //       sfi.to('c2ZpLWNmLWNsaWVudC0wMDAzMTg=').emit(e.UPDATE_TOP_NOTIFICATION, 'some notification' );
    //     res.send('Nothing Here!');
    //   });

    router.post('/update-notification', (req, res) => {
        const { id, notificationMessage } = req.body;
        socket.to(id).emit(e.ON_NOTIFICATION, { notification:notificationMessage })
        res.status(201).send('ok');
    });

    return router;
};

