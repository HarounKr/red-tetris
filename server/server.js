require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors(
    {
        origin: "*",
        methods: ["GET", "POST"]
    }
));
const { createServer } = require("http");
const path = require('path')
const port = process.env.PORT || 8000;
const env = process.env.NODE_ENV;
const { Server } = require("socket.io");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

if (env === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
} else {
    app.get('/', (req, res) => {
        res.send('Development mode: no static files served');
    });
}

app.get("/scoreboard", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);

        if (error) {
            res.status(500).json({ error: 'Error fetching scores' });
        } else {
            res.json(data);
        }
    } catch (err) {
        res.status(500).json({ error: 'Unexpected error' });
    }
});
app.get('/api/health', (req, res) => {
    res.send('OK');
});

app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});



function generaterandomNamewithonlyletters() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let name = '';
    for (let i = 0; i < 5; i++) {
        name += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return name;
}
let users = [];

let rooms = [];
io.on("connection", (socket) => {
    let user = {
        name: generaterandomNamewithonlyletters(),
        socketId: socket.id,
        owner: false,
        TetrisMap: [],
        score: 0
    };
    users.push(user);
    socket.on("start_game", ({ gameRoom }) => {
        let roomObj = rooms.find((r) => r.name === gameRoom);
        if (roomObj) {
            roomObj.start = true;

            const tetrominos = 'IJLOSTZ';
            const sequence = [];
            for (let i = 0; i < 1000; i++) {
                sequence.push(tetrominos[Math.floor(Math.random() * tetrominos.length)]);
            }
            roomObj.tetrominoSequence = sequence;
        }
        io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
        io.to(gameRoom).emit("game_started", { tetrominoSequence: roomObj?.tetrominoSequence || [] });
    });

    socket.on("get_player_name", ({ socketId }, callback) => {
        callback(users.find((u) => u.socketId === socketId) ?? null);
    }); 

    socket.on("set_player_name", ({ socketId, name }, callback) => {
        let user = users.find((u) => u.socketId === socketId);

        if (user) {
            user.name = name;
        } else {
            users.push({
                socketId,
                name,
                owner: false,
                score: 0
            });
        }

        if (callback) callback({ success: true });
    }); 

    socket.on("player_disconnect", ({ socketId }) => {
        users = users.filter((user) => user.socketId !== socketId);
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));

    }); 

    socket.on("get_rooms", () => {
        const roomsList = rooms.filter((room) => !room.start).map((room) => room.name);
        io.emit("rooms_list", roomsList);
    }); 

    socket.on("check_room_status", ({ room }, callback) => {
        const roomObj = rooms.find((r) => r.name === room);
        callback({
            exists: !!roomObj,
            inGame: roomObj ? roomObj.start : false
        });
    });

    socket.on("get_players", () => {
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
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

    socket.on("change_game_mode", ({ room, gameMode }) => {
        io.to(room).emit("game_mode_update", { gameMode });
    }); 

    socket.on("leave_room", ({ room, socketId }) => {
        const roomObj = rooms.find(r => r.name === room);
        if (!roomObj) return;

        roomObj.players = roomObj.players.filter(
            p => p.socketId !== socketId
        );

        socket.leave(room);

        roomObj.players.forEach(p => p.owner = false);
        if (roomObj.players.length > 0) {
            roomObj.players[0].owner = true;
            io.to(roomObj.players[0].socketId)
                .emit("you_are_owner", { owner: true });
        }

        if (roomObj.players.length === 0 && !roomObj.start) {
            rooms = rooms.filter(r => r.name !== room);
        }

        io.to(room).emit("players_list_in_room", roomObj.players);

        io.emit(
            "rooms_list",
            rooms.filter(r => !r.start).map(r => r.name)
        );
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
        const disconnectedSocketId = socket.id;
        users = users.filter((user) => user.socketId !== disconnectedSocketId);

        rooms.forEach((room) => {
            socket.leave(room.name);
            const wasInRoom = room.players.some(p => p.socketId === disconnectedSocketId);
            room.players = room.players.filter((p) => p.socketId !== disconnectedSocketId);
            io.to(room.name).emit("players_list_in_room", room.players);

            if (wasInRoom && room.players.length > 0) {
                const otherPlayersData = room.players.map(p => ({
                    name: p.name,
                    socketId: p.socketId,
                    score: p.score || 0,
                    stage: p.stage || []
                }));
                io.to(room.name).emit("other_players_update", { players: otherPlayersData });
            }
        });
        rooms = rooms.filter((room) => room.players.length > 0);
        io.emit("players_list", users.map((user) => user.name).filter((name) => name !== null));
        io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
    });

    socket.on("join_game_room", ({ room, socketId }) => {
        socket.join(room);
        let roomObj = rooms.find((r) => r.name === room);
        if (!roomObj) {
            const user = users.find((u) => u.socketId === socketId);
            roomObj = {
                name: room,
                start: true,
                players: user ? [user] : [],
                tetrominoSequence: []
            };
            if (user) {
                user.owner = true;
            }
            rooms.push(roomObj);
        } else {
            const user = users.find((u) => u.socketId === socketId);
            if (user && !roomObj.players.find((p) => p.socketId === socketId)) {
                roomObj.players.push(user);
            }
            if (user) {
                io.to(socketId).emit("you_are_owner", { owner: user.owner || false });
            }
        }

        if (roomObj.tetrominoSequence) {
            io.to(socketId).emit("tetromino_sequence", { sequence: roomObj.tetrominoSequence });
        }
    });

    socket.on("leave_game_room", ({ room, socketId }) => {
        socket.leave(room);
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            roomObj.players = roomObj.players.filter((p) => p.socketId !== socketId);
            if (roomObj.players.length === 0 && roomObj.start) {
                rooms = rooms.filter((r) => r.name !== room);
                io.emit("rooms_list", rooms.filter((r) => !r.start).map((r) => r.name));
            } else if (roomObj.players.length > 0) {
                const otherPlayersData = roomObj.players.map(p => ({
                    name: p.name,
                    socketId: p.socketId,
                    score: p.score || 0,
                    stage: p.stage || []
                }));
                io.to(roomObj.name).emit("other_players_update", { players: otherPlayersData });
            }
        }
    }); 

    socket.on("get_other_players", ({ room, socketId }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const otherPlayers = roomObj.players
                .filter(p => p.socketId !== socketId)
                .map(p => ({
                    name: p.name,
                    socketId: p.socketId,
                    score: p.score || 0,
                    stage: p.stage || []
                }));
            io.to(socketId).emit("other_players_update", { players: otherPlayers });
        }
    });

    socket.on("update_player_state", ({ room, socketId, playerData }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const player = roomObj.players.find(p => p.socketId === socketId);
            if (player) {
                player.stage = playerData.stage;
                player.score = playerData.score;
            }
            socket.to(room).emit("player_state_update", {
                socketId,
                name: player?.name,
                score: playerData.score,
                stage: playerData.stage
            });
        }
    });

    socket.on("game_over", ({ socketId, room, score, rows, level }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const player = roomObj.players.find(p => p.socketId === socketId);
            if (player) {
                player.finalScore = score;
                player.finalRows = rows;
                player.finalLevel = level;
                player.gameOver = true;
            }

            socket.to(room).emit("opponent_game_over");

            const allGameOver = roomObj.players.every(p => p.gameOver);

            if (allGameOver || roomObj.players.length === 1) {
                const scores = roomObj.players.map(p => ({
                    socketId: p.socketId,
                    name: p.name,
                    score: p.finalScore || 0,
                    rows: p.finalRows || 0,
                    level: p.finalLevel || 0
                }));
                for (const p of roomObj.players) {
                    insertScore(p.name, p.finalScore || 0);
                }
                const owner = roomObj.players.find(p => p.owner === true);
                const ownerSocketId = owner ? owner.socketId : (roomObj.players[0] ? roomObj.players[0].socketId : null);
                io.to(room).emit("final_scores", { scores, ownerSocketId });

                io.to(socketId).emit("final_scores", { scores, ownerSocketId });
            }
        }
    });

    socket.on("winner_score", ({ socketId, room, score, rows, level }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            const player = roomObj.players.find(p => p.socketId === socketId);
            if (player) {
                player.finalScore = score;
                player.finalRows = rows;
                player.finalLevel = level;
                player.gameOver = true;
            }

            const scores = roomObj.players.map(p => ({
                socketId: p.socketId,
                name: p.name,
                score: p.finalScore || 0,
                rows: p.finalRows || 0,
                level: p.finalLevel || 0
            }));
            const owner = roomObj.players.find(p => p.owner);
            const ownerSocketId = owner ? owner.socketId : null;
            for (const p of roomObj.players) {
                insertScore(p.name, p.finalScore || 0);
            }

            io.to(room).emit("final_scores", { scores, ownerSocketId });
        }
    });

    socket.on("restart_game", ({ room }) => {
        const roomObj = rooms.find((r) => r.name === room);
        if (roomObj) {
            roomObj.start = false;

            const tetrominos = 'IJLOSTZ';
            const sequence = [];
            for (let i = 0; i < 1000; i++) {
                sequence.push(tetrominos[Math.floor(Math.random() * tetrominos.length)]);
            }
            roomObj.tetrominoSequence = sequence;

            roomObj.players.forEach(p => {
                if (p) {
                    p.finalScore = 0;
                    p.finalRows = 0;
                    p.finalLevel = 0;
                    p.gameOver = false;
                    p.stage = [];
                }
            });
            io.to(room).emit("restart_game", { room, tetrominoSequence: sequence });
        }
    });

    socket.on("rows_cleared", ({ room, socketId, rows }) => {
        let penaltyRows = 0;
        if (rows >= 2) {
            penaltyRows = rows - 1;
            socket.to(room).emit("add_penalty_rows", {
                penaltyRows,
                fromPlayer: socketId
            });

        }

    });
});

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(port, () => {
        console.log('Server app listening on port ' + port);
    });
}

async function insertScore(name, score) {
    await supabase
        .from('scores')
        .insert([
            { name, score }
        ]);
}

module.exports = { app, httpServer, rooms, users, insertScore };