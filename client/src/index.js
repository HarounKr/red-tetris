import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
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

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/game" element={<App socket={socket} />} />
      <Route path="/" element={<Rooms socket={socket} />} />
      <Route path="/:room" element={<Room socket={socket} />} />
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
