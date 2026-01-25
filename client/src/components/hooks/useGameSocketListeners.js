import { useEffect } from 'react'


export const useGameSocketListeners = ({ socket, currentScoreRef, currentRowsRef, currentLevelRef,setGameOver, setDropTime, setFinalScores, setShowScoreboard,setIsOwner, setOtherPlayers, room, navigate }) => {
     useEffect(() => {
            if (!socket)
                return;
    
            const handleOpponentGameOver = () => {
                setGameOver(true);
                setDropTime(null);
    
                socket.emit("winner_score", {
                    socketId: socket.id,
                    room,
                    score: currentScoreRef.current,
                    rows: currentRowsRef.current,
                    level: currentLevelRef.current
                });
            };
    
            const handleFinalScores = ({ scores, ownerSocketId }) => {
            
    
                setFinalScores(scores);
    
                if (ownerSocketId) {
                    setIsOwner(ownerSocketId === socket.id);
                }
                setShowScoreboard(true);
            };
    
            const handleYouAreOwner = ({ owner }) => {
                setIsOwner(owner);
            };
    
            const handleRestartGame = ({ tetrominoSequence }) => {
                navigate("/" + room, { replace: true });
            };
    
            const handleOtherPlayersUpdate = ({ players }) => {
                setOtherPlayers(players);
            };
    
            const handlePlayerStateUpdate = (playerData) => {
                setOtherPlayers(prev => {
                    const existingIndex = prev.findIndex(p => p.socketId === playerData.socketId);
                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = playerData;
                        return updated;
                    } else {
                        return [...prev, playerData];
                    }
                });
            };
    
            socket.on("opponent_game_over", handleOpponentGameOver);
            socket.on("final_scores", handleFinalScores);
            socket.on("you_are_owner", handleYouAreOwner);
            socket.on("restart_game", handleRestartGame);
            socket.on("other_players_update", handleOtherPlayersUpdate);
            socket.on("player_state_update", handlePlayerStateUpdate);
    
            return () => {
                socket.off("opponent_game_over", handleOpponentGameOver);
                socket.off("final_scores", handleFinalScores);
                socket.off("you_are_owner", handleYouAreOwner);
                socket.off("restart_game", handleRestartGame);
                socket.off("other_players_update", handleOtherPlayersUpdate);
                socket.off("player_state_update", handlePlayerStateUpdate);
            };
        }, [socket, room, navigate]);
}