import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxOption {
    value: string;
    label: string;
}

interface CheckboxGridProps {
    options: CheckboxOption[];
    selected: string[];
    onToggle: (value: string, checked: boolean) => void;
    idPrefix?: string;
}

/**
 * Reusable checkbox grid component for multi-select options.
 * Extracted from Prepare.tsx where this pattern was repeated 6+ times.
 * 
 * WHY: Each checkbox grid in Prepare.tsx was ~20 lines of identical JSX.
 * This reduces ~120 lines to simple component usage.
 */
export function CheckboxGrid({ options, selected, onToggle, idPrefix = '' }: CheckboxGridProps) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((option) => {
                const inputId = idPrefix ? `${idPrefix}_${option.value}` : option.value;
                return (
                    <div
                        key={option.value}
                        className="flex items-center space-x-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                    >
                        <Checkbox
                            id={inputId}
                            checked={selected.includes(option.value)}
                            onCheckedChange={(checked) => onToggle(option.value, checked as boolean)}
                        />
                        <label htmlFor={inputId} className="flex-1 cursor-pointer text-sm font-medium">
                            {option.label}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

export default CheckboxGrid;
