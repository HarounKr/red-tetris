import { useEffect } from 'react'

export const useSpectrums = ({otherPlayers, setPlayersSpectrums, socket, stage, score, createStage}) => {

    useEffect(() => {
        if (!otherPlayers || !Array.isArray(otherPlayers)) {
            setPlayersSpectrums([]);
            return;
        }
        // Always show your own spectrum
        const spectrums = [{
            player: {
                name: 'You',
                score: score,
                socketId: socket?.id
            },
            spectrum: stage
        }];
        // Add spectrums for all other players in the room
        otherPlayers.forEach(p => {
            if (p.socketId !== socket?.id) {
                spectrums.push({
                    player: {
                        name: p.name,
                        score: p.score || 0,
                        socketId: p.socketId
                    },
                    spectrum: p.stage && p.stage.length > 0 ? p.stage : createStage()
                });
            }
        });
        setPlayersSpectrums(spectrums);
    }, [otherPlayers, stage, score, socket]);
}