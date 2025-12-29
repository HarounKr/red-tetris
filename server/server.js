const express = require('express');
const app = express();
const { createServer } = require("http");
const path = require('path')
const port = process.env.PORT || 8000;
const env = process.env.NODE_ENV;
const { Server } = require("socket.io");

console.log('Server starting in ' + env + ' mode');
if (env === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
} else {
    app.get('/', (req, res) => {
        res.send('Development mode: no static files served');
    });
}

app.get('/api/health', (req, res) => {
    res.send('OK');
    console.log('Health check OK');
});

app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = 8000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8001",
        methods: ["GET", "POST"]
    }
});

room = {
    name: null,
    players: []
};

users = [];
rooms = [];
io.on("connection", (socket) => {
    let user = {
        name: "guest " + Math.floor(Math.random() * 1000),
        socketId: socket.id,
        owner: false,
        TetrisMap: [],
        score: 0
    };
    users.push(user);

    socket.on("start_game", ({ gameRoom }) => {
        console.log("Le jeu a été démarré par la socket ID:", socket.id);
        let roomObj = rooms.find((r) => r.name === gameRoom);
        if (roomObj) {
            roomObj.start = true;
        }
        io.to(gameRoom).emit("game_started");
    });


    socket.on("get_player_name", ({ socketId }, callback) => {
        let user = users.find((user) => user.socketId === socketId);
        if (user) {
            callback(user);
        } else {
            callback(null);
        }
    });

    socket.on("player_disconnect", ({ socketId }) => {
        users = users.filter((user) => user.socketId !== socketId);
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));

    });
    socket.on("get_rooms", () => {
        const roomsList = rooms.map((room) => room.name);
        io.emit("rooms_list", roomsList);
    });

    socket.on("get_players", () => {
        const playersList = users.map((user) => user.name).filter((name) => name !== null);
        io.emit("players_list", playersList);
    });

    socket.on("join_room", ({ room, socketId }) => {
        socket.join(room);
        if (!rooms.find((r) => r.name === room)) {
            let roomObj = {};
            roomObj.name = room;
            roomObj.start = false;
            roomObj.players = users.filter((user) => user.socketId === socketId);
            if (roomObj.players.length === 1) {
                roomObj.players[0].owner = true;
                io.to(roomObj.players[0].socketId).emit("you_are_owner", { owner: true });
            }
            rooms.push(roomObj);
            io.emit("rooms_list", rooms.map((room) => room.name));
            const usersInRoom = Array.from(io.sockets.adapter.rooms.get(room) || []);
            const userNamesInRoom = usersInRoom.map((socketId) => {
                let user = users.find((u) => u.socketId === socketId);
                return user ? user.name : null;
            }).filter((name) => name !== null);

            io.to(room).emit("players_list_in_room", roomObj.players);
        }
        else {
            let roomObj = rooms.find((r) => r.name === room);
            let userToAdd = users.find((user) => user.socketId === socketId);
            if (roomObj && userToAdd && !roomObj.players.find((p) => p.socketId === socketId)) {
                roomObj.players.push(userToAdd);
            }
            if (roomObj.players)
                io.to(room).emit("players_list_in_room", roomObj.players);
        }

    });

    socket.on("leave_room", ({ room, socketId }) => {
        const usersInRoomBefore = Array.from(io.sockets.adapter.rooms.get(room) || []);
        const userLeaving = users.find(u => u.socketId === socketId);
        if (userLeaving) {
            userLeaving.owner = false;
        }
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            roomObj.players = roomObj.players.filter((player) => player.socketId !== socketId);
            if (roomObj.players.length > 0) {
                roomObj.players[0].owner = true;
                io.to(roomObj.players[0].socketId).emit("you_are_owner", { owner: true });
            }

            if (roomObj.players.length === 0) {
                rooms = rooms.filter((r) => r.name !== room);
                io.emit("rooms_list", rooms.map((room) => room.name));
            }
        }
        const usersStillInRoom = usersInRoomBefore.filter(sid => sid !== socketId)
        const usersInRoom = usersStillInRoom.map((socketId) => {
            let user = users.find((u) => u.socketId === socketId);
            return user
        });
        room.players = usersInRoom;
        io.to(room).emit("players_list_in_room", usersInRoom);
        socket.leave(room);
    });

    socket.on("player_return_home", ({ socketId }) => {
        let user = users.find((user) => user.socketId === socketId);
        if (user) {
            user.name = "guest " + Math.floor(Math.random() * 1000);
        }
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
        rooms.forEach((room) => {
            room.players = room.players.filter((p) => p.socketId !== socketId);
        });
        rooms = rooms.filter((room) => room.players.length > 0);
        io.emit("rooms_list", rooms.map((room) => room.name));

    });

    socket.on("disconnect", () => {
        users = users.filter((user) => user.socketId !== socket.id);
        rooms.forEach((room) => {
            socket.leave(room.name);
            room.players = room.players.filter((p) => p.socketId !== socket.id);
            io.to(room.name).emit("players_list_in_room", room.players);
        });
        rooms = rooms.filter((room) => room.players.length > 0);
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
        io.emit("rooms_list", rooms.map((room) => room.name));

    });
});

httpServer.listen(PORT, () => {
    console.log('Server app listening on port ' + PORT);
});