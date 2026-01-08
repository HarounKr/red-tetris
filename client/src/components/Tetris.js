

import { useState, useEffect, useRef } from 'react';

import Stage from './Stage';
import Display from './Display';
import LeaveButtons from './LeaveButtons';
import Scoreboard from './Scoreboard';
import { createStage, STAGE_HEIGHT, STAGE_WIDTH } from '../game/gameHelpers';
import { useStage } from './hooks/useStage';
import { usePlayer } from './hooks/usePlayer';
import { useInterval } from './hooks/useInterval';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { useGameStatus } from './hooks/useGameStatus';
import { useParams, useNavigate, useLocation } from "react-router";
import Spectrums from './Spectrums';
import { ReactComponent as SoundOn } from '../assets/icons/volume-on.svg'
import { ReactComponent as SoundOff } from '../assets/icons/volume-off.svg'
import { dropLogic } from '../game/dropLogic';
import { usePenaltyHandler } from './hooks/usePenaltyHandler';
import { useSpectrums } from './hooks/useSpectrums';
import { useSound } from './hooks/useSound';
import { useGameSocketListeners } from './hooks/useGameSocketListeners';
import { handleKeyDown } from '../game/movement';
import { useJoinRoom } from './hooks/useJoinRoom';
import { useHandleRefresh } from './hooks/useHandleRefresh';

