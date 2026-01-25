import { useEffect } from 'react'

export const usePenaltyHandler = ({socket, hasSubmittedScore, setGameOver, setDropTime, addPenaltyRows, player, stage, room, currentScoreRef, currentRowsRef, currentLevelRef}) => {

    useEffect(() => {
        if (!socket) return;

        const handlePenaltyRows = ({ penaltyRows, fromPlayer }) => {
            // 1. Ignorer si c'est nous qui avons envoyé la ligne
            if (fromPlayer === socket.id) return;

            // 2. Appliquer la pénalité de manière persistante
            // On appelle la fonction du hook qui va modifier l'état interne du stage
            addPenaltyRows(penaltyRows);

            // 3. Vérification du Game Over
            if (player && player.tetromino) {
                let hasCollision = false;

                // On vérifie la collision sur le "nouveau" plateau (virtuellement décalé)
                // car les lignes montent de 'penaltyRows' cases.
                for (let y = 0; y < player.tetromino.length; y++) {
                    for (let x = 0; x < player.tetromino[y].length; x++) {
                        if (player.tetromino[y][x] !== 0) {
                            const newY = player.pos.y + y - penaltyRows;
                            const newX = player.pos.x + x;

                            // Si après décalage la pièce tape le haut ou une cellule occupée
                            if (
                                newY < 0 ||
                                (stage[newY + penaltyRows] &&
                                    stage[newY + penaltyRows][newX] &&
                                    stage[newY + penaltyRows][newX][1] === 'merged')
                            ) {
                                hasCollision = true;
                                break;
                            }
                        }
                    }
                    if (hasCollision) break;
                }

                if (hasCollision) {
                    setGameOver(true);
                    setDropTime(null);

                    if (!hasSubmittedScore.current) {
                        hasSubmittedScore.current = true;
                        socket.emit("game_over", {
                            socketId: socket.id,
                            room,
                            score: currentScoreRef.current,
                            rows: currentRowsRef.current,
                            level: currentLevelRef.current
                        });
                    }
                }
            }
        };

        socket.on("add_penalty_rows", handlePenaltyRows);

        return () => {
            socket.off("add_penalty_rows", handlePenaltyRows);
        };
    }, [socket, addPenaltyRows, player, room, stage]);
};
