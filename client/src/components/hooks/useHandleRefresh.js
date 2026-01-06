import { useEffect } from 'react'

export const useHandleRefresh = ({dropTime, leaveGame}) => {
    useEffect(() => {
        if (!dropTime)
            return;

        const handleBeforeUnload = () => {
            leaveGame();
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        return (() => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        })

    }, [dropTime]);
}