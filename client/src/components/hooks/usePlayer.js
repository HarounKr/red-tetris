import { useState, useCallback } from 'react';
import { randomTetromino, TETROMINOS } from '../../tetrominos';
import { checkCollision, STAGE_WIDTH } from '../../gameHelpers';

export const usePlayer = () => {

    const getRandomShape = () => randomTetromino().shape

    const [nextRandomShape, setNextRandomShape] = useState(getRandomShape());

    const [player, setPlayer] = useState({
        pos: { x: STAGE_WIDTH / 2 - Math.floor(nextRandomShape.length / 2), y: 0 },
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
    }

    const playerRotate = (stage, dir) => {
        const hasO = player.tetromino.some(row => row.includes('O'));

        if (!hasO) {
            const clonedPlayer = JSON.parse(JSON.stringify(player));    
            clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

            const pos = clonedPlayer.pos.x;
            let offset = 1;
            while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {   // tant qu'il y a collision à la position actuelle
                //console.log('Collision détectée, offset actuel :', offset, 'pos.x :', clonedPlayer.pos.x);
                clonedPlayer.pos.x += offset;                               // tente un décalage horizontal (wall kick) avec l'offset courant
                //console.log('Décalage appliqué, nouvelle pos.x :', clonedPlayer.pos.x);
                offset = -(offset + (offset > 0 ? 1 : -1));                 // alterne le signe et augmente progressivement l'offset (1, -2, 3, -4…)
                //console.log('Nouvel offset calculé :', offset);
                if (offset > clonedPlayer.tetromino[0].length) {            // si on a dépassé la largeur de la pièce en essais de décalage
                    //console.log('Aucun décalage possible, on annule la rotation');
                    rotate(clonedPlayer.tetromino, -dir);                  // annule la rotation en la refaisant dans l'autre sens
                    clonedPlayer.pos.x = pos;                         // remet la position X d'origine
                    //console.log('Position original : ', clonedPlayer.pos.x);
                    return;                                    
                }
            }    
            setPlayer(clonedPlayer);
        }
    }

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
        setNextRandomShape(getRandomShape());

    }, [nextRandomShape]);

    return [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate];
}
