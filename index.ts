import axios from 'axios';
import express, { Request, Response } from 'express';
import { createServer, ServerOptions } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import chat from './sockets/chat-socket';
import chatRoute from './routers/chat-route';
import dotenv from 'dotenv';
import { instrument } from '@socket.io/admin-ui';

export const app = express();
dotenv.config();
const port = process.env.PORT || 8080;

const httpServer = createServer(app);

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

/* #region Socket Server */
export const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

instrument(io, { auth: false });
/* #endregion Socket Server*/

/* #region api per app as namespace */
const chatSocket = chat(io);
app.use('/api/chat', chatRoute(chatSocket));
/* #endregion api per app as namespace */

try {
    httpServer.listen(port, () => {
        console.log(`Socket server running on port ${port}`);
    });
} catch (error) {
    console.error(`Error occured: ${error}`);
}
