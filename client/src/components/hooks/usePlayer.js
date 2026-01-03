import { useState, useCallback, useRef } from 'react';
import { TETROMINOS } from '../../tetrominos';
import { checkCollision, STAGE_WIDTH } from '../../gameHelpers';

export const usePlayer = (sharedSequence = null) => {

    const sequenceIndexRef = useRef(0);

    const getNextTetromino = () => {
        if (sharedSequence && sharedSequence.length > 0) {
            const index = sequenceIndexRef.current;
            const tetrominoKey = sharedSequence[index % sharedSequence.length];
            sequenceIndexRef.current += 1;
            return TETROMINOS[tetrominoKey].shape;
        }
        const tetrominos = 'IJLOSTZ';
        const random = tetrominos[Math.floor(Math.random() * tetrominos.length)];
        return TETROMINOS[random].shape;
    };

    const [nextRandomShape, setNextRandomShape] = useState(() => getNextTetromino());

    const [player, setPlayer] = useState({
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    const rotate = (tetromino, dir) => {
        const rotatedTetro = [];

        for (let x = 0; x < tetromino[0].length; x++) {
            const row = [];

            for (let y = 0; y < tetromino.length; y++) {
                row.push(tetromino[y][x]);
            }
            rotatedTetro.push(row);
        }

        if (dir > 0)
            return rotatedTetro.map(row => row.reverse());

        return rotatedTetro.reverse();
    };

    const playerRotate = (stage, dir) => {
        const hasO = player.tetromino.some(row => row.includes('O'));

        if (!hasO) {
            const clonedPlayer = JSON.parse(JSON.stringify(player));    
            clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

            const pos = clonedPlayer.pos.x;
            let offset = 1;
            while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
                clonedPlayer.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > clonedPlayer.tetromino[0].length) {
                    rotate(clonedPlayer.tetromino, -dir);
                    clonedPlayer.pos.x = pos;
                    return;                                    
                }
            }    
            setPlayer(clonedPlayer);
        }
    };

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer(prev => ({
            ...prev,
            pos: { x: prev.pos.x + x, y: prev.pos.y + y },
            collided,
        }));
    };

    const resetPlayer = useCallback(() => {
        let x = STAGE_WIDTH / 2 - Math.floor(nextRandomShape.length / 2);

        setPlayer({
            pos: { x: x, y: 0 },
            tetromino: nextRandomShape,
            collided: false,
        });
        setNextRandomShape(getNextTetromino());

    }, [nextRandomShape, sharedSequence]);

    const resetSequenceIndex = useCallback(() => {
        sequenceIndexRef.current = 0;
    }, []);

    return [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate, resetSequenceIndex];
};
