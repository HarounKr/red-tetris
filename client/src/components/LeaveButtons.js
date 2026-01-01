import React from "react";

import { StyledDisplayButton } from "./styles/StyledDisplayButton";

const LeaveButtons = ({ callback }) => {
    return (
        <StyledDisplayButton onClick={callback}>
            Leave Game
        </StyledDisplayButton>
    );
    }

export default LeaveButtons;