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
        max-width: 120px;
        padding: 0 20px;
        color: white;
        gap: 20px;
        font-size: 15px;

        .spectrum {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }
    }

    .right-side {
        width: 100%;
        max-width: 200px;
        display: block;
        padding: 0 20px;
    }
`

export const StyledNextPiece = styled.div`
    display: green;
    
`
