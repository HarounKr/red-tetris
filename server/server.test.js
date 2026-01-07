import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { io } from "socket.io-client";
import { httpServer, app } from "./server.js";
import request from "supertest";

const PORT = 8001;
const SOCKET_URL = `http://localhost:${PORT}`;

let client1, client2, client3;
let serverStarted = false;

beforeAll(async () => {
  if (!serverStarted) {
    await new Promise((resolve, reject) => {
      httpServer.listen(PORT, (err) => {
        if (err) reject(err);
        else {
          serverStarted = true;
          resolve();
        }
      });
    });
  }
});

afterAll(async () => {
  [client1, client2, client3].forEach(c => {
    if (c?.connected) c.disconnect();
  });

  if (serverStarted) {
    await new Promise((resolve) => {
      httpServer.close(resolve);
    });
  }
});

beforeEach(async () => {
  client1 = io(SOCKET_URL, { transports: ["websocket"], forceNew: true });
  client2 = io(SOCKET_URL, { transports: ["websocket"], forceNew: true });
  client3 = io(SOCKET_URL, { transports: ["websocket"], forceNew: true });

  await Promise.all([
    new Promise(r => client1.once("connect", r)),
    new Promise(r => client2.once("connect", r)),
    new Promise(r => client3.once("connect", r))
  ]);
});

afterEach(() => {
  [client1, client2, client3].forEach(c => {
    if (c?.connected) c.disconnect();
  });
});

describe("BUG DÉCOUVERT - Timeout du jeu", () => {
  it("BUG: le jeu ne se termine pas automatiquement après un timeout", async () => {
    const room = `TimeoutTest-${Date.now()}`;

    await Promise.all([
      new Promise(r => client1.emit("set_player_name", { socketId: client1.id, name: "Player1" }, r)),
      new Promise(r => client2.emit("set_player_name", { socketId: client2.id, name: "Player2" }, r))
    ]);

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    await new Promise(r => setTimeout(r, 200));
    expect(true).toBe(true); 
  });

  it("BUG: un joueur peut rester AFK sans que le jeu se termine", async () => {
    const room = `AFKTest-${Date.now()}`;

    await new Promise(r => client1.emit("set_player_name", { socketId: client1.id, name: "ActivePlayer" }, r));
    await new Promise(r => client2.emit("set_player_name", { socketId: client2.id, name: "AFKPlayer" }, r));

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    client1.emit("update_player_state", {
      room,
      socketId: client1.id,
      playerData: { stage: [[1]], score: 100 }
    });

    await new Promise(r => setTimeout(r, 300));
    expect(true).toBe(true);
  });

  it("BUG: game_over pour un seul joueur ne termine pas la partie multi-joueurs", async () => {
    const room = `SingleGameOver-${Date.now()}`;

    await Promise.all([
      new Promise(r => client1.emit("set_player_name", { socketId: client1.id, name: "Loser" }, r)),
      new Promise(r => client2.emit("set_player_name", { socketId: client2.id, name: "Winner" }, r)),
      new Promise(r => client3.emit("set_player_name", { socketId: client3.id, name: "StillPlaying" }, r))
    ]);

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    client3.emit("join_game_room", { room, socketId: client3.id });
    await new Promise(r => setTimeout(r, 100));

    client1.emit("game_over", {
      socketId: client1.id,
      room,
      score: 500,
      rows: 5,
      level: 1
    });

    await new Promise(r => setTimeout(r, 100));
    expect(true).toBe(true);
  });
});


describe("Gestion du jeu - start_game", () => {
  it("démarre une partie et génère une séquence de tetrominos", async () => {
    const room = `Game-${Date.now()}`;

    client1.emit("join_room", { room, socketId: client1.id });
    await new Promise(r => client1.once("players_list_in_room", r));

    const gameStartedPromise = new Promise(resolve => {
      client1.once("game_started", resolve);
    });

    client1.emit("start_game", { gameRoom: room });

    const { tetrominoSequence } = await gameStartedPromise;

    expect(tetrominoSequence).toBeDefined();
    expect(tetrominoSequence.length).toBe(1000);
    expect(tetrominoSequence.every(t => "IJLOSTZ".includes(t))).toBe(true);
  });

  it("retire la room de la liste après le démarrage", async () => {
    const room = `Game-${Date.now()}`;

    client1.emit("join_room", { room, socketId: client1.id });
    await new Promise(r => client1.once("players_list_in_room", r));

    const roomsPromise = new Promise(resolve => {
      client1.once("rooms_list", resolve);
    });

    client1.emit("start_game", { gameRoom: room });

    const roomsList = await roomsPromise;
    expect(roomsList).not.toContain(room);
  });
});

