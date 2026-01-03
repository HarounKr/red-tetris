import styled from 'styled-components';

export const StyledNextPiece = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 0 20px 0;
    padding: 15px;
    border: 4px solid #333;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    min-height: 120px;
    
    .title {
        font-family: Pixel, Arial, Helvetica, sans-serif;
        font-size: 1.2rem;
        color: #fff;
        margin-bottom: 10px;
        text-align: center;
    }
    
    .preview-grid {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
    }
    
    .preview-row {
        display: flex;
        gap: 2px;
    }
    
    .preview-cell {
        width: 15px;
        height: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        
        &.filled {
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 3px rgba(255, 255, 255, 0.2);
        }
    }
`;
