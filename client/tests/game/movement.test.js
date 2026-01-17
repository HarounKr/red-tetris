import { describe, expect, it, vi } from 'vitest'
import { handleKeyDown } from '../../src/game/movement'
import { createStage } from '../../src/game/gameHelpers'
import { TETROMINOS } from '../../src/tetrominos'

describe('movement', () => {
    it('Appelle preventDefault pour les touches de jeu', () => {
      
        const preventDefault = vi.fn();

        handleKeyDown({
            e: { keyCode: 37, preventDefault },
            gameOver: true,
            player: {},
            stage: {},
            dropSoundRef: null,
            playerRotate: vi.fn(),
            drop: vi.fn(),
            hardDrop: vi.fn(),
            playSound: vi.fn(),
            updatePlayerPos: vi.fn(),
            cancelLock: vi.fn()
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    it('Ne bloque pas les autres touches', () => {
        const preventDefault = vi.fn();

        handleKeyDown({
            e: { keyCode: 65, preventDefault },
            gameOver: true,
            player: {},
            stage: [],
            dropSoundRef: null,
            playerRotate: vi.fn(),
            drop: vi.fn(),
            hardDrop: vi.fn(),
            playSound: vi.fn(),
            updatePlayerPos: vi.fn(),
            cancelLock: vi.fn()
        });

        expect(preventDefault).not.toHaveBeenCalled();
    });

    it('Que la fonction drop est bien appelé lors du clique sur la flèche du bas', () => {
        const drop = vi.fn();

        handleKeyDown({
            e: { keyCode: 40, preventDefault: vi.fn() },
            gameOver: false,
            player: {},
            stage: [],
            dropSoundRef: null,
            playerRotate: vi.fn(),
            drop,
            hardDrop: vi.fn(),
            playSound: vi.fn(),
            updatePlayerPos: vi.fn(),
            cancelLock: vi.fn()
        });
        expect(drop).toHaveBeenCalledTimes(1);
    });


    it('Que la fonction hardDrop est bien appelé lors du clique sur espace', () => {
        const hardDrop = vi.fn();

        handleKeyDown({
            e: { keyCode: 32, preventDefault: vi.fn() },
            gameOver: false,
            player: {},
            stage: [],
            dropSoundRef: null,
            playerRotate: vi.fn(),
            drop: vi.fn(),
            hardDrop: hardDrop,
            playSound: vi.fn(),
            updatePlayerPos: vi.fn(),
            cancelLock: vi.fn()
        });
        expect(hardDrop).toHaveBeenCalledTimes(1);
    });

    it('Que la fonction de rotation est bien appelé lors du clique sur la flèche du haut', () => {
        const playerRotate = vi.fn();

        handleKeyDown({
            e: { keyCode: 38, preventDefault: vi.fn() },
            gameOver: false,
            player: {},
            stage: {},
            dropSoundRef: null,
            playerRotate: playerRotate,
            drop: vi.fn(),
            hardDrop: vi.fn(),
            playSound: vi.fn(),
            updatePlayerPos: vi.fn(),
            cancelLock: vi.fn()
        });

        expect(playerRotate).toHaveBeenCalledTimes(1);
    });

    it('Que la fonction des mouvements est bien appelé lors du clique sur les flèches droite/gauche', () => {
        const stage = createStage(20, 10);
        const player = {
            pos: { x: 3, y: 0 },
            tetromino: TETROMINOS['J'].shape,
            collided: false,
        };

        const updatePlayerPos = vi.fn();
        const playSound = vi.fn();

        // gauche
        handleKeyDown({
            e: { keyCode: 37, preventDefault: vi.fn() },
            gameOver: false,
            player: player,
            stage: stage,
            dropSoundRef: null,
            playerRotate: vi.fn(),
            drop: vi.fn(),
            hardDrop: vi.fn(),
            playSound: playSound,
            updatePlayerPos: updatePlayerPos,
            cancelLock: vi.fn()
        });

        expect(playSound).toHaveBeenCalledTimes(1);
        expect(updatePlayerPos).toHaveBeenCalledTimes(1);

        playSound.mockClear();
        updatePlayerPos.mockClear();

        // droite 
        handleKeyDown({
            e: { keyCode: 39, preventDefault: vi.fn() },
            gameOver: false,
            player: player,
            stage: stage,
            dropSoundRef: null,
            playerRotate: vi.fn(),
            drop: vi.fn(),
            hardDrop: vi.fn(),
            playSound: playSound,
            updatePlayerPos: updatePlayerPos,
            cancelLock: vi.fn()
        });

        expect(playSound).toHaveBeenCalledTimes(1);
        expect(updatePlayerPos).toHaveBeenCalledTimes(1);
    });
})