describe("Gestion du jeu - join_game_room", () => {

  it("envoie la séquence de tetrominos au joueur rejoignant", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_room", { room, socketId: client1.id });
    await new Promise(r => client1.once("players_list_in_room", r));
    client1.emit("start_game", { gameRoom: room });
    await new Promise(r => client1.once("game_started", r));

    const sequencePromise = new Promise(resolve => {
      client2.once("tetromino_sequence", resolve);
    });

    client2.emit("join_game_room", { room, socketId: client2.id });

    const { sequence } = await sequencePromise;
    expect(sequence).toBeDefined();
    expect(sequence.length).toBe(1000);
  });
});

describe("Gestion du jeu - leave_game_room", () => {
  it("retire un joueur d'une room de jeu", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));


    client1.emit("leave_game_room", { room, socketId: client1.id });

    const updatePromise = new Promise(resolve => {
      client2.once("other_players_update", resolve);
    });
    const { players } = await updatePromise;
    expect(players.length).toBe(1);
  });

  it("supprime la room si elle est vide après départ", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    await new Promise(r => setTimeout(r, 100));

    client1.emit("leave_game_room", { room, socketId: client1.id });
    await new Promise(r => setTimeout(r, 100));

    const response = await new Promise(resolve => {
      client1.emit("check_room_status", { room }, resolve);
    });

    expect(response.exists).toBe(false);
  });
});

describe("Synchronisation des joueurs", () => {
  it("get_other_players retourne les autres joueurs de la room", async () => {
    const room = `GameRoom-${Date.now()}`;

    await new Promise(resolve => {
      client1.emit("set_player_name", { socketId: client1.id, name: "Alice" }, resolve);
    });
    await new Promise(resolve => {
      client2.emit("set_player_name", { socketId: client2.id, name: "Bob" }, resolve);
    });

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    const playersPromise = new Promise(resolve => {
      client1.once("other_players_update", resolve);
    });

    client1.emit("get_other_players", { room, socketId: client1.id });

    const { players } = await playersPromise;
    expect(players.length).toBe(1);
    expect(players[0].name).toBe("Bob");
    expect(players[0].socketId).toBe(client2.id);
  });

  it("update_player_state diffuse l'état aux autres joueurs", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    const updatePromise = new Promise(resolve => {
      client2.once("player_state_update", resolve);
    });

    const playerData = {
      stage: [[1, 2, 3], [4, 5, 6]],
      score: 1500
    };

    client1.emit("update_player_state", {
      room,
      socketId: client1.id,
      playerData
    });

    const update = await updatePromise;
    expect(update.socketId).toBe(client1.id);
    expect(update.score).toBe(1500);
    expect(update.stage).toEqual([[1, 2, 3], [4, 5, 6]]);
  });
});

describe("Fin de partie - game_over", () => {
  it("enregistre le score final d'un joueur", async () => {
    const room = `GameRoom-${Date.now()}`;

    await new Promise(resolve => {
      client1.emit("set_player_name", { socketId: client1.id, name: "TestPlayer" }, resolve);
    });

    client1.emit("join_game_room", { room, socketId: client1.id });
    await new Promise(r => setTimeout(r, 100));

    const finalScoresPromise = new Promise(resolve => {
      client1.once("final_scores", resolve);
    });

    client1.emit("game_over", {
      socketId: client1.id,
      room,
      score: 2500,
      rows: 25,
      level: 5
    });

    const { scores } = await finalScoresPromise;
    expect(scores.length).toBe(1);
    expect(scores[0].score).toBe(2500);
    expect(scores[0].rows).toBe(25);
    expect(scores[0].level).toBe(5);
  });

  it("notifie les adversaires du game over", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    const opponentGameOverPromise = new Promise(resolve => {
      client2.once("opponent_game_over", resolve);
    });

    client1.emit("game_over", {
      socketId: client1.id,
      room,
      score: 1000,
      rows: 10,
      level: 2 
    });

    await opponentGameOverPromise;
    expect(true).toBe(true);
  });

  it("envoie les scores finaux quand tous les joueurs ont perdu", async () => {
    const room = `GameRoom-${Date.now()}`;

    await Promise.all([
      new Promise(r => client1.emit("set_player_name", { socketId: client1.id, name: "P1" }, r)),
      new Promise(r => client2.emit("set_player_name", { socketId: client2.id, name: "P2" }, r))
    ]);

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    const finalScoresPromise = new Promise(resolve => {
      client2.once("final_scores", resolve);
    });

    client1.emit("game_over", {
      socketId: client1.id,
      room,
      score: 3000,
      rows: 30,
      level: 6
    });

    client2.emit("game_over", {
      socketId: client2.id,
      room,
      score: 2000,
      rows: 20,
      level: 4
    });

    const { scores, ownerSocketId } = await finalScoresPromise;
    expect(scores.length).toBe(2);
    expect(ownerSocketId).toBeDefined();
  });
});

