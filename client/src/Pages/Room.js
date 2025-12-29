import React, { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
    StyledRoomWrapper,
    StyledRoom,
    StyledPlayerInfo,
    StyledButtonGroup,
    StyledPlayersSection,
    StyledPlayersList,
    StyledPlayerItem,
    ReturnNav,
    StyledPlayerStatus
} from "./styles/StyledRoom";

const Room = ({ socket }) => {
    // create the room name from the url params

    const params = useParams();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState(params.room);
    const [players, setPlayers] = useState([]);
    const [player, setPlayer] = useState("");

    useEffect(() => {
        const joinRoom = () => {
            setRoomName(params.room);
            socket.emit("join_room", { room: params.room, socketId: socket.id });
        };

        const fetchPlayerInfo = () => {
            socket.emit("get_player_name", { socketId: socket.id }, (response) => {
                if (response) {
                    setPlayer(response);
                }
            });
        };

        const handlePlayersList = (playersList) => {
            setPlayers(playersList);
        };

        const handleConnect = () => {
            joinRoom();
            fetchPlayerInfo();
        };

        const handleBeforeUnload = () => {
        if (socket && socket.connected) {
            socket.emit("leave_room", { room: params.room, socketId: socket.id });
        }
        };

        const handleYouAreOwner = (data) => {
            setPlayer(prev => ({
                ...prev,
                owner: data.owner
            }));
        };

        socket.on("connect", handleConnect);
        socket.on("players_list_in_room", handlePlayersList);
        socket.on("you_are_owner", handleYouAreOwner);
        socket.on("game_started", () => {
            navigate('/game');
        });
        window.addEventListener("beforeunload", handleBeforeUnload);

        if (socket && socket.connected) {
            joinRoom();
            fetchPlayerInfo();
        }

        return () => {
            if (socket && socket.connected) {
                socket.emit("leave_room", { room: params.room, socketId: socket.id });
            }
            socket.off("connect", handleConnect);
            socket.off("players_list_in_room", handlePlayersList);
            socket.off("you_are_owner", handleYouAreOwner);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [socket, params.room]);

    const handleStartGame = () => {
        console.log("Starting game in room:", roomName);
        socket.emit("start_game", { gameRoom: roomName });
    };

    const handleLeaveRoom = () => {
        socket.emit("leave_room", { room: roomName, socketId: socket.id });
        setPlayers([]);
        setPlayer(null);
        navigate("/");

    };

    return (
        <StyledRoomWrapper>
            <ReturnNav>
                <button onClick={handleLeaveRoom} >&lt;</button>
            </ReturnNav>
            <StyledPlayerInfo isConnected={socket?.connected}>
                <div className="status-dot"></div>
                {player && (
                    <span>{player.name}</span>
                )}

            </StyledPlayerInfo>

            <StyledRoom>
                <h1>Room: {roomName}</h1>

                <StyledButtonGroup>

                    {player && player.owner === true && (
                        <>
                            <button className="start-button" onClick={handleStartGame}>
                                Start Game
                            </button>
                            <button className="leave-button" onClick={handleLeaveRoom}>
                                Leave Room
                            </button>
                        </>
                    )}
                    {player && player.owner === false && (
                        <>
                            <button className="leave-button" onClick={handleLeaveRoom}>
                                Leave Room
                            </button>
                        </>
                    )}



                </StyledButtonGroup>

                <StyledPlayersSection>
                    <h2>Players in Room ({players ? players.length : 0})</h2>
                    <StyledPlayersList>
                        {players && players.length === 0 ? (
                            <p className="empty-message">Waiting for players...</p>
                        ) : (
                            players.map((player, index) => (
                                <StyledPlayerItem key={index}>
                                    <div className="name">{player.name}</div>
                                    <StyledPlayerStatus isOwner={player.owner}>
                                        {player.owner ? 'Owner' : 'Player'}
                                    </StyledPlayerStatus>
                                </StyledPlayerItem>
                            ))
                        )}

                    </StyledPlayersList>
                </StyledPlayersSection>
            </StyledRoom>
        </StyledRoomWrapper >
    );
};

export default Room;
