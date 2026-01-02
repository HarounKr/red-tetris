export const STAGE_WIDTH = 10;
export const STAGE_HEIGHT = 20;

export const createStage = (stage_height, stage_width) => {
    const stage =[];

    for (let i = 0; i < stage_height; i++) {
        const row = [];

        for (let j = 0; j < stage_width; j++) {
            const cell = [0, 'clear'];
            row.push(cell);
        }

        stage.push(row);
    }
    return stage;
};



export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.length; y++) {                    // parcourir chaque ligne de la pièce
        for (let x = 0; x < player.tetromino[y].length; x++) {               // parcourir chaque colonne de la pièce
            if (player.tetromino[y][x] !== 0) {                                // ne tester que les cases occupées de la pièce
                if (
                    !stage[y + player.pos.y + moveY] ||                            // si on sortirait du tableau verticalement (dessous)
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||  // ou si on sortirait horizontalement (gauche/droite)
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear' // ou si la case cible n'est pas libre
                ) {
                    return true;                                                   // collision détectée
                }
            }
        }
    }
    return false;                                                          // aucune collision trouvée
};


export const drawPlayer = (stage, player) => {
    const newStage = stage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    );

    // Draw the tetromino at the player's position
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

    return newStage;
}
