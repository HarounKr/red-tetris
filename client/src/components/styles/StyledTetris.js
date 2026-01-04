import styled from "styled-components";

export const StyledTetrisWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    background-color: #000;
    background-size: cover;
    overflow: hidden;
    &:focus { outline: none; }
`;

export const StyledTetris = styled.div`
    display: flex;
    flex-direction: row;
    gap: 15px;
    padding: 40px;
    margin: 0 auto;
    max-width: 900px;

    .left-side {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100px;
        padding: 0 20px;
        color:white;
        gap: 20px;
        font-size: 15px;

        .spectrum {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            backgrourgba(158, 26, 26, 1)f3ff;

        }
    }

    .right-side {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 20px;
        max-width: 200px;
        padding: 0 20px;
    }
`

export const StyledNextPiece = styled.div`
    display: green;
    
`