import React from "react";

import { StyledDisplayButton } from "./styles/StyledStartButton";

const StartButtons = ({ callback }) => {
    return (
        <StyledDisplayButton onClick={callback}>
            Start Game
        </StyledDisplayButton>
    );
    }

export default StartButtons;