import { C4Diagram, validateC4Diagram } from '@/utils/c4Validator';
import { useCallback, useEffect, useState } from 'react';

interface UseC4ParserResult {
    c4Diagram: C4Diagram | null;
    error: string | null;
    isLoading: boolean;
    warnings: string[] | undefined;
}

export const useC4Parser = (jsonInput: string): UseC4ParserResult => {
    const [c4Diagram, setC4Diagram] = useState<C4Diagram | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [warnings, setWarnings] = useState<string[] | undefined>(undefined);

    const parseC4Diagram = useCallback(async () => {
        if (!jsonInput.trim()) {
            setC4Diagram(null);
            setError(null);
            setWarnings(undefined);
            return;
        }

        setIsLoading(true);
        setError(null);
        setWarnings(undefined);

        try {
            const validation = validateC4Diagram(jsonInput);

            if (validation.isValid && validation.data) {
                setC4Diagram(validation.data);
                setError(null);
                setWarnings(validation.warnings);
            } else {
                setC4Diagram(null);
                setError(validation.error || 'Invalid C4 diagram format');
                setWarnings(undefined);
            }
        } catch (e) {
            setC4Diagram(null);
            setError('An unexpected error occurred while parsing the diagram.');
            setWarnings(undefined);
        } finally {
            setIsLoading(false);
        }
    }, [jsonInput]);

    // Real-time parsing with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            parseC4Diagram();
        }, 300); // Debounced for real-time editing

        return () => clearTimeout(timeoutId);
    }, [parseC4Diagram]);

    return {
        c4Diagram,
        error,
        isLoading,
        warnings,
    };
};
