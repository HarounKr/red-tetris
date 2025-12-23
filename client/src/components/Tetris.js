import React from 'react';

import Stage from './Stage';
import StartButtons from './StartButtons';
import Display from './Display';
import { createStage } from '../gameHelpers';

const Tetris = () => {
    return (
        <div>
            <Stage stage={createStage()} />
            <aside>
                <div>
                    <Display text="Score" />
                    <Display text="Rows" />
                    <Display text="Level" />
                </div>
                <StartButtons />
            </aside>

        </div>
    );
    }
export default Tetris;