import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface CreditLimitModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    creditsBalance?: number;
}

export function CreditLimitModal({ open, onOpenChange, message, creditsBalance }: CreditLimitModalProps) {
    const handleViewUsage = () => {
        router.visit('/settings/usage');
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <AlertDialogTitle className="text-destructive">Credit Limit Reached</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-3 pt-2">
                        <p className="text-base">{message}</p>
                        {creditsBalance !== undefined && (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                                <p className="text-sm font-medium text-foreground">
                                    Current balance: <span className="font-bold text-destructive">{creditsBalance}</span> credits
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            You can view your usage details and purchase additional credits or upgrade your plan.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction onClick={handleViewUsage}>Manage Credits</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
