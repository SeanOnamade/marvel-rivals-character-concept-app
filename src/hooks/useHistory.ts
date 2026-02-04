import { useState, useCallback, useRef, useEffect } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseHistoryReturn<T> {
    state: T;
    setState: (newState: T | ((prev: T) => T)) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_MS = 500; // Group changes within 500ms into single undo step

export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });
    
    // Track the last saved state (what's in history.past) for debouncing
    const lastSavedStateRef = useRef<T>(initialState);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track a version number that increments on undo/redo to invalidate stale timeouts
    const historyVersionRef = useRef(0);
    
    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        setHistory((currentHistory) => {
            const resolvedState = typeof newState === 'function' 
                ? (newState as (prev: T) => T)(currentHistory.present)
                : newState;

            // Don't update if state hasn't changed
            if (JSON.stringify(resolvedState) === JSON.stringify(currentHistory.present)) {
                return currentHistory;
            }

            // Clear any pending debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            
            // Check if this is the first change since last save
            const isFirstChange = JSON.stringify(currentHistory.present) === JSON.stringify(lastSavedStateRef.current);
            
            // Capture current version to check if undo/redo happened before timeout fires
            const versionAtSchedule = historyVersionRef.current;
            
            // Schedule saving to history after debounce period
            debounceTimerRef.current = setTimeout(() => {
                // Only update if no undo/redo happened since this was scheduled
                if (historyVersionRef.current === versionAtSchedule) {
                    lastSavedStateRef.current = resolvedState;
                }
            }, DEBOUNCE_MS);
            
            // If this is the first change, we need to save the previous state to history
            if (isFirstChange) {
                const newPast = [...currentHistory.past, currentHistory.present].slice(-MAX_HISTORY_SIZE);
                return {
                    past: newPast,
                    present: resolvedState,
                    future: [], // Clear future on new change
                };
            }
            
            // Otherwise, just update present without adding to history (debounced)
            return {
                ...currentHistory,
                present: resolvedState,
                future: [], // Still clear future
            };
        });
    }, []);

    const undo = useCallback(() => {
        // Clear any pending debounce when undoing
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        
        // Increment version to invalidate any pending timeouts
        historyVersionRef.current += 1;
        
        setHistory((currentHistory) => {
            if (currentHistory.past.length === 0) {
                return currentHistory;
            }

            const previous = currentHistory.past[currentHistory.past.length - 1];
            const newPast = currentHistory.past.slice(0, -1);
            
            // Update the saved state ref
            lastSavedStateRef.current = previous;

            return {
                past: newPast,
                present: previous,
                future: [currentHistory.present, ...currentHistory.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        // Clear any pending debounce when redoing
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        
        // Increment version to invalidate any pending timeouts
        historyVersionRef.current += 1;
        
        setHistory((currentHistory) => {
            if (currentHistory.future.length === 0) {
                return currentHistory;
            }

            const next = currentHistory.future[0];
            const newFuture = currentHistory.future.slice(1);
            
            // Update the saved state ref
            lastSavedStateRef.current = next;

            return {
                past: [...currentHistory.past, currentHistory.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const clearHistory = useCallback(() => {
        // Clear any pending debounce
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        
        setHistory((currentHistory) => {
            lastSavedStateRef.current = currentHistory.present;
            return {
                past: [],
                present: currentHistory.present,
                future: [],
            };
        });
    }, []);

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        clearHistory,
    };
}
