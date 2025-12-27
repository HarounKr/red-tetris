import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

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
        console.log("Name submitted:", name);
        socket.emit("set_name", { name: name, socketId: socket.id });
        navigate("/rooms");
    };

  return (
    <div>
      <h1>Welcome to Tetris Game</h1>
      <label htmlFor="name">Please enter your name:</label>
      <input type="text" id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleNameSubmit}>Start Game</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Home;
