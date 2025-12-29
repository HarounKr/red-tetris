export const STAGE_WIDTH = 10;
export const STAGE_HEIGHT = 20;

export const createStage = () => {
    const stage =[];

    for (let i = 0; i < STAGE_HEIGHT; i++) {
        const row = [];

        for (let j = 0; j < STAGE_WIDTH; j++) {
            const cell = [0, 'clear'];
            row.push(cell);
        }

        stage.push(row);
    }
    return stage;
};

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.length; y++) {
        for (let x = 0; x < player.tetromino[y].length; x++) {
            // Check that we're on a tetromino cell
            if (player.tetromino[y][x] !== 0) {
                if (
                    // Check that our move is inside the game areas height (y)
                    // We shouldn't go through the bottom of the stage
                    !stage[y + player.pos.y + moveY] ||
                    // Check that our move is inside the game areas width (x)
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    // Check that the cell we're moving to isn't set to clear
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};