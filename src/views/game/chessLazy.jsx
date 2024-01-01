import { useEffect } from 'react';
import Chess from './Chess';

const ChessContainer = ({ isAuthenticated, isAdmin }) => {
    useEffect(() => {
        const loadChessboard = async () => {
            try {
                // Dynamically load chessboard-1.0.0.min.js
                const chessboardModule = await import('../../core/chess/chessboard-1.0.0.min.js');

                // Dynamically load bundle.js
                const bundleModule = await import('../../core/chess/bundle.js');
            } catch (error) {
                console.error('Error loading chessboard or bundle:', error);
            }
        };

        loadChessboard();
    }, []);

    return <Chess isAuthenticated={isAuthenticated} isAdmin={isAdmin} />;
};

export default ChessContainer;