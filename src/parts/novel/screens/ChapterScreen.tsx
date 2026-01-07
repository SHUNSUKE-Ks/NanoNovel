// ============================================
// NanoNovel - Chapter Screen
// ============================================

import { useEffect } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import './ChapterScreen.css';

interface ChapterScreenProps {
    chapterNumber?: number;
    title?: string;
    description?: string;
}

export function ChapterScreen({
    chapterNumber = 1,
    title = "目覚め",
    description = "深い森の中、記憶を失った若者の物語が始まる。"
}: ChapterScreenProps) {
    const setScreen = useGameStore((state) => state.setScreen);

    useEffect(() => {
        // Auto-transition after 3 seconds
        const timer = setTimeout(() => {
            setScreen('NOVEL');
        }, 3000);

        return () => clearTimeout(timer);
    }, [setScreen]);

    const handleSkip = () => {
        setScreen('NOVEL');
    };

    return (
        <div className="chapter-screen">
            <div className="chapter-content">
                <p className="chapter-number">Chapter {chapterNumber}</p>
                <h1 className="chapter-title">{title}</h1>
                <p className="chapter-description">{description}</p>
            </div>

            <span className="chapter-skip" onClick={handleSkip}>
                Skip ▶
            </span>
        </div>
    );
}
