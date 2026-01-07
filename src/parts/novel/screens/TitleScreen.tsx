// ============================================
// NanoNovel - Title Screen
// ============================================

import { useGameStore } from '@/core/stores/gameStore';
import './TitleScreen.css';

export function TitleScreen() {
    const setScreen = useGameStore((state) => state.setScreen);
    const resetGame = useGameStore((state) => state.resetGame);

    const handleNewGame = () => {
        resetGame();
        setScreen('CHAPTER');
    };

    const handleContinue = () => {
        // TODO: Load save data
        setScreen('NOVEL');
    };

    return (
        <div className="title-screen">
            <div className="title-decoration title-decoration-top" />

            <div className="title-content">
                <div className="title-logo">
                    {/* Logo placeholder */}
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="35" stroke="#c9a227" strokeWidth="2" fill="none" />
                        <path d="M40 15 L55 45 L40 65 L25 45 Z" fill="#c9a227" opacity="0.8" />
                    </svg>
                </div>

                <h1 className="title-main">NanoNovel</h1>
                <p className="title-subtitle">AI駆動ノベルゲーム</p>

                <div className="title-menu">
                    <button
                        className="btn btn-primary btn-start"
                        onClick={handleNewGame}
                    >
                        New Game
                    </button>
                    <button
                        className="btn"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                    <button className="btn">
                        Settings
                    </button>
                </div>
            </div>

            <div className="title-decoration title-decoration-bottom" />

            <footer className="title-footer">
                © 2026 NanoNovel Project
            </footer>
        </div>
    );
}
