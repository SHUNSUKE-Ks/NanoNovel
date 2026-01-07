// ============================================
// NanoNovel - Novel Screen (Refactored with useScenario)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import { useScenario } from '@/core/hooks';
import { ChatLog } from '../components/ChatLog';
import './NovelScreen.css';

export function NovelScreen() {
    const setScreen = useGameStore((state) => state.setScreen);

    // Use the scenario hook
    const {
        currentStory,
        hasChoices,
        choices,
        progress,
        logs,
        advance,
        selectChoice,
    } = useScenario();

    // UI State
    const [isAuto, setIsAuto] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const autoTimerRef = useRef<number | null>(null);

    // Auto-play effect
    useEffect(() => {
        if (isAuto && currentStory && !hasChoices) {
            autoTimerRef.current = window.setTimeout(() => {
                const advanced = advance();
                if (!advanced) {
                    setIsAuto(false);
                }
            }, 2500);
        }

        return () => {
            if (autoTimerRef.current) {
                clearTimeout(autoTimerRef.current);
            }
        };
    }, [isAuto, currentStory, hasChoices, advance]);

    // Stop auto on choices
    useEffect(() => {
        if (hasChoices) {
            setIsAuto(false);
        }
    }, [hasChoices]);

    // Handle click to advance
    const handleAdvance = () => {
        if (hasChoices) return;
        advance();
    };

    // Handle choice selection
    const handleChoice = (nextStoryID: string) => {
        selectChoice(nextStoryID);
    };

    // Handle back to title
    const handleBackToTitle = () => {
        setScreen('TITLE');
    };

    // Toggle auto mode
    const toggleAuto = () => {
        setIsAuto(prev => !prev);
    };

    if (!currentStory) {
        return <div className="novel-screen">Loading...</div>;
    }

    return (
        <div className="novel-screen">
            {/* Header */}
            <header className="novel-header">
                <div className="novel-header-left">
                    <button
                        className="novel-header-btn"
                        onClick={() => setIsLogOpen(true)}
                    >
                        Log
                    </button>
                    <span className="novel-progress">{progress}%</span>
                </div>
                <div className="novel-header-right">
                    <button
                        className={`novel-header-btn ${isAuto ? 'active' : ''}`}
                        onClick={toggleAuto}
                    >
                        Auto {isAuto && '●'}
                    </button>
                    <button className="novel-header-btn">Skip</button>
                    <button className="novel-header-btn" onClick={handleBackToTitle}>
                        Menu
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="novel-main">
                {/* Background */}
                <div className="novel-background">
                    <div className="novel-background-placeholder">
                        {currentStory.tags.find(t => t.startsWith('bg_')) || '背景画像'}
                    </div>
                </div>

                {/* Character */}
                {currentStory.tags.some(t => t.startsWith('chara_')) && (
                    <div className="novel-character">
                        <div className="novel-character-placeholder">
                            {currentStory.tags.find(t => t.startsWith('chara_')) || 'キャラクター'}
                        </div>
                    </div>
                )}
            </main>

            {/* Dialog Box */}
            <div className="novel-dialog">
                <div
                    className="novel-dialog-box"
                    onClick={hasChoices ? undefined : handleAdvance}
                >
                    <p className="novel-speaker">{currentStory.speaker}</p>
                    <p className="novel-text">{currentStory.text}</p>

                    {/* Choices */}
                    {hasChoices && (
                        <div className="novel-choices">
                            {choices.map((choice, index) => (
                                <button
                                    key={index}
                                    className="novel-choice-btn"
                                    onClick={() => handleChoice(choice.nextStoryID)}
                                >
                                    ▸ {choice.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Advance indicator */}
                    {!hasChoices && (
                        <span className="novel-indicator">▼</span>
                    )}
                </div>
            </div>

            {/* Chat Log Modal */}
            <ChatLog
                logs={logs}
                isOpen={isLogOpen}
                onClose={() => setIsLogOpen(false)}
            />
        </div>
    );
}