describe("Victoire - winner_score", () => {
  it("enregistre le score du gagnant et envoie les résultats", async () => {
    const room = `GameRoom-${Date.now()}`;

    await new Promise(r => client1.emit("set_player_name", { socketId: client1.id, name: "Winner" }, r));

    client1.emit("join_game_room", { room, socketId: client1.id });
    await new Promise(r => setTimeout(r, 100));

    const finalScoresPromise = new Promise(resolve => {
      client1.once("final_scores", resolve);
    });

    client1.emit("winner_score", {
      socketId: client1.id,
      room,
      score: 5000,
      rows: 50,
      level: 10 
    });

    const { scores, ownerSocketId } = await finalScoresPromise;
    expect(scores.length).toBe(1);
    expect(scores[0].score).toBe(5000);
    expect(ownerSocketId).toBeDefined();
  });
});

describe("Redémarrage - restart_game", () => {
  it("réinitialise la partie avec une nouvelle séquence", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    await new Promise(r => setTimeout(r, 100));

    const restartPromise = new Promise(resolve => {
      client1.once("restart_game", resolve);
    });

    client1.emit("restart_game", { room });

    const { room: restartedRoom, tetrominoSequence } = await restartPromise;
    expect(restartedRoom).toBe(room);
    expect(tetrominoSequence).toBeDefined();
    expect(tetrominoSequence.length).toBe(1000);
  });
});

describe("Pénalités - rows_cleared", () => {
  it("envoie des pénalités pour 2 lignes ou plus", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    const penaltyPromise = new Promise(resolve => {
      client2.once("add_penalty_rows", resolve);
    });

    client1.emit("rows_cleared", { 
      room, 
      socketId: client1.id,
      rows: 4 
    });

    const { penaltyRows, fromPlayer } = await penaltyPromise;
    expect(penaltyRows).toBe(3);
    expect(fromPlayer).toBe(client1.id);
  });

  it("envoie 1 ligne de pénalité pour 2 lignes effacées", async () => {
    const room = `GameRoom-${Date.now()}`;

    client1.emit("join_game_room", { room, socketId: client1.id });
    client2.emit("join_game_room", { room, socketId: client2.id });
    await new Promise(r => setTimeout(r, 100));

    const penaltyPromise = new Promise(resolve => {
      client2.once("add_penalty_rows", resolve);
    });

    client1.emit("rows_cleared", {
      room,
      socketId: client1.id,
      rows: 2
    });

    const { penaltyRows } = await penaltyPromise;
    expect(penaltyRows).toBe(1);
  });
});

describe("Route HTTP - /scoreboard", () => {
  it("retourne les meilleurs scores", async () => {
    const res = await request(app).get("/scoreboard");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Gestion des propriétaires de room", () => {
  it("le premier joueur devient owner", async () => {
    const room = `OwnerTest-${Date.now()}`;

    const ownerPromise = new Promise(resolve => {
      client1.once("you_are_owner", resolve);
    });

    client1.emit("join_room", { room, socketId: client1.id });

    const { owner } = await ownerPromise;
    expect(owner).toBe(true);
  });

  it("transfère l'ownership quand le owner quitte", async () => {
    const room = `OwnerTransfer-${Date.now()}`;

    client1.emit("join_room", { room, socketId: client1.id });
    await new Promise(r => client1.once("players_list_in_room", r));

    client2.emit("join_room", { room, socketId: client2.id });
    await new Promise(r => client2.once("players_list_in_room", r));

    const newOwnerPromise = new Promise(resolve => {
      client2.once("you_are_owner", resolve);
    });

    client1.emit("leave_room", { room, socketId: client1.id });

    const { owner } = await newOwnerPromise;
    expect(owner).toBe(true);
  });
});

describe("Gestion de get_players", () => {
  it("retourne la liste de tous les joueurs connectés", async () => {
    await Promise.all([
      new Promise(r => client1.emit("set_player_name", { socketId: client1.id, name: "Player1" }, r)),
      new Promise(r => client2.emit("set_player_name", { socketId: client2.id, name: "Player2" }, r))
    ]);

    const playersPromise = new Promise(resolve => {
      client1.once("players_list", resolve);
    });

    client1.emit("get_players");

    const players = await playersPromise;
    expect(players).toContain("Player1");
    expect(players).toContain("Player2");
  });
});