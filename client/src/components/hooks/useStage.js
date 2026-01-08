import { useState, useEffect, useCallback } from 'react';
import { createStage, drawPlayer, STAGE_HEIGHT, STAGE_WIDTH } from '../../game/gameHelpers';

export const useStage = (player, resetPlayer) => {
    const [stage, setStage] = useState(createStage(STAGE_HEIGHT, STAGE_WIDTH));
    const [rowsCleared, setRowsCleared] = useState(0);

    // Fonction pour ajouter les pénalités de manière persistante
    const addPenaltyRows = useCallback((rowsCount) => {
        setStage(prev => {
            // 1. On crée les nouvelles lignes de pénalité (grises 'P', marquées 'merged')
            const penaltyRows = Array.from({ length: rowsCount }, () =>
                new Array(STAGE_WIDTH).fill(['P', 'merged'])
            );
            // 2. On retire X lignes du haut et on ajoute les pénalités en bas
            const newStage = [...prev.slice(rowsCount), ...penaltyRows];
            return newStage;
        });
    }, []);

    useEffect(() => {
        setRowsCleared(0);

        const sweepRows = (newStage) => {
            return newStage.reduce((ack, row) => {
                // On ne supprime une ligne que si elle est pleine ET que ce n'est pas une ligne de pénalité
                if (row.findIndex(cell => cell[0] === 0) === -1 && row[0][0] !== 'P') {
                    setRowsCleared(prev => prev + 1);
                    // On rajoute une ligne vide en haut pour compenser
                    ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);
        };



        const updateStage = (prevStage) => {
            // ÉTAPE CRUCIALE : On nettoie le plateau uniquement des cellules "non-fixées" (le joueur)
            // Les cellules 'merged' (anciennes pièces et pénalités) sont conservées intactes.
            const freshStage = prevStage.map(row =>
                row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );
            

            // On dessine la pièce actuelle du joueur sur ce plateau propre
            const newStage = drawPlayer(freshStage, player);

            // Si le joueur entre en collision, on réinitialise sa position et on nettoie les lignes pleines
            if (player.collided) {
                resetPlayer();
                return sweepRows(newStage);
            }
            
            return newStage;
        };

        setStage(prev => updateStage(prev));

    }, [player, resetPlayer]); // Ne pas mettre 'stage' ici pour éviter les boucles infinies

    const drawNextTetrominoShape = (nextRandomShape) => {
        if (!nextRandomShape) return createStage(4, 4);

        const hasO = nextRandomShape.some(row => row.includes('O'));
        const x = hasO ? 1 : 0;

        const shapeStage = createStage(4, 4);
        const dummyPlayer = {
            pos: { x: x, y: 1 },
            tetromino: nextRandomShape,
            collided: false,
        };

        const nextShapeStage = drawPlayer(shapeStage, dummyPlayer);
        return nextShapeStage;
    };

    return [
        stage,
        setStage,
        rowsCleared,
        drawNextTetrominoShape,
        addPenaltyRows
    
    ];
};
