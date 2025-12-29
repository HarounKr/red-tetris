import React, { useState } from 'react';

import Stage from './Stage';
import StartButtons from './StartButtons';
import Display from './Display';
import { createStage, checkCollision } from '../gameHelpers';
import { useStage } from './hooks/useStage';
import { usePlayer } from './hooks/usePlayer';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

const Tetris = () => {

    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState(null);
    const [player, updatePlayerPos, resetPlayer] = usePlayer(null);
    const [stage, setStage] = useStage(player, resetPlayer);

    console.log('re-render');

    const movePlayer = dir => {
        //move player
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    const startGame = () => {
        //reset everything
        console.log('start game');
        setStage(createStage());
        resetPlayer();
    };

    const drop = () => {
        //drop tetromino
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Game over
            if (player.pos.y < 1) {
                console.log("Game Over!");
                setGameOver(true);
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    const dropPlayer = () => {
        drop();
    };

    const moove = ({ keyCode }) => {

        console.log(keyCode);
        if (!gameOver) {
            if (keyCode === 37) {
                // left arrow
                movePlayer(-1);
            } else if (keyCode === 39) {
                // right arrow
                movePlayer(1);
            } else if (keyCode === 40) {
                // down arrow
                dropPlayer();
            } else if (keyCode === 38) {
                // up arrow
            }
        }
    };

    return (
        <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => moove(e)}>
            <StyledTetris>
                <Stage stage={stage} />
                <aside>
                    {gameOver ? (
                        <Display gameOver={gameOver} text="Game Over" />
                    ) : (
                        <>
                            <div>
                                <Display text="Score" />
                                <Display text="Rows" />
                                <Display text="Level" />
                            </div>
                            <StartButtons callback={startGame}/> 
                        </>
                   )}
                </aside>
            </StyledTetris>
        </StyledTetrisWrapper>
    );
    }
export default Tetris;
