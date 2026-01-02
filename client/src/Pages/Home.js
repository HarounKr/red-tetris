import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { StyledHomeWrapper, StyledHome } from "./styles/StyledHome";

const Home = ({ socket }) => {
    let navigate = useNavigate();
    const [name, setName] = useState("");
    const [error, setError] = useState(null);

    const handleNameSubmit = () => {
        if (!name) {
            setError("Name is required");
            return;
        }
        setError(null);
        socket.emit("set_name", { name: name, socketId: socket.id });
        navigate("/rooms");
    };

  return (
    <StyledHomeWrapper>
      <StyledHome>
        <h1>Red Tetris</h1>
        <input type="text" id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleNameSubmit}>Start Game</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </StyledHome>
    </StyledHomeWrapper>
  );
};

export default Home;
