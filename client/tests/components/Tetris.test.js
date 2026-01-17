
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import Tetris from '../../src/components/Tetris'


vi.mock('../../src/components/Spectrums', () => ({
    default: () => <div data-testid="spectrums" />
}));

const mySocket = {
    id: 1,
    connected: false,
    on: () => {},
    off: () => {},
    emit: () => {},
};

 const renderComponent = () => {
        return render(
            // simuler le navigateur : URL simulée = /room/player
            // useLocation().state = { tetrominoSequence: ['I','O','I'] }
            <MemoryRouter
                initialEntries={[
                {
                    pathname: '/room/player',
                    state: { tetrominoSequence: ['I', 'O', 'I'] },
                },
                ]}
            >
                <Routes>
                    <Route
                        path="/:room/:player"
                        element={<Tetris socket={mySocket} selectedGravity="Standard" />}
                    />
                </Routes>
            </MemoryRouter>
        );
}

describe('Tetris', () => {
    it('vérifier quand l accès n est pas autorisé', () => {
        render(
            <MemoryRouter initialEntries={['/room/test']}>
                <Routes>
                    <Route path="/:room/:player" element={<Tetris socket={0} selectedGravity={1000} />} />
                </Routes>
            </MemoryRouter>
        );

    const checkingAccess = screen.getByText(/checking access/i);
    expect(checkingAccess).toBeTruthy();

   });

   it('vérifier que le jeu s affiche quand l accès est autorisé (début de partie)', () => {
        renderComponent();
        const tetrisWrapper = screen.getByTestId('testris-wrapper');
        expect(tetrisWrapper).toBeTruthy();
    });

});
