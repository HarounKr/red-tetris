import { useState, useCallback } from 'react';
import { randomTetromino, TETROMINOS } from '../../tetrominos';
import { STAGE_WIDTH } from '../../gameHelpers';


export const usePlayer = () => {

    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer(prev => ({
            ...prev,
            pos: { x: prev.pos.x + x, y: prev.pos.y + y },
            collided,
        }));
    };

    const resetPlayer = useCallback(() => {
        const tetrominoShape = randomTetromino().shape;
        let x = STAGE_WIDTH / 2 - Math.floor(tetrominoShape[0].length / 2);

        setPlayer({
            pos: { x: x, y: 0 },
            tetromino: tetrominoShape,
            collided: false,
        });
    }, []);

    return [player, updatePlayerPos, resetPlayer];
}
