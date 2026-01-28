import { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddPlanModalProps {
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

export const AddPlanModal = ({ onSuccess }: AddPlanModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    credits_per_cycle: "",
    billing_cycle: "monthly",
    is_active: true,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: "",
      credits_per_cycle: "",
      billing_cycle: "monthly",
      is_active: true,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/admin/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]'
          )?.content || "",
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
          throw new Error(data.message || "Failed to create plan");
        }
        return;
      }

      setOpen(false);
      resetForm();
      router.reload({ only: ["plans", "summary"] });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Pro Plan"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name[0]}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., pro-plan"
                className={errors.slug ? "border-destructive" : ""}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="9.99"
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price[0]}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="credits">Credits per Cycle</Label>
                <Input
                  id="credits"
                  type="number"
                  min="0"
                  value={formData.credits_per_cycle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, credits_per_cycle: e.target.value }))}
                  placeholder="100"
                  className={errors.credits_per_cycle ? "border-destructive" : ""}
                />
                {errors.credits_per_cycle && (
                  <p className="text-sm text-destructive">{errors.credits_per_cycle[0]}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, billing_cycle: value }))}
              >
                <SelectTrigger className={errors.billing_cycle ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.billing_cycle && (
                <p className="text-sm text-destructive">{errors.billing_cycle[0]}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this plan for users to subscribe
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
