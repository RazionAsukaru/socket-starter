import axios from 'axios';
import express, { Request, Response } from 'express';
import { createServer, ServerOptions } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import sfi from './sockets/sfi-socket';
import sfiRoute from './routers/sfi-route';
import dotenv from 'dotenv';
import { instrument } from '@socket.io/admin-ui';

export const app = express();
dotenv.config();
const port = process.env.PORT || 8080;

// const options: ServerOptions = {
//     key: fs.readFileSync('/etc/star/STAR.sf-international.id_key.pem'),
//     cert: fs.readFileSync('/etc/star/STAR.sf-international.id.crt')
// }

const httpServer = createServer(/* options ,*/ app);

// Body parsing Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('app'));
app.use(cors());

/* #region Serving Static Webapp */
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/app/index.html'));
});
/* #endregion Serving Static Webapp */

/* #region Dummy api for calling to api of namespace */
app.post('/message', async (req, res) => {
    const { id, message, user, time } = req.body;
    if (!!!id || !!!message || !!!user)
        return res.status(400).send('Please input Room Id, User Name, and Message ');
    const msg = {
        data: { id, message, user, time },
    };
    const data = Object.assign({}, msg, req.body);
    axios.post('http://localhost:8080/api/sfi/update-notification', data).then((d) => {});
    return res.status(201).send({ msg });
});
/* #endregion Dummy api for calling to api of namespace */

/* #region Socket Server */
export const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

instrument(io, { auth: false });
/* #endregion Socket Server*/

/* #region api per app as namespace */
const socketSfi = sfi(io);
app.use('/api/sfi', sfiRoute(socketSfi));
/* #endregion api per app as namespace */

try {
    httpServer.listen(port, () => {
        console.log(`Socket server running on port ${port}`);
    });
} catch (error) {
    console.error(`Error occured: ${error}`);
}
