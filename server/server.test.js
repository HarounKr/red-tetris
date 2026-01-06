import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { io } from "socket.io-client";
import { httpServer, app } from "./server.js";
import request from "supertest";
const PORT = 8000;
const SOCKET_URL = `http://localhost:${PORT}`;

let client;
let client_2;

beforeAll(async () => {
  await new Promise((resolve) => {
    httpServer.listen(PORT, resolve);
  });

  client = io(SOCKET_URL, {
    transports: ["websocket"],
    forceNew: true
  });

  client_2 = io(SOCKET_URL, {
    transports: ["websocket"],
    forceNew: true
  });

  await new Promise((resolve) => {
    client.once("connect", resolve);
  });
});

afterAll(async () => {
  if (client?.connected) {
    client.disconnect();
  }
  if (client_2?.connected) {
    client_2.disconnect();
  }
  await new Promise((resolve) => {
    httpServer.close(resolve);
  });
});

// -------------------------
// TESTS Socket.IO
// -------------------------
describe("Socket.IO server", () => {
  it("le client se connecte", () => {
    expect(client.connected).toBe(true);
  });

  it("le nom du joueur est défini", async () => {
    const playerName = "Joueur1";
    const playerName2 = "Joueur2";
    const response = await new Promise((resolve) => {
      client.emit(
        "set_player_name",
        { socketId: client.id, name: playerName },
        resolve
      );
    });
    expect(response).toEqual({ success: true });
    const response2 = await new Promise((resolve) => {
      client_2.emit(
        "set_player_name",
        { socketId: client_2.id, name: playerName2 },
        resolve
      );
    });
    expect(response2).toEqual({ success: true });
  });

  it("le joueur rejoint une salle et apparaît dedans", async () => {
    const roomName = "SalleTest";

    client.emit("join_room", {
      room: roomName,
      socketId: client.id
    });

    const players = await new Promise((resolve) => {
      client.once("players_list_in_room", resolve);
    });

    expect(players).toHaveLength(1);
    expect(players[0].socketId).toBe(client.id);
  });

  it("la salle apparaît dans la liste des rooms", async () => {
    client.emit("get_rooms");

    const rooms = await new Promise((resolve) => {
      client.once("rooms_list", resolve);
    });

    expect(rooms).toContain("SalleTest");
  });

  it("check_room_status indique que la room existe", async () => {
    const response = await new Promise((resolve) => {
      client.emit(
        "check_room_status",
        { room: "SalleTest" },
        resolve
      );
    });

    expect(response.exists).toBe(true);
    expect(response.inGame).toBe(false);
  });

  it("Un deuxieme joueur joint la salle", async () => {
    const roomName = "SalleTest";

    client_2.emit("join_room", {
      room: roomName,
      socketId: client_2.id
    });

    const players = await new Promise((resolve) => {
      client.once("players_list_in_room", resolve);
    });

    const playerNames = players.map((p) => p.name);
    expect(playerNames).toContain("Joueur1");
    expect(playerNames).toContain("Joueur2");
    expect(players).toHaveLength(2);
    expect(players[0].socketId).toBe(client.id);
    expect(players[0].name).toBe("Joueur1");
    expect(players[1].socketId).toBe(client_2.id);
    expect(players[1].name).toBe("Joueur2");
  });

  it("le joueur quitte la salle", async () => {
    const room = `SalleTest-${Date.now()}`;
    client.emit("join_room", { room, socketId: client.id });
    await new Promise(r => client.once("players_list_in_room", r));
    client_2.emit("join_room", { room, socketId: client_2.id });
    await new Promise(r => client_2.once("players_list_in_room", r));
    const playersPromise = new Promise((resolve) => {
      client_2.once("players_list_in_room", resolve);
    });
    client.emit("leave_room", { room, socketId: client.id });
    const players = await playersPromise;
    expect(players).toHaveLength(1);
    expect(players[0].socketId).toBe(client_2.id);
  });

  it("le joueur retourne à l'accueil", async () => {
    const room = `SalleTest-${Date.now() + 1}`;
    const room2 = `SalleTest-${Date.now() + 2}`;
    client.emit("join_room", { room, socketId: client.id });
    client_2.emit("join_room", { room2, socketId: client_2.id });
    client.emit("player_return_home", { socketId: client.id });
    const roomsPromise = new Promise((resolve) => {
      client.once("rooms_list", resolve);
    });
    const rooms = await roomsPromise;
    expect(rooms).not.toContain(room);
    client_2.emit("player_return_home", { socketId: client_2.id });
    const roomsPromise2 = new Promise((resolve) => {
      client_2.once("rooms_list", resolve);
    });
    const rooms2 = await roomsPromise2;
    expect(rooms2).not.toContain(room2);
  });

  it("change game mode", async () => {
    const room = `SalleTest-${Date.now() + 3}`;
    client.emit("join_room", { room, socketId: client.id });
    await new Promise(r => client.once("players_list_in_room", r));
    const gameMode = "hard";
    client.emit("change_game_mode", { room, gameMode });
    const gameModePromise = new Promise((resolve) => {
      client.once("game_mode_update", resolve);
    });
    const response = await gameModePromise;
    expect(response.gameMode).toBe(gameMode);
  });

  it("get_rooms returns all rooms", async () => {
    const room1 = `SalleTest-${Date.now() + 4}`;
    const room2 = `SalleTest-${Date.now() + 5}`;
    client.emit("join_room", { room: room1, socketId: client.id });
    await new Promise((r) => client.once("players_list_in_room", r));
    client_2.emit("join_room", { room: room2, socketId: client_2.id });
    await new Promise((r) => client_2.once("players_list_in_room", r));
    const roomsPromise = new Promise((resolve) => {
      client.once("rooms_list", resolve);
    });
    client.emit("get_rooms");
    const rooms = await roomsPromise;
    expect(rooms).toContain(room1);
    expect(rooms).toContain(room2);
  });

  it("check room_status for non-existing room", async () => {
    const response = await new Promise((resolve) => {
      client.emit(
        "check_room_status",
        { room: "NonExistingRoom" },
        resolve
      );
    });
    expect(response.exists).toBe(false);
    expect(response.inGame).toBe(false);
  });

  it("retire un joueur des rooms au disconnect", async () => {
    client.emit("set_player_name", { socketId: client.id, name: "P1" });
    client_2.emit("set_player_name", { socketId: client_2.id, name: "P2" });

    client.emit("join_room", { room: "R1", socketId: client.id });
    client_2.emit("join_room", { room: "R1", socketId: client_2.id });

    const playersPromise = new Promise(res => {
      client_2.once("players_list_in_room", res);
    });

    client.disconnect();

    const players = await playersPromise;
    expect(players).toHaveLength(1);
    expect(players[0].socketId).toBe(client_2.id);
  });

  it("get_player_name retourne les infos du joueur", (done) => {
    client.emit("get_player_name", { socketId: client.id }, (response) => {
      expect(response).toBeDefined();
      expect(response.socketId).toBe(client.id);
      expect(response.name).toBeDefined();
      done();
    });
  });

  it("get_player_name retourne null pour un joueur inexistant", (done) => {
    client.emit("get_player_name", { socketId: "fake-id-12345" }, (response) => {
      expect(response).toBeNull();
      done();
    });
  });

  it("rows_cleared ne pénalise pas si moins de 2 lignes", async () => {
    const room = `NoPenalty-${Date.now()}`;
    
    client.emit("join_game_room", { room, socketId: client.id });
    await new Promise(r => setTimeout(r, 100));
    client_2.emit("join_game_room", { room, socketId: client_2.id });
    await new Promise(r => setTimeout(r, 100));

    let penaltyReceived = false;
    client_2.once("add_penalty_rows", () => {
      penaltyReceived = true;
    });

    client.emit("rows_cleared", { 
      room, 
      socketId: client.id, 
      rows: 1 
    });

    await new Promise(r => setTimeout(r, 100));
    expect(penaltyReceived).toBe(false);
  });


});

// -------------------------
// TESTS Routes HTTP
// -------------------------



describe("HTTP routes", () => {
  it("GET /api/health retourne OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.text).toBe("OK");
  });

  it("GET / retourne le message dev", async () => {
    process.env.NODE_ENV = "development";
    const res = await request(app).get("/");
    expect(res.text).toContain("Development mode");
  });
});