import React, { useState, useEffect, useMemo } from 'react';

import Stage from './Stage';
import Display from './Display';
import LeaveButtons from './LeaveButtons';
import { createStage, checkCollision, createNextPieceStage } from '../gameHelpers';
import { useStage } from './hooks/useStage';
import { usePlayer } from './hooks/usePlayer';
import { useInterval } from './hooks/useInterval';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { useGameStatus } from './hooks/useGameStatus';

const Tetris = (selectedGravity) => {

    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState(null);
    const [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate] = usePlayer(null);
    const [stage, setStage, rowsCleared] = useStage(player, resetPlayer, gameOver);
    const [level, setLevel, rows, setRows, score, setScore] = useGameStatus(rowsCleared);

    const [nextPieceStage, setNextPieceStage] = useState(createNextPieceStage());

    const gravity = useMemo(() => ({
        Turtle: 2000,
        Standard: 1000,
        Fast: 100,
    }), [])
       
    
    const movePlayer = dir => {
        //move player
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    useEffect(() => {
        setStage(createStage());
        const initialDrop = gravity[selectedGravity] || gravity.Standard;
        console.log(initialDrop)
        setDropTime(initialDrop);
        resetPlayer();
        setScore(0);
        setRows(0);
        setLevel(0);
    }, []);


    const leaveGame = () => {
        //leave game
        
    };

    const drop = () => {
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            setDropTime(dropTime / (level + 1) + 200);
        }
        //drop tetromino
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Game over
            if (player.pos.y <= 1) {
                setGameOver(true);
                setDropTime(null);
                return;
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    const dropPlayer = () => {
        drop();
    };

    const moove = ({ keyCode }) => {
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
                playerRotate(stage, 1); 
            }
        }
    };

    useInterval(() => {
            drop();
    }, dropTime);

    return (
        <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => moove(e)}>
            <StyledTetris>
                <div className='left-side'>
                    <div className='spectrum'>
                        <span>
                            Score
                        </span>
                            <Stage stage={stage} percentage={3.5} border={'0px solid #9b4747ff'} backgroundColor={'#707070ff'} isSpectrum={true} opacity={0.2}/>
                        <span>
                            Name
                        </span>
                        
                    </div>
                </div>
                    <Stage stage={stage} percentage={20} border={'2px solid #333'} backgroundColor={'#000000ff'} isSpectrum={false} />
                <div className='right-side'>
                    {gameOver ? (
                        <Display gameOver={gameOver} text="Game Over" />
                    ) : (
                        <>
                            <div>
                                <Display text={"Score " + score}/>
                                <Display text={"Rows " + rows} />
                                <Display text={"Level " + level } />
                            </div>
                            <LeaveButtons callback={leaveGame}/> 
                        </>
                   )}
                   
                </div>
            </StyledTetris>
        </StyledTetrisWrapper>
    );
}

export default Tetris;
