import React, { useEffect } from "react";
import { useState} from "react";
import { useParams , useNavigate} from "react-router";

const Room = ({ socket }) => {
    // create the room name from the url params
    
    const params = useParams();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState(params.room);
    const [players, setPlayers] = useState([]);

 useEffect(() => {
        const joinRoom = () => {
            console.log("🔵 Joining room:", params.room);
            setRoomName(params.room);
            socket.emit("join_room", { room: params.room, socketId: socket.id });
        };

        const handlePlayersList = (playersList) => {
            
            console.log("📋 Liste des joueurs dans la salle reçue:", playersList);
            setPlayers(playersList);
        };

        if (socket && socket.connected) {
            joinRoom();
        }

        const handleConnect = () => {
            joinRoom();
        };

        socket.on("connect", handleConnect);
        socket.on("players_list_in_room", handlePlayersList);

        // 🔴 Cleanup
        return () => {
            if (socket && socket.connected) {
                socket.emit("leave_room", { room: params.room, socketId: socket.id });
            }
            socket.off("connect", handleConnect);
            socket.off("players_list_in_room", handlePlayersList);
        };
    }, [socket, params.room]);

    const handleStartGame = () => {
        socket.emit("start_game");
    };

    const handleLeaveRoom = () => {
        console.log("🔴 Leaving room:", roomName);
        socket.emit("leave_room", { room: roomName, socketId: socket.id });
        setPlayers([]);
        navigate("/rooms");
        
    };

  return (
        <div>
            <h1>{roomName}</h1>
            <p>Socket ID: {socket?.id}</p>
            <p>Connecté: {socket?.connected ? "✅" : "❌"}</p>
            <button onClick={handleStartGame}>Start Game</button>
            <button onClick={handleLeaveRoom}>Leave Room</button>
            <h2>Current Players in the room: ({players.length})</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
        </div>
  );
};

export default Room;
