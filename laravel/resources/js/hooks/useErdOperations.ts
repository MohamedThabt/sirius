import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface UseErdOperationsOptions {
    projectId: number;
    moduleId: number;
}

interface UseErdOperationsReturn {
    isSyncing: boolean;
    syncErd: () => void;
}

/**
 * WHY: Extracted from ModuleShow.tsx and DatabaseDesigner.tsx to eliminate duplication.
 * Both components had the same ERD sync logic with identical Inertia router calls.
 * 
 * This hook encapsulates the ERD sync operation with proper loading state management.
 * 
 * Usage:
 * const { isSyncing, syncErd } = useErdOperations({ projectId: project.id, moduleId: module.id });
 */
export function useErdOperations({ projectId, moduleId }: UseErdOperationsOptions): UseErdOperationsReturn {
    const [isSyncing, setIsSyncing] = useState(false);

    const syncErd = useCallback(() => {
        setIsSyncing(true);
        router.post(
            `/projects/${projectId}/modules/${moduleId}/erd/sync`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Module ERD synced successfully from features!');
                },
                onError: () => {
                    toast.error('Failed to sync ERD. Please try again.');
                },
                onFinish: () => {
                    setIsSyncing(false);
                },
            }
        );
    }, [projectId, moduleId]);

    return { isSyncing, syncErd };
}
