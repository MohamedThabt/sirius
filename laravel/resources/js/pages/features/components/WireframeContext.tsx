import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { type WireframeMode, getStyles, type WireframeStyleConfig } from './wireframe-styles';

interface WireframeContextValue {
    // Display mode
    mode: WireframeMode;
    setMode: (mode: WireframeMode) => void;
    toggleMode: () => void;
    
    // Selection state
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    onSelectNode: (id: string) => void;
    
    // Styles based on current mode
    styles: WireframeStyleConfig;
    
    // Hover state for interactive elements
    hoveredNodeId: string | null;
    setHoveredNodeId: (id: string | null) => void;
}

const WireframeContext = createContext<WireframeContextValue | null>(null);

// Local storage key for persisting mode preference
const MODE_STORAGE_KEY = 'wireframe-fidelity-mode';

interface WireframeProviderProps {
    children: ReactNode;
    initialMode?: WireframeMode;
    initialSelectedNodeId?: string | null;
    onSelectionChange?: (id: string | null) => void;
}

export function WireframeProvider({
    children,
    initialMode,
    initialSelectedNodeId = null,
    onSelectionChange,
}: WireframeProviderProps) {
    // Initialize mode from localStorage or prop
    const [mode, setModeState] = useState<WireframeMode>(() => {
        if (initialMode) return initialMode;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(MODE_STORAGE_KEY);
            if (stored === 'preview' || stored === 'wireframe') {
                return stored;
            }
        }
        return 'wireframe';
    });

    const [selectedNodeId, setSelectedNodeIdState] = useState<string | null>(initialSelectedNodeId);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Persist mode to localStorage
    const setMode = useCallback((newMode: WireframeMode) => {
        setModeState(newMode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(MODE_STORAGE_KEY, newMode);
        }
    }, []);

    const toggleMode = useCallback(() => {
        setMode(mode === 'wireframe' ? 'preview' : 'wireframe');
    }, [mode, setMode]);

    const setSelectedNodeId = useCallback((id: string | null) => {
        setSelectedNodeIdState(id);
        onSelectionChange?.(id);
    }, [onSelectionChange]);

    const onSelectNode = useCallback((id: string) => {
        setSelectedNodeId(id);
    }, [setSelectedNodeId]);

    const styles = useMemo(() => getStyles(mode), [mode]);

    const value = useMemo<WireframeContextValue>(() => ({
        mode,
        setMode,
        toggleMode,
        selectedNodeId,
        setSelectedNodeId,
        onSelectNode,
        styles,
        hoveredNodeId,
        setHoveredNodeId,
    }), [
        mode,
        setMode,
        toggleMode,
        selectedNodeId,
        setSelectedNodeId,
        onSelectNode,
        styles,
        hoveredNodeId,
    ]);

    return (
        <WireframeContext.Provider value={value}>
            {children}
        </WireframeContext.Provider>
    );
}

export function useWireframe(): WireframeContextValue {
    const context = useContext(WireframeContext);
    if (!context) {
        throw new Error('useWireframe must be used within a WireframeProvider');
    }
    return context;
}

// Optional hook for components that might be outside provider
export function useWireframeOptional(): WireframeContextValue | null {
    return useContext(WireframeContext);
}

// Hook for node-specific selection state
export function useNodeSelection(nodeId: string) {
    const { selectedNodeId, onSelectNode, hoveredNodeId, setHoveredNodeId } = useWireframe();
    
    const isSelected = selectedNodeId === nodeId;
    const isHovered = hoveredNodeId === nodeId;
    
    const handleSelect = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectNode(nodeId);
    }, [nodeId, onSelectNode]);
    
    const handleMouseEnter = useCallback(() => {
        setHoveredNodeId(nodeId);
    }, [nodeId, setHoveredNodeId]);
    
    const handleMouseLeave = useCallback(() => {
        setHoveredNodeId(null);
    }, [setHoveredNodeId]);
    
    return {
        isSelected,
        isHovered,
        handleSelect,
        handleMouseEnter,
        handleMouseLeave,
    };
}
