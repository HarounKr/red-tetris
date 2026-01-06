import styled from "styled-components";

export const StyledRoomWrapper = styled.div`
    width: 100vw;
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

export const StyledRoom = styled.div`
    display: flex;
    flex-direction: column;
    padding: 40px;
    max-width: 800px;
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

    h2 {
        color: white;
        font-size: 1.5rem;
        margin-top: 30px;
        margin-bottom: 20px;
        text-align: center;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    }
`;

export const StyledButtonGroup = styled.div`
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 20px;

    button {
        padding: 15px 35px;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;


        &:active {
            transform: translateY(0);
        }

        &.start-button {
            background: green;

        }

        &.leave-button {
            background: red;

        }
    }
`;

export const StyledPlayersSection = styled.div`
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 25px;
    flex: 1;
    min-height: 0;

    .empty-message {
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        font-size: 1rem;
        margin-top: 20px;
    }
`;

export const StyledPlayersList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex: 1;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;


    &::before {
        font-size: 1.2rem;
    }
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

export const StyledPlayerStatus = styled.div`
    padding: 5px 10px;
    border-radius: 8px;
    background-color: ${props => props.$isOwner ? 'gold' : 'silver'};
    color: black;
    font-weight: bold;
    font-size: 0.9rem;
`;

export const StyledGameModeSection = styled.div`
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 15px;

    h3 {
        color: white;
        font-size: 1.3rem;
        margin-bottom: 15px;
        text-align: center;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    }
`;

export const StyledGameModeOptions = styled.div`
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
`;

export const StyledRadioLabel = styled.label`
    position: relative;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? '0.5' : '1'};
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: ${props => props.checked ?
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
        'rgba(255, 255, 255, 0.1)'};
    border: 2px solid ${props => props.checked ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
    border-radius: 10px;
    transition: all 0.3s ease;
    box-shadow: ${props => props.checked ?
        '0 4px 15px rgba(102, 126, 234, 0.4)' :
        '0 2px 8px rgba(0, 0, 0, 0.2)'};
    transform: ${props => props.checked ? 'scale(1.05)' : 'scale(1)'};

    &:hover {
        background: ${props => props.checked ?
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
        'rgba(255, 255, 255, 0.15)'};
        border-color: ${props => props.checked ? '#667eea' : 'rgba(255, 255, 255, 0.4)'};
        transform: ${props => props.disabled ? 'scale(1)' : 'scale(1.05)'};
    }

    input[type="radio"] {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border: 2px solid ${props => props.checked ? '#fff' : 'rgba(255, 255, 255, 0.5)'};
        border-radius: 50%;
        outline: none;
        cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
        position: relative;
        background: transparent;
        transition: all 0.3s ease;

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(${props => props.checked ? '1' : '0'});
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: white;
            transition: transform 0.2s ease;
        }
    }

    span {
        color: white;
        font-size: 1rem;
        font-weight: ${props => props.checked ? '700' : '500'};
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
`;