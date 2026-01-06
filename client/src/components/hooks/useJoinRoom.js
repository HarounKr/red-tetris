import { useEffect } from 'react'


export const useJoinRoom = ({socket, room, location, navigate, playerNameFromUrl, setAccessAllowed, setAccessChecked}) => {
    const isValidName = (name) => {
            if (!name) return false;
            return /^[a-zA-Z]+$/.test(name);
    };
    
     useEffect(() => {
        if (!socket || !room)
            return;

        if (!isValidName(room) || (playerNameFromUrl && !isValidName(playerNameFromUrl))) {
            navigate("/", { replace: true });
            return;
        }

        if (playerNameFromUrl) {
        }
        if (location.state?.tetrominoSequence) {
            setAccessChecked(true);
            setAccessAllowed(true);
            return;
        }

        socket.emit("check_room_status", { room }, (response) => {

            if (!response.exists) {
                navigate("/" + room, {
                    state: { playerName: playerNameFromUrl },
                    replace: true
                });
                return;
            }

            if (!response.inGame) {
                navigate("/" + room, {
                    state: { playerName: playerNameFromUrl },
                    replace: true
                });
                return;
            }

            navigate("/", { replace: true });
        });
    }, [socket, room, location.state, navigate, playerNameFromUrl]);
}