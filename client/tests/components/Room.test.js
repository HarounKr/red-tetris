import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import Room from '../../src/Pages/Room'

describe('Room', () => {
    it('Tester l affichage des textes principaux', () => {
        const socket = { 
            id: 1,
            connected: false,
            on: () => {},
            off: () => {},
            emit: () => {},
        }
        const selectedGravity = 'Standard';
        const setSelectedGravity = vi.fn();

        render(
                <MemoryRouter
                    initialEntries={[
                    {
                        pathname: '/room',
                    },]}
                >
                    <Routes>
                        <Route
                            path="/:room"
                            element={<Room socket={socket} selectedGravity={selectedGravity} setSelectedGravity={setSelectedGravity} />}
                        />
                    </Routes>
                </MemoryRouter >
            )
        
        expect(screen.getByText(/room:/i)).toBeTruthy();
        expect(screen.getByText(/game mode/i)).toBeTruthy();
        expect(screen.getByText(/players in room/i)).toBeTruthy();
        expect(screen.getByText(/waiting for players/i)).toBeTruthy();
            
    })
})
