// ============================================
// NanoNovel - useScenario Hook
// ============================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGameStore } from '@/core/stores/gameStore';
import scenarioData from '@/data/novel/scenario.json';
import type { Story, Choice } from '@/core/types';

// Type assertion
const scenarios = scenarioData as Story[];

interface LogEntry {
    storyID: string;
    speaker: string;
    text: string;
}

export function useScenario() {
    const { currentStoryID, setStoryID, setFlag, addItem, setScreen } = useGameStore();
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Current story
    const currentStory = useMemo(() => {
        return scenarios.find(s => s.storyID === currentStoryID) || scenarios[0];
    }, [currentStoryID]);

    // Current index
    const currentIndex = useMemo(() => {
        return scenarios.findIndex(s => s.storyID === currentStoryID);
    }, [currentStoryID]);

    // Next story
    const nextStory = useMemo(() => {
        return scenarios[currentIndex + 1];
    }, [currentIndex]);

    // Has choices
    const hasChoices = useMemo(() => {
        return currentStory?.event.type === 'CHOICE' &&
            currentStory.event.payload.choices &&
            currentStory.event.payload.choices.length > 0;
    }, [currentStory]);

    // Choices
    const choices = useMemo(() => {
        if (hasChoices) {
            return currentStory?.event.payload.choices as Choice[];
        }
        return [];
    }, [currentStory, hasChoices]);

    // Progress
    const progress = useMemo(() => {
        if (scenarios.length === 0) return 0;
        return Math.round((currentIndex / (scenarios.length - 1)) * 100);
    }, [currentIndex]);

    // Add to log
    useEffect(() => {
        if (currentStory) {
            setLogs(prev => {
                if (prev.some(log => log.storyID === currentStory.storyID)) {
                    return prev;
                }
                return [...prev, {
                    storyID: currentStory.storyID,
                    speaker: currentStory.speaker,
                    text: currentStory.text
                }];
            });
        }
    }, [currentStory]);

    // Advance to next story
    const advance = useCallback(() => {
        if (!currentStory) return false;

        // Don't advance on choices
        if (currentStory.event.type === 'CHOICE') {
            return false;
        }

        // Apply flags
        Object.entries(currentStory.flags).forEach(([key, value]) => {
            setFlag(key, value);
        });

        // Handle ITEM event
        if (currentStory.event.type === 'ITEM' && currentStory.event.payload.itemID) {
            addItem(currentStory.event.payload.itemID, currentStory.event.payload.count || 1);
        }

        // Handle JUMP event
        if (currentStory.event.type === 'JUMP' && currentStory.event.payload.nextStoryID) {
            setStoryID(currentStory.event.payload.nextStoryID);
            return true;
        }

        // Handle BATTLE event
        if (currentStory.event.type === 'BATTLE') {
            setScreen('BATTLE');
            return true;
        }

        // Move to next story
        if (nextStory) {
            setStoryID(nextStory.storyID);
            return true;
        }

        return false;
    }, [currentStory, nextStory, setStoryID, setFlag, addItem, setScreen]);

    // Select choice
    const selectChoice = useCallback((nextStoryID: string) => {
        setStoryID(nextStoryID);
    }, [setStoryID]);

    // Reset logs
    const resetLogs = useCallback(() => {
        setLogs([]);
    }, []);

    return {
        // State
        currentStory,
        currentIndex,
        hasChoices,
        choices,
        progress,
        logs,

        // Actions
        advance,
        selectChoice,
        resetLogs,

        // Utilities
        totalCount: scenarios.length,
    };
}
