const express = require('express');
const app = express();
const { createServer } = require("http");
const path = require('path')
const port = process.env.PORT || 8000;
const env = process.env.NODE_ENV;
const { Server } = require("socket.io");

if (env === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
} else {
    app.get('/', (req, res) => {
        res.send('Development mode: no static files served');
    });
}

app.get('/api/health', (req, res) => {
    res.send('OK');
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

const sessionStore = new Map();

io.on("connection", (socket) => {
    const sessionId = socket.handshake.auth.sessionId;
    let user;
    if (sessionId && sessionStore.has(sessionId)) {
        const savedSession = sessionStore.get(sessionId);
        user = {
            ...savedSession,
            socketId: socket.id 
        };

        const existingIndex = users.findIndex(u => u.sessionId === sessionId);
        if (existingIndex !== -1) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }

    } else {
        user = {
            name: "guest " + Math.floor(Math.random() * 1000),
            socketId: socket.id,
            sessionId: sessionId,
            owner: false,
            TetrisMap: [],
            score: 0
        };
        users.push(user);

        if (sessionId) {
            sessionStore.set(sessionId, { ...user });
        }
    }

    socket.on("start_game", ({ gameRoom }) => {
        let roomObj = rooms.find((r) => r.name === gameRoom);
        if (roomObj) {
            roomObj.start = true;
            io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
        }
        io.to(gameRoom).emit("game_started");
    });

    socket.on("restart_game", ({ room }) => {
        let roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            roomObj.start = false;
            roomObj.gameEnded = false;
            roomObj.players.forEach(p => {
                if (p) {
                    p.finalScore = 0;
                    p.finalRows = 0;
                    p.finalLevel = 0;
                    p.isLoser = false;
                    p.gameOver = false;
                }
            });
            io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
            const owner = roomObj.players.find(p => p && p.owner);
            if (owner) {
                io.to(owner.socketId).emit("you_are_owner", { owner: true });
            }
            roomObj.players.filter(p => p && !p.owner).forEach(p => {
                io.to(p.socketId).emit("you_are_owner", { owner: false });
            });

            io.to(room).emit("restart_game", { room });
        }
    });


    socket.on("get_player_name", ({ socketId }, callback) => {
        const sessionId = socket.handshake.auth.sessionId;

        let user = users.find((user) => user.socketId === socketId);

        if (!user && sessionId && sessionStore.has(sessionId)) {
            const savedSession = sessionStore.get(sessionId);
            user = {
                ...savedSession,
                socketId: socketId
            };
            users.push(user);
        }
        callback(user || null);
    });

    socket.on("set_player_name", ({ socketId, name }, callback) => {
        let user = users.find((u) => u.socketId === socketId);
        if (user) {
            user.name = name;
            const sessionId = socket.handshake.auth.sessionId;
            if (sessionId && sessionStore.has(sessionId)) {
                const savedSession = sessionStore.get(sessionId);
                savedSession.name = name;
                sessionStore.set(sessionId, savedSession);
            }
        }
        if (callback) callback({ success: true });
    });

    socket.on("player_disconnect", ({ socketId }) => {
        users = users.filter((user) => user.socketId !== socketId);
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));

    });

    socket.on("join_game_room", ({ room, socketId }) => {
        socket.join(room);

        let roomObj = rooms.find((r) => r.name === room);
        if (!roomObj) {
            roomObj = {
                name: room,
                start: true,
                players: [],
                gameEnded: false
            };
            rooms.push(roomObj);
        }

        const user = users.find((u) => u.socketId === socketId);
        if (user && !roomObj.players.find((p) => p.socketId === socketId)) {
            roomObj.players.push(user);
        }

        if (user) {
            io.to(socketId).emit("you_are_owner", { owner: user.owner || false });
        }
        const roomSockets = io.sockets.adapter.rooms.get(room);
    });

    // ✅ Vérifier si on peut rejoindre une room (protection URL)
    socket.on("check_room_access", ({ room, playerName, socketId }, callback) => {
        const roomObj = rooms.find((r) => r.name === room);

        let user = users.find((u) => u.socketId === socketId);
        if (user) {
            user.name = playerName;
            const sessionId = socket.handshake.auth.sessionId;
            if (sessionId && sessionStore.has(sessionId)) {
                const savedSession = sessionStore.get(sessionId);
                savedSession.name = playerName;
                sessionStore.set(sessionId, savedSession);
            }
        }

        if (!roomObj) {
            if (user) {
                user.owner = true;
            }
            callback({ redirectTo: `/${room}` });
            return;
        }

        if (roomObj.start) {
            const isPlayerInRoom = roomObj.players.some(p => p.socketId === socketId);

            if (isPlayerInRoom) {
                callback({ canPlay: true });
                return;
            } else {
                callback({ redirectTo: "/" });
                return;
            }
        }

        callback({ redirectTo: `/${room}` });
    });

    socket.on("leave_game_room", ({ room, socketId }) => {
        socket.leave(room);
    });

    socket.on("get_rooms", () => {
        const roomsList = rooms.filter((room) => !room.start).map((room) => room.name);
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

            const user = users.find((u) => u.socketId === socketId);
            if (user) {
                user.owner = true;
                roomObj.players = [user];
            } else {
                roomObj.players = [];
            }
            rooms.push(roomObj);
            io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));

            io.to(room).emit("players_list_in_room", roomObj.players);

            if (user && user.owner) {
                io.to(user.socketId).emit("you_are_owner", { owner: true });
            }
        }
        else {
            let roomObj = rooms.find((r) => r.name === room);
            let userToAdd = users.find((user) => user.socketId === socketId);
            if (roomObj && userToAdd && !roomObj.players.find((p) => p.socketId === socketId)) {
                userToAdd.owner = false;
                roomObj.players.push(userToAdd);
            }
            if (roomObj.players) {
                io.to(room).emit("players_list_in_room", roomObj.players);
                const owner = roomObj.players.find(p => p && p.owner);
                if (owner) {
                    io.to(owner.socketId).emit("you_are_owner", { owner: true });
                }
                roomObj.players.filter(p => p && !p.owner).forEach(p => {
                    io.to(p.socketId).emit("you_are_owner", { owner: false });
                });
            }
        }
    });

    socket.on("rows_cleared", ({ rows, socketId, room }) => {
        let user = users.find((u) => u.socketId === socketId);
        if (user) {
            user.rowsCleared = (user.rowsCleared || 0) + rows;
        }
        socket.to(room).emit("add_penalty_rows", {
            fromPlayer: socketId,
            penaltyRows: rows
        });

        io.to(room).emit("opponent_rows_cleared", { socketId, rows });
    });

    socket.on("update_player_state", ({ room, socketId, playerData }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const player = roomObj.players.find(p => p && p.socketId === socketId);
            if (player) {
                player.gameState = playerData;
            }

            const otherPlayersData = roomObj.players
                .filter(p => p && p.socketId !== socketId && p.name)
                .map(p => ({
                    socketId: p.socketId,
                    name: p.name,
                    pos: p.gameState?.pos || { x: 4, y: 0 },
                    score: p.gameState?.score || 0,
                    tetromino: p.gameState?.tetromino || [],
                    collided: p.gameState?.collided || false,
                    stage: p.gameState?.stage || []
                }));

            socket.emit("other_players_update", { players: otherPlayersData });

            if (player && player.name) {
                socket.to(room).emit("player_state_update", {
                    socketId,
                    name: player.name,
                    pos: playerData.pos,
                    score: playerData.score,
                    tetromino: playerData.tetromino,
                    collided: playerData.collided,
                    stage: playerData.stage
                });
            }
        }
    });

    socket.on("get_other_players", ({ room, socketId }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const otherPlayersData = roomObj.players
                .filter(p => p && p.socketId !== socketId && p.name)
                .map(p => ({
                    socketId: p.socketId,
                    name: p.name,
                    pos: p.gameState?.pos || { x: 4, y: 0 },
                    score: p.gameState?.score || 0,
                    tetromino: p.gameState?.tetromino || [],
                    collided: p.gameState?.collided || false,
                    stage: p.gameState?.stage || []
                }));

            socket.emit("other_players_update", { players: otherPlayersData });
        }
    });


    socket.on("winner_score", ({ socketId, room, score, rows: playerRows, level }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const winner = roomObj.players.find(p => p.socketId === socketId);
            if (winner) {
                winner.finalScore = score;
                winner.finalRows = playerRows;
                winner.finalLevel = level;
                winner.isLoser = false;
            }

            const scores = roomObj.players.map((p) => ({
                socketId: p.socketId,
                name: p.name,
                score: p.finalScore || 0,
                rows: p.finalRows || 0,
                level: p.finalLevel || 0,
                isLoser: p.isLoser || false
            }));

            io.to(room).emit("final_scores", { scores });
        }
    });

    socket.on("game_over", ({ socketId, room, score, rows: playerRows, level }) => {
        const roomSockets = io.sockets.adapter.rooms.get(room);
        const roomObj = rooms.find((r) => r.name === room);
        if (!roomObj) {
            return;
        }

        if (roomObj.gameEnded) {
            return;
        }

        roomObj.gameEnded = true;

        const loser = roomObj.players.find(p => p.socketId === socketId);
        if (loser) {
            loser.finalScore = score;
            loser.finalRows = playerRows;
            loser.finalLevel = level;
            loser.isLoser = true;
        }

        const scores = roomObj.players.map((p) => ({
            socketId: p.socketId,
            name: p.name,
            score: p.finalScore || 0,
            rows: p.finalRows || 0,
            level: p.finalLevel || 0,
            isLoser: p.socketId === socketId
        }));
        io.to(room).emit("final_scores", { scores });
        socket.to(room).emit("opponent_game_over", { socketId });
        setTimeout(() => {
            if (roomObj) {
                roomObj.gameEnded = false;
                roomObj.players.forEach(p => {
                    p.finalScore = 0;
                    p.finalRows = 0;
                    p.finalLevel = 0;
                    p.isLoser = false;
                });
            }
        }, 5000);
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
                io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
            }
        }
        const usersStillInRoom = usersInRoomBefore.filter(sid => sid !== socketId)
        const usersInRoom = usersStillInRoom.map((socketId) => {
            let user = users.find((u) => u.socketId === socketId);
            return user
        });
        if (roomObj) {
            roomObj.players = usersInRoom;
        }
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
        io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));

    });

    socket.on("disconnect", () => {
        const sessionId = socket.handshake.auth.sessionId;
        const user = users.find((u) => u.socketId === socket.id);

        if (user && sessionId) {
            sessionStore.set(sessionId, { ...user });
        }

        users = users.filter((user) => user.socketId !== socket.id);
        rooms.forEach((room) => {
            socket.leave(room.name);
            room.players = room.players.filter((p) => p.socketId !== socket.id);
            io.to(room.name).emit("players_list_in_room", room.players);
        });
        rooms = rooms.filter((room) => room.players.length > 0);
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
        io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
    });
});

httpServer.listen(PORT, () => {
    console.log('Server app listening on port ' + PORT);
});