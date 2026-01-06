import styled from "styled-components";

export const StyledMainLayout = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: #000;
`;

export const StyledRoomsWrapper = styled.div`
    flex: 1;
    height: 100vh;
    background-color: #000;
    background-size: cover;
    padding: 20px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const StyledPlayerInfo = styled.div`
    position: absolute;
    top: 30px;
    right: 50px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 12px 20px;
    border-radius: 50px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    z-index: 10;

    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: ${props => props.$isConnected ? '#00ff00' : '#ff0000'};
        box-shadow: 0 0 10px ${props => props.$isConnected ? '#00ff00' : '#ff0000'};
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    span {
        color: white;
        font-size: 1rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
`;

export const StyledRooms = styled.div`
    display: flex;
    flex-direction: column;
    padding: 40px;
    max-width: 900px;
    width: 100%;
    max-height: 85vh;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;

    h1 {
        color: white;
        font-size: 2.5rem;
        margin-bottom: 30px;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
`;

export const StyledCreateRoomSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    margin-bottom: 30px;

    .room-row {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    input {
        flex: 1;
        padding: 15px 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    button {
        padding: 15px 35px;
        background: red;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
    }
`;

export const StyledErrorMessage = styled.p`
    color: #ff4444;
    font-size: 0.9rem;
    margin-top: -15px;
    margin-bottom: 15px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

export const StyledGridContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    flex: 1;
    min-height: 0;
`;

export const StyledSection = styled.div`
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 25px;
    min-height: 0;

    h2 {
        color: white;
        font-size: 1.5rem;
        margin-bottom: 20px;
        text-align: center;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    }

    .empty-message {
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        font-size: 1rem;
        margin-top: 20px;
    }
`;

export const StyledList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex: 1;
`;

export const StyledRoomItem = styled.li`
    background: rgba(255, 255, 255, 0.15);
    padding: 20px;
    margin-bottom: 12px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);


    .room-name {
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    button {
        padding: 10px 20px;
        background: red;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px 0 rgba(255, 0, 0, 0.4);
    }
`;

export const StyledPlayerItem = styled.li`
    background: rgba(255, 255, 255, 0.15);
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 10px;
    color: white;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

export const ReturnNav = styled.div`
    position: absolute;
    top: 20px;
    left: 20px;

    button {
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        padding: 10px 15px;
        border-radius: 8px;
        transition: background-color 0.3s ease;

    }
`;

export const StyledGravitySelector = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
 
    border-radius: 12px;
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    align-self: center;
    width: 100%;

    .options {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        flex: 0 1 auto;
    }

    .option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: red;
        cursor: pointer;
    }

    .label {
        color: #fff;
        font-size: 0.95rem;
    }
`;

export const StyledAllScoreboards = styled.div`
    width: 280px;
    min-width: 280px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    h1 {
        color: white;
        font-size: 1.3rem;
        margin-bottom: 20px;
        text-align: center;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .empty-message {
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
        font-size: 0.9rem;
        margin-top: 20px;
    }
`;

export const StyledScoreboardItem = styled.div`
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px 15px;
    margin-bottom: 10px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.15);
    }

    .room-name {
        color: #ff4444;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .score-entry {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8rem;

        .player-name {
            color: white;
        }

        .score {
            color: #00ff00;
            font-weight: 600;
        }
    }
`;
