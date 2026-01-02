import { useState, useEffect } from 'react';
import { createStage, drawPlayer } from '../../gameHelpers';

export const useStage = (player, resetPlayer) => {
    
    const [stage, setStage] = useState(createStage());
    const [rowsCleared, setRowsCleared] = useState(0);

    useEffect(() => {

        setRowsCleared(0);

        const sweepRows = (newStage) => {
            return newStage.reduce((ack, row) => {
                const isComplete = row.findIndex(cell => cell[0] === 0) === -1;
                const hasPenalty = row.findIndex(cell => cell[0] === 'P') !== -1;

                if (isComplete && !hasPenalty) {
                    setRowsCleared(prev => prev + 1);
                    ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);
        }

        const updateStage = prevStage => {
            const newStage = prevStage.map(row =>
                row.map(cell => {
                    if (cell[1] === 'clear') {
                        return [0, 'clear'];
                    }
                    return cell;
                })
            );

            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newStage[y + player.pos.y][x + player.pos.x] = [
                            value,
                            player.collided ? 'merged' : 'clear',
                        ];
                    }
                });
            });

            if (player.collided) {
               resetPlayer();
               return sweepRows(newStage);
            }
            
            return newStage;
        };

        setStage(prev => updateStage(prev));
    },  [player, resetPlayer]);

    const drawPlayerSpectrum = (player) => {
        const spectrumStage = createStage();

        const playerSpectrum = drawPlayer(spectrumStage, player);

        return playerSpectrum;
    }

    return [stage, setStage, rowsCleared, drawPlayerSpectrum];
};  
