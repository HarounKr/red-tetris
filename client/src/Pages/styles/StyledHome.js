import styled from "styled-components";

export const StyledHomeWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    background-color: #000;
    background-size: cover;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const StyledHome = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    max-width: 600px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;

    h1 {
        color: white;
        font-size: 2rem;
        margin-bottom: 30px;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    

    input {
        width: 100%;
        padding: 15px;
        margin-bottom: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 1rem;
        transition: all 0.3s ease;

    }

    button {
        width: 100%;
        height: 100%;
        padding: 15px 30px;
        background: linear-gradient(135deg,rgb(255, 0, 0) 0%,rgb(227, 149, 149) 100%);
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px 0 rgba(102, 126, 234, 0.4);
    }

    p {
        margin-top: 15px;
        font-size: 1rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
`;
