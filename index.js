import 'dotenv/config';
import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import session from "express-session";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const sessionMiddleware = session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
        sameSite: 'strict', // Add SameSite attribute
    } 
});

// Middlewares
app.set('view engine', 'ejs');
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/incr', (req, res) => {
    const session = req.session;
    session.count = (session.count || 0) + 1;
    res.status(200).end("" + session.count);

    io.to(session.id).emit("current count", session.count);
});

io.on("connection", (socket) => {
    const session = socket.request.session;
    const sessionId = socket.request.session.id;
    console.log(sessionId);
    socket.join(sessionId);
    console.log("a user is connected:",socket.id);
});

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});