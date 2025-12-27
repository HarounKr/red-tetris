import React from 'react';

import Stage from './Stage';
import StartButtons from './StartButtons';
import Display from './Display';
import { createStage } from '../gameHelpers';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

const Tetris = (
    { socket }
) => {
    return (
        <StyledTetrisWrapper>
            <StyledTetris>
                <Stage stage={createStage()} />
                <aside>
                    <div>
                        <Display text="Score" />
                        <Display text="Rows" />
                        <Display text="Level" />
                    </div>
                    <StartButtons socket={socket} />
                </aside>
            </StyledTetris>
        </StyledTetrisWrapper>
    );
    }
export default Tetris;