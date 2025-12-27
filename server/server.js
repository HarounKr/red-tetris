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

user = {
    name: null,
    socketId: null,
    owner: false
};

room = {
    name: null,
    players: []
};

users = [];
rooms = [];
io.on("connection", (socket) => {
    let user = {
        name: "guest " + Math.floor(Math.random() * 1000),
        socketId: socket.id
    };
    users.push(user);
    socket.on("disconnect", () => {
        users = users.filter((user) => user.socketId !== socket.id);
    });

    socket.on("start_game", () => {
        console.log("Le jeu a été démarré par la socket ID:", socket.id);
    });

    socket.on("set_name", ({ name, socketId }) => {
        user = users.find((user) => user.socketId === socketId);
        if (user) {
            user.name = name;
        }
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
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
            roomObj.players = users.filter((user) => user.socketId === socketId);
            rooms.push(roomObj);
            io.emit("rooms_list", rooms.map((room) => room.name));
        } else {
            let roomObj = rooms.find((r) => r.name === room);
            let userToAdd = users.find((user) => user.socketId === socketId);
            if (roomObj && userToAdd && !roomObj.players.find((p) => p.socketId === socketId)) {
                roomObj.players.push(userToAdd);
            }
        }
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(room) || []);
        const userNamesInRoom = usersInRoom.map((socketId) => {
            let user = users.find((u) => u.socketId === socketId);
            return user ? user.name : null;
        }).filter((name) => name !== null);
        io.to(room).emit("players_list_in_room", userNamesInRoom);
    });

    socket.on("leave_room", ({ room, socketId }) => {
        console.log(`🔴 User ${socketId} leaving room: ${room}`);

        // ✅ IMPORTANT: Émettre AVANT de quitter la room
        const usersInRoomBefore = Array.from(io.sockets.adapter.rooms.get(room) || []);
        console.log("👥 Users in room BEFORE leave:", usersInRoomBefore);

        // Retirer le joueur de la liste des rooms
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            roomObj.players = roomObj.players.filter((player) => player.socketId !== socketId);
            console.log("📋 Room after leave:", JSON.stringify(roomObj, null, 2));

            // Si la room est vide, la supprimer
            if (roomObj.players.length === 0) {
                rooms = rooms.filter((r) => r.name !== room);
                console.log("🗑️ Room deleted (empty):", room);
                io.emit("rooms_list", rooms.map((room) => room.name));
            }
        }

        // ✅ Calculer la nouvelle liste SANS le joueur qui part
        const usersStillInRoom = usersInRoomBefore.filter(sid => sid !== socketId);
        const userNamesStillInRoom = usersStillInRoom.map((sid) => {
            const user = users.find(u => u.socketId === sid);
            return user ? user.name : null;
        }).filter((name) => name !== null);

        console.log("👥 Users STILL in room:", userNamesStillInRoom);

        // ✅ Émettre la mise à jour AVANT de leave
        io.to(room).emit("players_list_in_room", userNamesStillInRoom);
        console.log(`📤 Emitted players_list to room ${room}:`, userNamesStillInRoom);

        // ✅ Quitter la room APRÈS avoir émis
        socket.leave(room);

        console.log(`✅ User ${socketId} left room: ${room}`);
    });

    socket.on("disconnect", () => {
        users = users.filter((user) => user.socketId !== socket.id);
        rooms.forEach((room) => {
            socket.leave(room.name);
            room.players = room.players.filter((p) => p.socketId !== socket.id);
        });
        rooms = rooms.filter((room) => room.players.length > 0);
        io.emit("players_list_in_room", users.map((user) => user.name).filter((name) => name !== null));
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
        io.emit("rooms_list", rooms.map((room) => room.name));

    });
});

httpServer.listen(PORT, () => {
    console.log('Server app listening on port ' + PORT);
});