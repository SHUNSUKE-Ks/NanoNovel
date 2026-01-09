// ============================================
// NanoNovel - Save/Load Modal Component
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
    SaveManager,
    type SaveSlotInfo,
    type SaveData
} from '@/core/managers/SaveManager';
import { useGameStore } from '@/core/stores/gameStore';
import './SaveLoadModal.css';

type ModalMode = 'save' | 'load';

interface SaveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: ModalMode;
}

export function SaveLoadModal({
    isOpen,
    onClose,
    initialMode = 'save'
}: SaveLoadModalProps) {
    const [mode, setMode] = useState<ModalMode>(initialMode);
    const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
    const [confirmSlot, setConfirmSlot] = useState<number | null>(null);
    const [confirmAction, setConfirmAction] = useState<'overwrite' | 'delete' | null>(null);

    // Game state
    const { currentStoryID, flags, inventory, setStoryID } = useGameStore();
    const [playTime] = useState(0);

    // Load slot info
    const refreshSlots = useCallback(() => {
        setSlots(SaveManager.listSaves());
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshSlots();
            setMode(initialMode);
        }
    }, [isOpen, initialMode, refreshSlots]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (confirmSlot !== null) {
                    setConfirmSlot(null);
                    setConfirmAction(null);
                } else if (isOpen) {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, confirmSlot]);

    // Save to slot
    const handleSave = (slot: number) => {
        const slotInfo = slots[slot];

        if (!slotInfo.isEmpty) {
            setConfirmSlot(slot);
            setConfirmAction('overwrite');
            return;
        }

        executeSave(slot);
    };

    const executeSave = (slot: number) => {
        const saveData: SaveData = {
            storyID: currentStoryID,
            flags: flags as Record<string, unknown>,
            inventory,
            playTime,
            savedAt: new Date().toISOString(),
            chapterTitle: 'Chapter 1',
        };

        const success = SaveManager.save(slot, saveData);
        if (success) {
            refreshSlots();
            setConfirmSlot(null);
            setConfirmAction(null);
        }
    };

    // Load from slot
    const handleLoad = (slot: number) => {
        const data = SaveManager.load(slot);
        if (!data) return;

        setStoryID(data.storyID);
        Object.entries(data.flags).forEach(([key, value]) => {
            useGameStore.getState().setFlag(key, value);
        });

        onClose();
    };

    // Delete save
    const handleDeleteClick = (slot: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmSlot(slot);
        setConfirmAction('delete');
    };

    const executeDelete = (slot: number) => {
        SaveManager.delete(slot);
        refreshSlots();
        setConfirmSlot(null);
        setConfirmAction(null);
    };

    const cancelConfirm = () => {
        setConfirmSlot(null);
        setConfirmAction(null);
    };

    if (!isOpen) return null;

    return (
        <div className="save-load-overlay" onClick={onClose}>
            <div className="save-load-modal" onClick={(e) => e.stopPropagation()}>
                <header className="save-load-header">
                    <h2 className="save-load-title">
                        {mode === 'save' ? 'Save Game' : 'Load Game'}
                    </h2>
                    <button className="save-load-close" onClick={onClose}>
                        ✕
                    </button>
                </header>

                <div className="save-load-tabs">
                    <button
                        className={`save-load-tab ${mode === 'save' ? 'active' : ''}`}
                        onClick={() => setMode('save')}
                    >
                        Save
                    </button>
                    <button
                        className={`save-load-tab ${mode === 'load' ? 'active' : ''}`}
                        onClick={() => setMode('load')}
                    >
                        Load
                    </button>
                </div>

                <div className="save-load-content">
                    {slots.map((slot) => (
                        <div
                            key={slot.slot}
                            className="save-slot"
                            onClick={() => mode === 'save'
                                ? handleSave(slot.slot)
                                : !slot.isEmpty && handleLoad(slot.slot)
                            }
                            style={{
                                cursor: mode === 'load' && slot.isEmpty ? 'not-allowed' : 'pointer',
                                opacity: mode === 'load' && slot.isEmpty ? 0.5 : 1,
                            }}
                        >
                            <div className="save-slot-number">
                                {slot.slot + 1}
                            </div>

                            <div className="save-slot-info">
                                {slot.isEmpty ? (
                                    <span className="save-slot-empty">
                                        {mode === 'save' ? 'Empty Slot' : 'No Data'}
                                    </span>
                                ) : (
                                    <>
                                        <div className="save-slot-title">
                                            {slot.data?.chapterTitle || 'Chapter 1'}
                                        </div>
                                        <div className="save-slot-meta">
                                            {SaveManager.formatDate(slot.data!.savedAt)} • {SaveManager.formatPlayTime(slot.data!.playTime)}
                                        </div>
                                    </>
                                )}
                            </div>

                            {!slot.isEmpty && (
                                <div className="save-slot-actions">
                                    <button
                                        className="save-slot-delete"
                                        onClick={(e) => handleDeleteClick(slot.slot, e)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {confirmSlot !== null && (
                    <div className="save-confirm-overlay">
                        <div className="save-confirm-dialog">
                            <p className="save-confirm-text">
                                {confirmAction === 'overwrite'
                                    ? 'Overwrite this save?'
                                    : 'Delete this save?'
                                }
                            </p>
                            <div className="save-confirm-buttons">
                                <button
                                    className="save-confirm-btn confirm"
                                    onClick={() => confirmAction === 'overwrite'
                                        ? executeSave(confirmSlot)
                                        : executeDelete(confirmSlot)
                                    }
                                >
                                    {confirmAction === 'overwrite' ? 'Overwrite' : 'Delete'}
                                </button>
                                <button
                                    className="save-confirm-btn cancel"
                                    onClick={cancelConfirm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
