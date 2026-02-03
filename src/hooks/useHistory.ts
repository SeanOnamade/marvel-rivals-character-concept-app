import { useState, useCallback } from 'react';

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

export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        setHistory((currentHistory) => {
            const resolvedState = typeof newState === 'function' 
                ? (newState as (prev: T) => T)(currentHistory.present)
                : newState;

            // Don't add to history if state hasn't changed
            if (JSON.stringify(resolvedState) === JSON.stringify(currentHistory.present)) {
                return currentHistory;
            }

            // Limit history size
            const newPast = [...currentHistory.past, currentHistory.present].slice(-MAX_HISTORY_SIZE);

            return {
                past: newPast,
                present: resolvedState,
                future: [], // Clear future on new change
            };
        });
    }, []);

    const undo = useCallback(() => {
        setHistory((currentHistory) => {
            if (currentHistory.past.length === 0) {
                return currentHistory;
            }

            const previous = currentHistory.past[currentHistory.past.length - 1];
            const newPast = currentHistory.past.slice(0, -1);

            return {
                past: newPast,
                present: previous,
                future: [currentHistory.present, ...currentHistory.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((currentHistory) => {
            if (currentHistory.future.length === 0) {
                return currentHistory;
            }

            const next = currentHistory.future[0];
            const newFuture = currentHistory.future.slice(1);

            return {
                past: [...currentHistory.past, currentHistory.present],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory((currentHistory) => ({
            past: [],
            present: currentHistory.present,
            future: [],
        }));
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
