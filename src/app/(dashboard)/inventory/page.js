"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Package, Plus, Search } from "lucide-react";

import InventoryModal from "@/components/ui/InventoryModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clubService } from "@/services/clubService";
import { normalizeMediaUrl } from "@/lib/utils";

const CATEGORY_IMAGE_KEYS = ["image", "category_image", "photo", "thumbnail"];
const ITEM_IMAGE_KEYS = ["image", "item_image", "photo", "thumbnail"];

const getCategoryName = (item) =>
  item.category_detail?.name ||
  item.category_name ||
  (typeof item.category === "object" ? item.category?.name : "") ||
  "";

const getImageFromKeys = (source, keys) => {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return normalizeMediaUrl(value);
    }
  }

  return null;
};

const formatInventoryType = (type) => {
  if (!type) return "Inventory";
  return type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getCategoryImage = (category, itemsInCategory) => {
  const directImage = getImageFromKeys(category, CATEGORY_IMAGE_KEYS);
  if (directImage) return directImage;

  for (const item of itemsInCategory) {
    const itemCategoryImage = getImageFromKeys(item.category_detail, CATEGORY_IMAGE_KEYS);
    if (itemCategoryImage) return itemCategoryImage;
  }

  return null;
};

const getItemImage = (item) => getImageFromKeys(item, ITEM_IMAGE_KEYS);

const getStockTone = (item) => {
  const available = Number(item.available_quantity || 0);
  const total = Number(item.quantity || 0);

  if (total === 0 || available === 0) {
    return {
      label: "Out of stock",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (available <= Math.max(2, Math.ceil(total * 0.25))) {
    return {
      label: "Low stock",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "In stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadInventory = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        clubService.getInventory(),
        clubService.getInventoryCategories(),
      ]);

      setItems(itemsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  };

  useEffect(() => {
    const initializeInventory = async () => {
      await loadInventory();
    };

    initializeInventory();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (!normalizedSearch) return true;

    const haystack = [
      item.name,
      getCategoryName(item),
      item.description,
      formatInventoryType(item.type),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const categoryId =
      item.category_detail?.id ??
      (typeof item.category === "object" ? item.category?.id : item.category) ??
      "uncategorized";

    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }

    acc[categoryId].push(item);
    return acc;
  }, {});

  const categorySections = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description || "",
      items: itemsByCategory[category.id] || [],
      image: getCategoryImage(category, itemsByCategory[category.id] || []),
    })),
    ...(itemsByCategory.uncategorized
      ? [
          {
            id: "uncategorized",
            name: "Uncategorized",
            description: "Items without a mapped inventory category.",
            items: itemsByCategory.uncategorized,
            image: getCategoryImage(null, itemsByCategory.uncategorized),
          },
        ]
      : []),
  ].filter((category) => {
    if (!normalizedSearch) return true;
    return (
      category.name.toLowerCase().includes(normalizedSearch) || category.items.length > 0
    );
  });

  const totalItems = items.length;
  const totalAvailable = items.reduce(
    (sum, item) => sum + Number(item.available_quantity || 0),
    0
  );
  const lowStockCount = items.filter(
    (item) => Number(item.available_quantity || 0) <= Math.max(2, Math.ceil(Number(item.quantity || 0) * 0.25))
  ).length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#f8fafc_100%)] shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge className="border-orange-200 bg-white/80 text-orange-700">Inventory Hub</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Organize stock by category, not by spreadsheet rows.
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Browse category cover images, inspect each item visually, and update stock without losing context.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Items</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{totalItems}</div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Available</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{totalAvailable}</div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm col-span-2 sm:col-span-1">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Low Stock</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{lowStockCount}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by item, category, type, or detail"
            className="h-11 rounded-xl border-slate-200 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </section>

      <div className="space-y-6">
        {categorySections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Package className="h-5 w-5 text-slate-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No inventory matches this view.</h2>
            <p className="mt-2 text-sm text-slate-500">
              Adjust the search or add a new item to start building out your category shelves.
            </p>
          </div>
        ) : (
          categorySections.map((category) => (
            <section
              key={category.id}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="relative min-h-[240px] border-b border-slate-200 bg-slate-100 lg:min-h-full lg:border-b-0 lg:border-r">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  ) : (
                    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_100%)] text-slate-500">
                      <div className="rounded-full bg-white/70 p-3 shadow-sm">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">No category image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex items-center gap-2">
                      <Badge className="border-white/20 bg-white/15 text-white backdrop-blur-sm">
                        {category.items.length} item{category.items.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold">{category.name}</h2>
                    <p className="mt-2 max-w-sm text-sm text-white/80">
                      {category.description || "Inventory items grouped under this category."}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {category.items.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <p className="text-base font-medium text-slate-900">No items in this category yet.</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Add inventory to start populating this section with item cards and stock details.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {category.items.map((item) => {
                        const itemImage = getItemImage(item);
                        const stockTone = getStockTone(item);

                        return (
                          <article
                            key={item.id}
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                          >
                            <div className="relative aspect-[4/3] bg-slate-100">
                              {itemImage ? (
                                <Image
                                  src={itemImage}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f1f5f9_0%,#e2e8f0_100%)]">
                                  <Package className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                                <Badge className={stockTone.className}>{stockTone.label}</Badge>
                                <Badge className="border-white/20 bg-white/15 text-white backdrop-blur-sm">
                                  {formatInventoryType(item.type)}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-4 p-4">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.description || "No item description added yet."}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-white p-3">
                                  <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
                                  <div className="mt-1 text-lg font-semibold text-slate-950">{item.quantity ?? 0}</div>
                                </div>
                                <div className="rounded-2xl bg-white p-3">
                                  <div className="text-xs uppercase tracking-wide text-slate-500">Available</div>
                                  <div className="mt-1 text-lg font-semibold text-slate-950">{item.available_quantity ?? 0}</div>
                                </div>
                                <div className="rounded-2xl bg-white p-3">
                                  <div className="text-xs uppercase tracking-wide text-slate-500">Distributed</div>
                                  <div className="mt-1 text-lg font-semibold text-slate-950">{item.distributed_quantity ?? 0}</div>
                                </div>
                                <div className="rounded-2xl bg-white p-3">
                                  <div className="text-xs uppercase tracking-wide text-slate-500">Missing / Damaged</div>
                                  <div className="mt-1 text-lg font-semibold text-slate-950">
                                    {(item.missing_quantity ?? 0) + (item.destroyed_quantity ?? 0)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-slate-500">Value</div>
                                  <div className="mt-1 text-sm font-semibold text-slate-950">
                                    ₹{Number(item.cost || 0).toLocaleString()}
                                  </div>
                                </div>
                                <Button variant="outline" className="rounded-xl" onClick={() => handleEdit(item)}>
                                  Edit Item
                                </Button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      <InventoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        onSuccess={loadInventory}
      />
    </div>
  );
}
