

import React, { useState, useEffect, useMemo, useRef } from 'react';

import Stage from './Stage';
import Display from './Display';
import LeaveButtons from './LeaveButtons';
import Scoreboard from './Scoreboard';
import { createStage, checkCollision, STAGE_HEIGHT, STAGE_WIDTH } from '../gameHelpers';
import { useStage } from './hooks/useStage';
import { usePlayer } from './hooks/usePlayer';
import { useInterval } from './hooks/useInterval';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { useGameStatus } from './hooks/useGameStatus';
import { useParams, useNavigate, useLocation } from "react-router";
import dropBlock from '../assets/drop-block.wav';
import blockHit from '../assets/game-block-hit.wav';
import childGameOver from '../assets/child-game-over.wav'
import rowClear from '../assets/row-cleared.wav'
import Spectrums from './Spectrums';
import { ReactComponent as SoundOn } from '../assets/icons/volume-on.svg'
import { ReactComponent as SoundOff } from '../assets/icons/volume-off.svg'

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
    const [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate, resetSequenceIndex] = usePlayer(tetrominoSequence, sound);
    const [stage, setStage, rowsCleared, drawPlayersSpectrums, drawNextTetrominoShape, addPenaltyRows] = useStage(player, resetPlayer, gameOver);
    const [level, setLevel, rows, setRows, score, setScore] = useGameStatus(rowsCleared, socket, room);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [finalScores, setFinalScores] = useState([]);
    const [isOwner, setIsOwner] = useState(false);

    const hasSubmittedScore = useRef(false);

    const currentScoreRef = useRef(0);
    const currentRowsRef = useRef(0);
    const currentLevelRef = useRef(0);
    const dropSoundRef = useRef();
    const blockHitSoundRef = useRef();
    const gameOverSoundRef = useRef();

    const [playersSpectrums, setPlayersSpectrums] = useState();
    const [otherPlayers, setOtherPlayers] = useState([]);
    const gravity = {
        Turtle: 2000,
        Standard: 1000,
        Rabbit: 100,
    }

    useEffect(( ) => {
        dropSoundRef.current = new Audio(dropBlock);
        blockHitSoundRef.current = new Audio(blockHit);
        gameOverSoundRef.current = new Audio(childGameOver);

        [dropSoundRef, blockHitSoundRef, gameOverSoundRef].forEach((ref) => {
            if (ref.current)
                ref.current.preload = 'auto';
        })

    }, [])

    const playSound = (audioRef) => {
        if (sound && audioRef) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    }

    useEffect(() => {
       console.log(dropTime);
       if (!dropTime) return;

       const handleBeforeUnload = () => {
        leaveGame();
       }

       window.addEventListener('beforeunload', handleBeforeUnload);

       return (() => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
       })

    }, [dropTime]);

    useEffect(() => {
        if (!accessAllowed) return;

        setStage(createStage(STAGE_HEIGHT, STAGE_WIDTH));
        const initialDrop = gravity[gameModeFromState] || gravity.Standard;
        setDropTime(initialDrop);
        resetPlayer();
        setScore(0);
        setRows(0);
        setLevel(0);
    }, [accessAllowed, gameModeFromState]);


    const isValidName = (name) => {
        if (!name) return false;
        return /^[a-zA-Z]+$/.test(name);
    };

    useEffect(() => {
        if (!socket || !room) return;

        if (!isValidName(room) || (playerNameFromUrl && !isValidName(playerNameFromUrl))) {
            navigate("/", { replace: true });
            return;
        }

        if (playerNameFromUrl) {
        }

        if (location.state?.tetrominoSequence) {
            setAccessChecked(true);
            setAccessAllowed(true);
            return;
        }

        socket.emit("check_room_status", { room }, (response) => {

            if (!response.exists) {
                navigate("/" + room, {
                    state: { playerName: playerNameFromUrl },
                    replace: true
                });
                return;
            }

            if (!response.inGame) {
                navigate("/" + room, {
                    state: { playerName: playerNameFromUrl },
                    replace: true
                });
                return;
            }

            navigate("/", { replace: true });
        });
    }, [socket, room, location.state, navigate, playerNameFromUrl]);

    useEffect(() => {
        if (!socket || !accessAllowed) return;

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

    const movePlayer = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            playSound(dropSoundRef);
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    useEffect(() => {
        setNextTetrominoShape(drawNextTetrominoShape(nextRandomShape));
    }, [nextRandomShape])



    useEffect(() => {
        if (!otherPlayers || !Array.isArray(otherPlayers)) {
            setPlayersSpectrums([]);
            return;
        }
        // Always show your own spectrum
        const spectrums = [{
            player: {
                name: 'You',
                score: score,
                socketId: socket?.id
            },
            spectrum: stage
        }];
        // Add spectrums for all other players in the room
        otherPlayers.forEach(p => {
            if (p.socketId !== socket?.id) {
                spectrums.push({
                    player: {
                        name: p.name,
                        score: p.score || 0,
                        socketId: p.socketId
                    },
                    spectrum: p.stage && p.stage.length > 0 ? p.stage : createStage()
                });
            }
        });
        setPlayersSpectrums(spectrums);
    }, [otherPlayers, stage, score, socket]);


    const leaveGame = () => {
        if (room && socket && socket.connected) {
            socket.emit("leave_room", { room, socketId: socket.id });
        }
        setGameOver(true);
        setDropTime(null);
        navigate("/");
    };

    const drop = () => {
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            if (gameModeFromState !== 'Rabbit') {
                const baseSpeed = gravity[gameModeFromState] || gravity.Standard;
                setDropTime(Math.max(100, baseSpeed - (level + 1) * 100));
            }
        }
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            if (player.pos.y <= 1) {
                setGameOver(true);
                setDropTime(null);
                

                if (!hasSubmittedScore.current) {
                    hasSubmittedScore.current = true;
                    socket.emit("game_over", {
                        socketId: socket.id,
                        room,
                        score,
                        rows,
                        level
                    });
                } else {
                }
                return;
            }
            playSound(blockHitSoundRef);
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleOpponentGameOver = () => {
            setGameOver(true);
            setDropTime(null);

            socket.emit("winner_score", {
                socketId: socket.id,
                room,
                score: currentScoreRef.current,
                rows: currentRowsRef.current,
                level: currentLevelRef.current
            });
        };

        const handleFinalScores = ({ scores, ownerSocketId }) => {

            setFinalScores(scores);
            if (ownerSocketId) {
                setIsOwner(ownerSocketId === socket.id);
            }
            setShowScoreboard(true);
        };

        const handleYouAreOwner = ({ owner }) => {
            setIsOwner(owner);
        };

        const handleRestartGame = ({ tetrominoSequence }) => {

            navigate("/" + room, { replace: true });
        };

        const handleOtherPlayersUpdate = ({ players }) => {
            setOtherPlayers(players);
        };

        const handlePlayerStateUpdate = (playerData) => {
            setOtherPlayers(prev => {
                const existingIndex = prev.findIndex(p => p.socketId === playerData.socketId);
                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = playerData;
                    return updated;
                } else {
                    return [...prev, playerData];
                }
            });
        };

        socket.on("opponent_game_over", handleOpponentGameOver);
        socket.on("final_scores", handleFinalScores);
        socket.on("you_are_owner", handleYouAreOwner);
        socket.on("restart_game", handleRestartGame);
        socket.on("other_players_update", handleOtherPlayersUpdate);
        socket.on("player_state_update", handlePlayerStateUpdate);

        return () => {
            socket.off("opponent_game_over", handleOpponentGameOver);
            socket.off("final_scores", handleFinalScores);
            socket.off("you_are_owner", handleYouAreOwner);
            socket.off("restart_game", handleRestartGame);
            socket.off("other_players_update", handleOtherPlayersUpdate);
            socket.off("player_state_update", handlePlayerStateUpdate);
        };
    }, [socket, room, navigate]);

    useEffect(() => {
        if (!socket) return;

    const handlePenaltyRows = ({ penaltyRows, fromPlayer }) => {
        // 1. Ignorer si c'est nous qui avons envoyé la ligne
        if (fromPlayer === socket.id) return;

        // 2. Appliquer la pénalité de manière persistante
        // On appelle la fonction du hook qui va modifier l'état interne du stage
        addPenaltyRows(penaltyRows);

        // 3. Vérification du Game Over
        if (player && player.tetromino) {
            let hasCollision = false;

            // On vérifie la collision sur le "nouveau" plateau (virtuellement décalé)
            // car les lignes montent de 'penaltyRows' cases.
            for (let y = 0; y < player.tetromino.length; y++) {
                for (let x = 0; x < player.tetromino[y].length; x++) {
                    if (player.tetromino[y][x] !== 0) {
                        const newY = player.pos.y + y - penaltyRows;
                        const newX = player.pos.x + x;

                        // Si après décalage la pièce tape le haut ou une cellule occupée
                        if (
                            newY < 0 ||
                            (stage[newY + penaltyRows] &&
                                stage[newY + penaltyRows][newX] &&
                                stage[newY + penaltyRows][newX][1] === 'merged')
                        ) {
                            hasCollision = true;
                            break;
                        }
                    }
                }
                if (hasCollision) break;
            }

            if (hasCollision) {
                setGameOver(true);
                setDropTime(null);

                if (!hasSubmittedScore.current) {
                    hasSubmittedScore.current = true;
                    socket.emit("game_over", {
                        socketId: socket.id,
                        room,
                        score: currentScoreRef.current,
                        rows: currentRowsRef.current,
                        level: currentLevelRef.current
                    });
                }
            }
        }
    };

    socket.on("add_penalty_rows", handlePenaltyRows);

    return () => {
        socket.off("add_penalty_rows", handlePenaltyRows);
    };
}, [socket, addPenaltyRows, player, room, stage]);

    const dropPlayer = () => {
        playSound(dropSoundRef)
        drop();
    };

    const hardDrop = () => {
        let newY = player.pos.y;
        while (!checkCollision(player, stage, { x: 0, y: newY - player.pos.y + 1 })) {
            newY++;
        }
        playSound(blockHitSoundRef);
        updatePlayerPos({ x: 0, y: newY - player.pos.y, collided: true });
    };

    useEffect(() => {
        if (gameOver && sound) {
            playSound(gameOverSoundRef);
        }

    }, [gameOver, rowsCleared]);

    const moove = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) {
                movePlayer(-1);
            } else if (keyCode === 39) {
                movePlayer(1);
            } else if (keyCode === 40) {
                dropPlayer();
            } else if (keyCode === 38) {
                playerRotate(stage, 1, sound); 
            } else if (keyCode === 32) {
                hardDrop();
            }
        }
    };

    const handleKeyDown = (e) => {
        if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
        moove(e);
    };

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

    const handleSound = () => {
        setSound(!sound);
    }

    return (
        <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={handleKeyDown}>
            <StyledTetris>
                <div className='left-side'>
                    <Spectrums playersSpectrums={playersSpectrums} />
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
