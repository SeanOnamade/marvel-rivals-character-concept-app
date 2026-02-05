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
    
    // Track pending state for debounce
    const pendingStateRef = useRef<T>(initialState);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Flag to track if we're in the middle of a debounce window
    const isInDebounceWindowRef = useRef(false);
    
    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        // Capture the debounce state BEFORE the setHistory callback
        // This avoids issues with React StrictMode double-invoking the callback
        const wasInDebounceWindow = isInDebounceWindowRef.current;
        
        // Immediately mark that we're in a debounce window
        // (will be set back to false by timer if no more changes come)
        isInDebounceWindowRef.current = true;
        
        setHistory((currentHistory) => {
            const resolvedState = typeof newState === 'function' 
                ? (newState as (prev: T) => T)(currentHistory.present)
                : newState;

            // Don't update if state hasn't changed
            if (JSON.stringify(resolvedState) === JSON.stringify(currentHistory.present)) {
                return currentHistory;
            }

            // Check if this is the first change since last commit
            const isFirstChange = !wasInDebounceWindow;
            
            // If this is the first change, we need to save the current state to history
            if (isFirstChange) {
                const newPast = [...currentHistory.past, currentHistory.present].slice(-MAX_HISTORY_SIZE);
                pendingStateRef.current = resolvedState;
                return {
                    past: newPast,
                    present: resolvedState,
                    future: [], // Clear future on new change
                };
            }
            
            // Otherwise, just update present without adding to history (still in debounce window)
            pendingStateRef.current = resolvedState;
            return {
                ...currentHistory,
                present: resolvedState,
                future: [], // Still clear future
            };
        });
        
        // Manage debounce timer outside of setState callback
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            // End debounce window - next change will be a new undo step
            isInDebounceWindowRef.current = false;
            debounceTimerRef.current = null;
        }, DEBOUNCE_MS);
    }, []);

    const undo = useCallback(() => {
        // Clear any pending debounce when undoing
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        isInDebounceWindowRef.current = false;
        
        setHistory((currentHistory) => {
            if (currentHistory.past.length === 0) {
                return currentHistory;
            }

            const previous = currentHistory.past[currentHistory.past.length - 1];
            const newPast = currentHistory.past.slice(0, -1);
            
            pendingStateRef.current = previous;

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
        isInDebounceWindowRef.current = false;
        
        setHistory((currentHistory) => {
            if (currentHistory.future.length === 0) {
                return currentHistory;
            }

            const next = currentHistory.future[0];
            const newFuture = currentHistory.future.slice(1);
            
            pendingStateRef.current = next;

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
        isInDebounceWindowRef.current = false;
        
        setHistory((currentHistory) => {
            pendingStateRef.current = currentHistory.present;
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
