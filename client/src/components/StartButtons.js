import React from "react";

const StartButtons = ({ callback, socket }) => {

    const handleStartGame = () => {
        socket.emit("start_game");
    };

    return (
        <button onClick={handleStartGame}>
            Start Game
        </button>
    );
    }

export default StartButtons;