import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Pages/Home';
import Rooms from './Pages/Rooms';
import Room from './Pages/Room';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes } from "react-router";
import { Route } from "react-router";


const { io } = require("socket.io-client");

// Créer le socket UNE SEULE FOIS en dehors du render
const socket = io("http://localhost:8000", {
  transports: ['websocket', 'polling']
});

// Logs pour déboguer la connexion
socket.on("connect", () => {
  console.log("✅ Connecté au serveur! Socket ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Déconnecté du serveur");
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion:", error.message);
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/game" element={<App socket={socket} />} />
      <Route path="/rooms" element={<Rooms socket={socket} />} />
      <Route path="/:room" element={<Room socket={socket} />} />

      <Route path="/" element={<Home socket={socket} />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
