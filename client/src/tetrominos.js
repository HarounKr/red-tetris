export const TETROMINOS = {
    0: { shape: [[0]], color: '0, 0, 0' },
    P: { shape: [[0]], color: '80, 80, 80' },
    I: {
        shape: [
            [0, 0, 0, 0],
            ['I', 'I', 'I', 'I'],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: '79, 209, 197',   // cyan doux
    },
    J: {
        shape: [
            ['J', 0, 0],
            ['J', 'J', 'J'],
            [0, 0, 0],
        ],
        color: '71, 97, 255',    // bleu vif
    },
    L: {
        shape: [
            [0, 0, 'L'],
            ['L', 'L', 'L'],
            [0, 0, 0],
        ],
        color: '255, 170, 74',   // orange chaud
    },
    O: {
        shape: [
            ['O', 'O'],
            ['O', 'O'],
        ],
        color: '255, 214, 102',  // jaune doux
    },
    S: {
        shape: [
            [0, 'S', 'S'],
            ['S', 'S', 0],
            [0, 0, 0],
        ],
        color: '126, 217, 87',   // vert frais
    },
    T: {
        shape: [
            [0, 'T', 0],
            ['T', 'T', 'T'],
            [0, 0, 0],
        ],
        color: '155, 109, 239',  // violet moderne
    },
    Z: {
        shape: [
            ['Z', 'Z', 0],
            [0, 'Z', 'Z'],
            [0, 0, 0],
        ],
        color: '245, 90, 90',    // rouge saumon
    },
};