import { describe, expect, it, vi } from 'vitest'
import { render, screen, within, logRoles } from '@testing-library/react'
import Scoreboard from '../../src/components/Scoreboard'
import userEvent from '@testing-library/user-event'


describe('Test du Scoreboard', () => {
    const scores = [ 
        { name: 'Haroun', socketId: 1, score: 50, rows: 3, level: 1},
        { name: 'Wanis', socketId: 2, score: 40, rows: 4, level: 1},

    
    ]

    it('Test du tableau des scores', () => {
        const { rerender, container } = render(<Scoreboard
                    scores={scores}
                    mySocketId={1}
                    onClose={() => {}}
                    onRestart={() => {}}
                    isOwner={false}
                />)

        const heading = screen.getByRole('heading');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/tableau des scores/i);

        expect(screen.getByText(/vous avez gagné/i)).toBeInTheDocument();

        rerender(<Scoreboard
                    scores={scores}
                    mySocketId={2}
                    onClose={() => {}}
                    onRestart={() => {}}
                    isOwner={true}
                />)

        expect(screen.getByText(/vous avez perdu/i)).toBeInTheDocument();
        //screen.debug()
        //logRoles(container)
        
        const rowgroup = screen.getAllByRole('rowgroup');
        const tbody = rowgroup[1];
        const rows = within(tbody).getAllByRole('row');
        expect(rows).toHaveLength(2);

        expect(rows[0]).toHaveClass('winner');
        expect(within(rows[0]).getByText('Haroun')).toBeTruthy();
        expect(within(rows[0]).getByText('50')).toBeTruthy();
        expect(within(rows[0]).getByText('3')).toBeTruthy();

        expect(rows[1]).toHaveClass('loser');
        expect(within(rows[1]).getByText('Wanis (vous)'));
        expect(within(rows[1]).getByText('40')).toBeTruthy();
        expect(within(rows[1]).getByText('4')).toBeTruthy();
        expect(within(rows[1]).getByText('1')).toBeTruthy();

    })

    it('Test des boutons', async () => {

        const user = userEvent.setup();
        const onClose = vi.fn();
        const onRestart = vi.fn();

        const { container } = render(<Scoreboard
                    scores={scores}
                    mySocketId={2}
                    onClose={onClose}
                    onRestart={onRestart}
                    isOwner={true}
                />)

       // logRoles(container)

        const restartButton = screen.getByRole('button', { name: /rejouer/i });
        const backButton = screen.getByRole('button', { name: /retour au lobby/i})

        await user.click(restartButton);
        await user.click(backButton);

        expect(onRestart).toHaveBeenCalledTimes(1)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

})