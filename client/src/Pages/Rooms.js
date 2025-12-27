import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

const Rooms = ({ socket }) => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [error, setError] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.emit("get_rooms");
        socket.emit("get_players");

        const handleRoomsList = (roomsList) => {
            console.log("Liste des salles reçue:", roomsList);
            setRooms(roomsList);
        };

        const handlePlayersList = (playersList) => {
            console.log("Liste des joueurs reçue:", playersList);
            setPlayers(playersList);
        };

        socket.on("rooms_list", handleRoomsList);
        socket.on("players_list", handlePlayersList);

        // 🔄 Détecter le rechargement et envoyer la déconnexion
        const handleBeforeUnload = (e) => {
            console.log("🔄 Page en cours de rechargement...");
            socket.emit("player_disconnect", { socketId: socket.id });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        const wasReloaded = sessionStorage.getItem("wasOnRoomPage");
        if (wasReloaded === "true") {
            console.log("🔄 Redirection après rechargement détecté");
            sessionStorage.removeItem("wasOnRoomPage");
            navigate("/");
        } else {
            sessionStorage.setItem("wasOnRoomPage", "true");
        }

        return () => {
            socket.off("rooms_list", handleRoomsList);
            socket.off("players_list", handlePlayersList);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            sessionStorage.removeItem("wasOnRoomPage");
        };
    }, [socket, navigate]);
    
    const handleNameSubmit = () => {
        if (!name) {
            setError("Room name is required");
            return;
        }
        setError(null);
        console.log("Room name submitted:", name);
        navigate(`/${name}`);
    };

  return (
    <div>
      <h1>Create Your Room</h1>
      <p>Socket ID: {socket?.id}</p>
      <p>Connecté: {socket?.connected ? "✅" : "❌"}</p>
      <label htmlFor="name">Please enter your room name:</label>
      <input type="text" id="name" placeholder="Enter your room name" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleNameSubmit}>Start Game</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Current Rooms:</h2>
      <ul>
        {rooms.length === 0 ? (
          <p>No rooms available. Create one!</p>
        ) : (
          rooms.map((room, index) => (
            <li key={index}>
              <h1>{room}</h1>
              <button onClick={() => navigate(`/${room}`)}>Join Room</button>
            </li>
          ))
        )}
      </ul>
      <h2>Current Players: ({players.length})</h2>
      <ul>
        {players.length === 0 ? (
          <p>No players connected.</p>
        ) : (
          players.map((player, index) => (
            <li key={index}>{player}</li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Rooms;
