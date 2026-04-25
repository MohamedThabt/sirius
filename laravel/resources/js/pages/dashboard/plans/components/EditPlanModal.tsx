import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: string;
    credits_per_cycle: number;
    billing_cycle: string;
    is_active: boolean;
    users_count: number;
    created_at: string;
}

interface EditPlanModalProps {
    plan: Plan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface FormErrors {
    name?: string[];
    slug?: string[];
    price?: string[];
    credits_per_cycle?: string[];
    billing_cycle?: string[];
    is_active?: string[];
}

export const EditPlanModal = ({ plan, open, onOpenChange, onSuccess }: EditPlanModalProps) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        price: '',
        credits_per_cycle: '',
        billing_cycle: 'monthly',
        is_active: true,
    });

    useEffect(() => {
        if (open && plan) {
            setFormData({
                name: plan.name,
                slug: plan.slug,
                price: plan.price.toString(),
                credits_per_cycle: plan.credits_per_cycle.toString(),
                billing_cycle: plan.billing_cycle,
                is_active: plan.is_active,
            });
            setErrors({});
        }
    }, [open, plan]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`/admin/plans/${plan.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    credits_per_cycle: parseInt(formData.credits_per_cycle, 10),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Failed to update plan');
                }
                return;
            }

            onOpenChange(false);
            router.reload({ only: ['plans', 'summary'] });
            onSuccess?.();
        } catch (error) {
            console.error('Failed to update plan:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Plan</DialogTitle>
                        <DialogDescription>Update the plan details. Changes will affect all current subscribers.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Plan Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Pro Plan"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-slug">Slug</Label>
                            <Input
                                id="edit-slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="e.g., pro-plan"
                                className={errors.slug ? 'border-destructive' : ''}
                            />
                            {errors.slug && <p className="text-sm text-destructive">{errors.slug[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Price (USD)</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                    placeholder="9.99"
                                    className={errors.price ? 'border-destructive' : ''}
                                />
                                {errors.price && <p className="text-sm text-destructive">{errors.price[0]}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-credits">Credits per Cycle</Label>
                                <Input
                                    id="edit-credits"
                                    type="number"
                                    min="0"
                                    value={formData.credits_per_cycle}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, credits_per_cycle: e.target.value }))}
                                    placeholder="100"
                                    className={errors.credits_per_cycle ? 'border-destructive' : ''}
                                />
                                {errors.credits_per_cycle && <p className="text-sm text-destructive">{errors.credits_per_cycle[0]}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-billing_cycle">Billing Cycle</Label>
                            <Select
                                value={formData.billing_cycle}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, billing_cycle: value }))}
                            >
                                <SelectTrigger className={errors.billing_cycle ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select billing cycle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.billing_cycle && <p className="text-sm text-destructive">{errors.billing_cycle[0]}</p>}
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="edit-is_active">Active Status</Label>
                                <p className="text-sm text-muted-foreground">Enable this plan for users to subscribe</p>
                            </div>
                            <Switch
                                id="edit-is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
