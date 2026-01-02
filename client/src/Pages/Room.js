import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
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

const Room = ({ socket, selectedGravity }) => {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [roomName, setRoomName] = useState(params.room);
    const [players, setPlayers] = useState([]);
    const [player, setPlayer] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    const playerRef = useRef(player);

    useEffect(() => {
        playerRef.current = player;
    }, [player]);

    useEffect(() => {
        const playerNameFromState = location.state?.playerName;

        const joinRoom = () => {
            setRoomName(params.room);
            socket.emit("join_room", { room: params.room, socketId: socket.id });
        };

        const updateNameAndJoin = () => {
            if (playerNameFromState) {
                socket.emit("set_player_name", { socketId: socket.id, name: playerNameFromState }, () => {
                    joinRoom();
                    fetchPlayerInfo();
                });
            } else {
                joinRoom();
                fetchPlayerInfo();
            }
        };

        const fetchPlayerInfo = () => {
            socket.emit("get_player_name", { socketId: socket.id }, (response) => {
                if (response) {
                    setPlayer(response);
                    if (response.owner) {
                        setIsOwner(true);
                    }
                }
            });
        };

        const handlePlayersList = (playersList) => {
            const filteredPlayers = playersList.filter(p => p !== null && p !== undefined);
            setPlayers(filteredPlayers);
            const me = filteredPlayers.find(p => p.socketId === socket.id);
            if (me && me.owner) {
                setIsOwner(true);
            }
        };

        const handleConnect = () => {
            updateNameAndJoin();
        };

        const handleBeforeUnload = () => {
        if (socket && socket.connected) {
            socket.emit("leave_room", { room: params.room, socketId: socket.id });
        }
        };

        const handleYouAreOwner = (data) => {
            setIsOwner(data.owner);
        };

        if (socket && socket.connected) {
            updateNameAndJoin();
        }
        socket.on("connect", handleConnect);
        socket.on("players_list_in_room", handlePlayersList);
        socket.on("you_are_owner", handleYouAreOwner);
        socket.on("game_started", () => {
            navigate('/' + roomName + '/' + playerRef.current.name);
        });
        window.addEventListener("beforeunload", handleBeforeUnload);



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

                    {isOwner && (
                        <>
                            <button className="start-button" onClick={handleStartGame}>
                                Start Game
                            </button>
                            <button className="leave-button" onClick={handleLeaveRoom}>
                                Leave Room
                            </button>
                        </>
                    )}
                    {!isOwner && (
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
                                players.filter(p => p).map((player, index) => (
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
