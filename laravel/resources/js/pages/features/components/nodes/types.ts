export interface BaseNodeProps {
    node: any;
    selectedNodeId?: string | null;
    onSelectNode?: (id: string) => void;
}

export const useSelection = (node: any, selectedNodeId?: string | null) => {
    const isSelected = node?.id === selectedNodeId;
    const selectionStyle: React.CSSProperties = isSelected ? { outline: '2px solid #3b82f6', boxShadow: '0 0 0 4px rgba(59,130,246,0.15)' } : {};
    return { isSelected, selectionStyle };
};

export const baseBorder = () => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
        return '1px solid rgba(148,163,184,.35)';
    }
    return '#cbd5e1 1px solid';
};