const Tetris = ({ socket, selectedGravity }) => {
    const { room, player: playerNameFromUrl } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [accessChecked, setAccessChecked] = useState(false);
    const [accessAllowed, setAccessAllowed] = useState(false);

    const [tetrominoSequence, setTetrominoSequence] = useState(location.state?.tetrominoSequence || null);
    const gameModeFromState = location.state?.gameMode || selectedGravity || 'Standard';
    const [nextTetrominoShape, setNextTetrominoShape] = useState();

    const [sound, setSound] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState(null);
    const [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate] = usePlayer(tetrominoSequence, sound);
    const [stage, setStage, rowsCleared, drawNextTetrominoShape, addPenaltyRows] = useStage(player, resetPlayer, gameOver);
    const [level, setLevel, rows, setRows, score, setScore] = useGameStatus(rowsCleared, socket, room);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [finalScores, setFinalScores] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [dropSoundRef, blockHitSoundRef, gameOverSoundRef, playSound] = useSound(sound);

    const hasSubmittedScore = useRef(false);

    const currentScoreRef = useRef(0);
    const currentRowsRef = useRef(0);
    const currentLevelRef = useRef(0);
   

    const [playersSpectrums, setPlayersSpectrums] = useState();
    const [otherPlayers, setOtherPlayers] = useState([]);

    const gravity = {
        Turtle: 2000,
        Standard: 1000,
        Rabbit: 100,
    }


    const drop = () => dropLogic({ ...gameContext, type: 'soft' });
    const hardDrop = () => dropLogic({ ...gameContext, type: 'hard' });

    const gameContext = {
        rows,
        room, 
        score,
        setLevel,
        level,
        gameModeFromState,
        gravity,
        player,
        stage,
        setGameOver,
        setDropTime,
        hasSubmittedScore,
        socket,
        blockHitSoundRef,
        updatePlayerPos,
        playSound,
        addPenaltyRows,
        currentScoreRef,
        currentRowsRef,
        currentLevelRef,
        otherPlayers,
        setOtherPlayers,
        setPlayersSpectrums,
        createStage,
        navigate,
        setFinalScores,
        setShowScoreboard,
        setIsOwner,
        dropSoundRef,
        playerRotate,
        drop,
        hardDrop,
        setAccessAllowed,
        setAccessChecked,
        playerNameFromUrl,
        location,
    }


    usePenaltyHandler(gameContext);

    useSpectrums(gameContext);

    useGameSocketListeners(gameContext);

    useJoinRoom(gameContext);


    useEffect(() => {
        if (!accessAllowed)
            return;

        setStage(createStage(STAGE_HEIGHT, STAGE_WIDTH));
        const initialDrop = gravity[gameModeFromState] || gravity.Standard;
        setDropTime(initialDrop);
        resetPlayer();
        setScore(0);
        setRows(0);
        setLevel(0);
    }, [accessAllowed, gameModeFromState]);
   
   

    useEffect(() => {
        if (!socket || !accessAllowed)
            return;

        const handleTetrominoSequence = ({ sequence }) => {
            if (sequence && !tetrominoSequence) {
                setTetrominoSequence(sequence);
            }
        };

        socket.on("tetromino_sequence", handleTetrominoSequence);

        if (room) {
            socket.emit("join_game_room", { room, socketId: socket.id });
            socket.emit("get_other_players", { room, socketId: socket.id });
        }

        return () => {
            socket.off("tetromino_sequence", handleTetrominoSequence);
            if (room) {
                socket.emit("leave_game_room", { room, socketId: socket.id });
            }
        };
    }, [socket, room, tetrominoSequence, accessAllowed]);

    useEffect(() => {
        if (!accessAllowed) return;
        if (socket && room && player && !gameOver) {
            socket.emit("update_player_state", {
                room,
                socketId: socket.id,
                playerData: {
                    pos: player.pos,
                    score,
                    tetromino: player.tetromino,
                    collided: player.collided,
                    stage
                }
            });
        }
    }, [player, score, stage, socket, room, gameOver]);


    useEffect(() => {
        currentScoreRef.current = score;
        currentRowsRef.current = rows;
        currentLevelRef.current = level;
    }, [score, rows, level]);

    

    useEffect(() => {
        setNextTetrominoShape(drawNextTetrominoShape(nextRandomShape));
    }, [nextRandomShape])



    const leaveGame = () => {
        if (room && socket && socket.connected) {
            socket.emit("leave_room", { room, socketId: socket.id });
        }
        setGameOver(true);
        setDropTime(null);
        navigate("/");
    };

    useHandleRefresh({dropTime, leaveGame});


    useEffect(() => {
        if (gameOver && sound) {
            playSound(gameOverSoundRef);
        }

    }, [gameOver, rowsCleared]);


    useInterval(() => {
        drop();
    }, dropTime);

    useEffect(() => {
    }, [dropTime, gameModeFromState]);

    const handleCloseScoreboard = () => {
        setShowScoreboard(false);
        navigate("/");
    };

    const handleRestart = () => {
        socket.emit("restart_game", { room });
    };

     const handleSound = () => {
        setSound(!sound);
    }

    if (!accessChecked || !accessAllowed) {
        return (
            <StyledTetrisWrapper>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: 'white',
                    fontSize: '24px'
                }}>
                    Checking access...
                </div>
            </StyledTetrisWrapper>
        );
    }


    return (
        <StyledTetrisWrapper data-testid='testris-wrapper' role="button" tabIndex="0" onKeyDown={(e) => handleKeyDown({...gameContext, e: e})}>
            <StyledTetris>
                <div  className='left-side'>
                    <Spectrums  playersSpectrums={playersSpectrums} />
                </div>
                <Stage stage={stage} percentage={20} border={'2px solid #333'} backgroundColor={'#000000ff'} isSpectrum={false} />
                <div className='right-side'>
                    <div className='soundIcon' onClick={handleSound}>
                        {sound ? <SoundOn /> : <SoundOff />}
                    </div>

                    {gameOver ? (
                        <></>
                    ) : (
                            <>
                                <Display text={"Score " + score} />
                                <Display text={"Rows " + rows} />
                                <Display text={"Level " + level} />
                                <Stage stage={nextTetrominoShape} percentage={4.5} border={'2px solid #333'} backgroundColor={'#000000ff'} isSpectrum={false} />
                                <LeaveButtons callback={leaveGame} />

                        </>
                    )}
                </div>
            </StyledTetris>

            {showScoreboard && (
                <Scoreboard
                    scores={finalScores}
                    mySocketId={socket.id}
                    onClose={handleCloseScoreboard}
                    onRestart={handleRestart}
                    isOwner={isOwner}
                />
            )}
        </StyledTetrisWrapper>
    );
};

export default Tetris;
