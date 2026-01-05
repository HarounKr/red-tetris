import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  StyledMainLayout,
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
  StyledGravitySelector,
  StyledAllScoreboards
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

    const applyStoredPlayerName = () => {
      const storedName = sessionStorage.getItem('playerName');
      if (storedName) {
        socket.emit("set_player_name", { socketId: socket.id, name: storedName }, () => {
          setPlayerName(storedName);
        });
      } else {
        fetchPlayerName();
      }
    };

    const initializeRoom = () => {
        socket.emit("get_rooms");
        socket.emit("get_players");
      applyStoredPlayerName();
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

  const isValidName = (value) => {
    if (!value) return false;
    return /^[a-zA-Z]+$/.test(value);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z]/g, '');
    setName(filteredValue);
    if (error) setError(null);
  };

    const handleNameSubmit = () => {
        if (!name) {
            setError("Room name is required");
            return;
        }
      if (!isValidName(name)) {
        setError("Room name must contain only letters (no numbers or spaces)");
        return;
      }
      setError(null);
        navigate(`/${name}`);
    };

  return (
    <StyledMainLayout>
      <StyledRoomsWrapper>
        <StyledPlayerInfo $isConnected={socket?.connected}>
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
                placeholder="Enter room name (letters only)..."
                value={name}
                onChange={handleNameChange}
              />
              <button onClick={handleNameSubmit}>Create Room</button>
            </div>
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

      <StyledAllScoreboards>
        <h1>Scoreboards</h1>
        <p className="empty-message">No games played yet</p>
      </StyledAllScoreboards>
    </StyledMainLayout>
  );
};

export default Rooms;
