import { useState, useEffect } from 'react';
import { createStage, drawPlayer, STAGE_HEIGHT, STAGE_WIDTH } from '../../gameHelpers';

export const useStage = (player, resetPlayer) => {
    
    const [stage, setStage] = useState(createStage(STAGE_HEIGHT, STAGE_WIDTH));
    const [rowsCleared, setRowsCleared] = useState(0);


    useEffect(() => {

        setRowsCleared(0);

        const sweepRows = (newStage) => {
            return newStage.reduce((ack, row) => {
                if (row.findIndex(cell => cell[0] === 0) === -1) {
                    setRowsCleared(prev => prev + 1);

                    ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);
        }

        const updateStage = (prevStage) => {
            const newStage = drawPlayer(prevStage, player);

            if (player.collided) {
               resetPlayer();
               return sweepRows(newStage);
            }
            
            return newStage;
        };

        setStage(prev => updateStage(prev));
    },  [player, resetPlayer]);

    const drawPlayerSpectrum = (player) => {
        const spectrumStage = createStage(STAGE_HEIGHT, STAGE_WIDTH);

        const playerSpectrum = drawPlayer(spectrumStage, player);

        return playerSpectrum;
    }

    const drawNextTetrominoShape = (nextRandomShape) => {

        const hasO = nextRandomShape.some(row => row.includes('O'));
        const x = hasO ? 1 : 0;

        const shapeStage = createStage(4, 4);

        const player = {
            pos: { x: x, y: 1 },
            tetromino: nextRandomShape,
            collided: false,
        }

        const nextShapeStage = drawPlayer(shapeStage, player);

        return nextShapeStage;
    }

    return [stage, setStage, rowsCleared, drawPlayerSpectrum, drawNextTetrominoShape];
};  