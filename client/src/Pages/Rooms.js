import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  StyledRoomsWrapper,
  StyledRooms,
  StyledPlayerInfo,
  StyledCreateRoomSection,
  StyledErrorMessage,
  StyledGridContainer,
  StyledSection,
  StyledList,
  StyledRoomItem,
  StyledPlayerItem,
  ReturnNav,
  StyledGravitySelector
} from "./styles/styledRooms";

const Rooms = ({ socket, selectedGravity, setSelectedGravity }) => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [error, setError] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [players, setPlayers] = useState([]);

    const gravityOptions = [
      { value: "Turtle", label: "Turtle" },
      { value: "Standard", label: "Standard"},
      { value: "Fast", label: "Fast"},
    ];

  useEffect(() => {
    const fetchPlayerName = () => {
      socket.emit("get_player_name", { socketId: socket.id }, (response) => {
        if (response && response.name) {
          setPlayerName(response.name);
        }
      });
    };

    const initializeRoom = () => {
        socket.emit("get_rooms");
        socket.emit("get_players");
      fetchPlayerName();
    };

    if (socket && socket.connected) {
      initializeRoom();
    }

    const handleConnect = () => {
      initializeRoom();
    };

    socket.on("connect", handleConnect);

    const handleRoomsList = (roomsList) => {
      setRooms(roomsList);
    };

    const handlePlayersList = (playersList) => {
      setPlayers(playersList);
    };

    socket.on("rooms_list", handleRoomsList);
    socket.on("players_list", handlePlayersList);

    const handleBeforeUnload = (e) => {
      socket.emit("player_disconnect", { socketId: socket.id });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const wasReloaded = sessionStorage.getItem("wasOnRoomPage");
    if (wasReloaded === "true") {
            sessionStorage.removeItem("wasOnRoomPage");
            navigate("/");
    }
    else {
            sessionStorage.setItem("wasOnRoomPage", "true");
        }

        return () => {
          socket.off("connect", handleConnect);
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
        navigate(`/${name}`);
    };

  return (
    <StyledRoomsWrapper>
      <StyledPlayerInfo isConnected={socket?.connected}>
        <div className="status-dot"></div>
        <span>{playerName}</span>
      </StyledPlayerInfo>

      <StyledRooms>
        <h1>Red Tetris</h1>

        <StyledCreateRoomSection>
          <div className="room-row">
            <input
              type="text"
              id="name"
              placeholder="Enter room name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleNameSubmit}>Create Room</button>
          </div>

          <StyledGravitySelector>
            <div className="options">
              {gravityOptions.map((option) => (
                <label key={option.value} className="option">
                  <input
                    type="checkbox"
                    checked={selectedGravity === option.value}
                    onChange={() => setSelectedGravity && setSelectedGravity(option.value)}
                  />
                  <span className="label">{option.label}</span>
                </label>
              ))}
            </div>
          </StyledGravitySelector>
        </StyledCreateRoomSection>

        {error && <StyledErrorMessage>{error}</StyledErrorMessage>}

        <StyledGridContainer>
          <StyledSection>
            <h2>Available Rooms</h2>
            <StyledList>
              {rooms.length === 0 ? (
                <p className="empty-message">No rooms available. Create one!</p>
              ) : (
                rooms.map((room, index) => (
                  <StyledRoomItem key={index}>
                    <span className="room-name">{room}</span>
                    <button onClick={() => navigate(`/${room}`)}>Join</button>
                  </StyledRoomItem>
                ))
              )}
            </StyledList>
          </StyledSection>

          <StyledSection>
            <h2>Players Online ({players.length})</h2>
            <StyledList>
              {players.length === 0 ? (
                <p className="empty-message">No players connected.</p>
              ) : (
                players.map((player, index) => (
                  <StyledPlayerItem key={index}>{player}</StyledPlayerItem>
                ))
              )}
            </StyledList>
          </StyledSection>
        </StyledGridContainer>
      </StyledRooms>
    </StyledRoomsWrapper>
  );
};

export default Rooms;
