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