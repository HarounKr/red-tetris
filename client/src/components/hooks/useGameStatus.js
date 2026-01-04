import { useState, useEffect } from 'react'
import Room from '../../Pages/Room';

export const useGameStatus = (rowsCleared, socket, room) => {
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(0);
   
    
    const linePoints = [40, 100, 300, 1200];

    useEffect(() => {
        if (rowsCleared > 0) {
            setScore(prev => prev + linePoints[rowsCleared - 1] * (level + 1));
            setRows(prev => prev + rowsCleared);
            if (socket && socket.connected) {
                socket.emit("rows_cleared", { rows: rowsCleared, socketId: socket.id, room: room });
            }
        }
    }, [level, linePoints, score, rowsCleared]);

    return [level, setLevel, rows, setRows, score, setScore];
}
