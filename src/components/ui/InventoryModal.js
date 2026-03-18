"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { clubService } from "@/services/clubService";
import { normalizeMediaUrl } from "@/lib/utils";

const INVENTORY_TYPE_OPTIONS = [
  { value: "team_kit", label: "Team Kit" },
  { value: "merchandise", label: "Merchandise" },
];

export default function InventoryModal({ open, onOpenChange, item, onSuccess, initialCategoryId = "" }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 1,
    available_quantity: "",
    distributed_quantity: 0,
    missing_quantity: 0,
    destroyed_quantity: 0,
    type: "",
    cost: "",
    description: ""
  });
  const currentImageUrl = normalizeMediaUrl(
    item?.image || item?.item_image || item?.photo || item?.thumbnail || ""
  );

  useEffect(() => {
    if (!open) return;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await clubService.getInventoryCategories();
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to load inventory categories", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, [open]);

  useEffect(() => {
    if (!open || item || categories.length === 0 || formData.category) return;

    const defaultCategory = initialCategoryId
      ? String(initialCategoryId)
      : String(categories[0].id);

    setFormData((prev) => ({ ...prev, category: defaultCategory }));
  }, [categories, open, item, formData.category, initialCategoryId]);

  useEffect(() => {
    if (item) {
      const categoryId =
        item.category_detail?.id ??
        (typeof item.category === "object" ? item.category?.id : item.category);
      const normalizedType = (item.type || "").trim().toLowerCase();
      const type = INVENTORY_TYPE_OPTIONS.some((option) => option.value === normalizedType)
        ? normalizedType
        : "";
      setFormData({
        name: item.name || "",
        category: categoryId ?? "",
        quantity: item.quantity || 1,
        available_quantity: item.available_quantity ?? "",
        distributed_quantity: item.distributed_quantity ?? 0,
        missing_quantity: item.missing_quantity ?? 0,
        destroyed_quantity: item.destroyed_quantity ?? 0,
        cost: item.cost || "",
        type,
        description: item.description || ""
      });
    } else {
      setFormData({
        name: "",
        category: initialCategoryId ? String(initialCategoryId) : "",
        quantity: 1,
        available_quantity: "",
        distributed_quantity: 0,
        missing_quantity: 0,
        destroyed_quantity: 0,
        type: "",
        cost: "",
        description: ""
      });
    }
  }, [item, open, initialCategoryId]);

  useEffect(() => {
    if (!itemImage) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(itemImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [itemImage]);

  useEffect(() => {
    if (!open) {
      setItemImage(null);
      setImagePreview("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedType = formData.type.trim().toLowerCase();
      const isValidType = INVENTORY_TYPE_OPTIONS.some(({ value }) => value === normalizedType);

      if (!isValidType) {
        toast.error("Please select a valid inventory type");
        setLoading(false);
        return;
      }

      const toInt = (value) => {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const quantity = toInt(formData.quantity);
      const distributed = toInt(formData.distributed_quantity);
      const missing = toInt(formData.missing_quantity);
      const destroyed = toInt(formData.destroyed_quantity);
      let available = toInt(formData.available_quantity);

      if (formData.available_quantity === "" || formData.available_quantity === null) {
        const derived = quantity - distributed - missing - destroyed;
        available = derived >= 0 ? derived : 0;
      }

      const categoryId = formData.category ? parseInt(formData.category, 10) : null;
      if (!categoryId) {
        toast.error("Please select a category");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        category: categoryId,
        quantity,
        available_quantity: available,
        distributed_quantity: distributed,
        missing_quantity: missing,
        destroyed_quantity: destroyed,
        type: normalizedType,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        description: formData.description
      };

      if (item?.id) {
        if (itemImage) {
          const updatePayload = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            updatePayload.append(key, value);
          });
          updatePayload.append("image", itemImage);
          await clubService.updateInventoryItem(item.id, updatePayload);
        } else {
          await clubService.updateInventoryItem(item.id, payload);
        }
        toast.success("Item updated");
      } else {
        const createPayload = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          createPayload.append(key, value);
        });
        if (itemImage) {
          createPayload.append("image", itemImage);
        }

        await clubService.createInventoryItem(createPayload);
        toast.success("New item added to inventory");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save inventory item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <DialogTitle>{item ? "Edit Item" : "Add New Inventory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input 
              placeholder="e.g. SG Cricket Bat - Grade A"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category ? String(formData.category) : ""}
                onValueChange={(v) => setFormData({...formData, category: v})}
                disabled={categoriesLoading || categories.length === 0}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoriesLoading && (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  )}
                  {!categoriesLoading && categories.length === 0 && (
                    <SelectItem value="empty" disabled>No categories</SelectItem>
                  )}
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Quantity</Label>
              <Input 
                type="number" 
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inventory type" />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Available</Label>
              <Input
                type="number"
                min="0"
                value={formData.available_quantity}
                onChange={(e) => setFormData({...formData, available_quantity: e.target.value})}
                placeholder="Auto-calc if blank"
              />
            </div>
            <div className="space-y-2">
              <Label>Distributed</Label>
              <Input
                type="number"
                min="0"
                value={formData.distributed_quantity}
                onChange={(e) => setFormData({...formData, distributed_quantity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Missing</Label>
              <Input
                type="number"
                min="0"
                value={formData.missing_quantity}
                onChange={(e) => setFormData({...formData, missing_quantity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Destroyed</Label>
              <Input
                type="number"
                min="0"
                value={formData.destroyed_quantity}
                onChange={(e) => setFormData({...formData, destroyed_quantity: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cost / Value (₹)</Label>
            <Input 
              type="number" 
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input 
              placeholder="Details about condition, usage, or assignment..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <Label>{item ? "Update Item Image" : "Item Image"}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setItemImage(e.target.files?.[0] || null)}
            />
            {(imagePreview || currentImageUrl) && (
              <div className="overflow-hidden rounded-2xl border bg-slate-50">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={imagePreview || currentImageUrl}
                    alt={item ? `${item.name || "Inventory item"} preview` : "Selected inventory item preview"}
                    fill
                    className="object-cover"
                    unoptimized={Boolean(imagePreview)}
                  />
                </div>
              </div>
            )}
          </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-full">
              {loading ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
