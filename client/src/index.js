import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Rooms from './Pages/Rooms';
import Room from './Pages/Room';
import App from './App';
import Tetris from './components/Tetris';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";


const { io } = require("socket.io-client");

const socket = io("http://localhost:8000", {
  transports: ['websocket', 'polling']
});

socket.on("connect", () => {
  const storedName = sessionStorage.getItem('playerName');
  if (storedName) {
    socket.emit("set_player_name", { socketId: socket.id, name: storedName });
  }
});

const AppWrapper = () => {
  const [selectedGravity, setSelectedGravity] = useState('Standard');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rooms socket={socket} />} />
        <Route path="/:room" element={<Room socket={socket} selectedGravity={selectedGravity} setSelectedGravity={setSelectedGravity} />} />
        <Route path="/:room/:player" element={<Tetris socket={socket} selectedGravity={selectedGravity} />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<AppWrapper />);

reportWebVitals();
