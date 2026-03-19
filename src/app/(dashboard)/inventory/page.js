"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Package,
  PencilLine,
  Plus,
  Search,
  Shapes,
} from "lucide-react";

import InventoryModal from "@/components/ui/InventoryModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeMediaUrl } from "@/lib/utils";
import { clubService } from "@/services/clubService";

const CATEGORY_IMAGE_KEYS = ["image", "category_image", "photo", "thumbnail"];
const ITEM_IMAGE_KEYS = ["image", "item_image", "photo", "thumbnail"];

const STOCK_FILTERS = [
  { id: "all", label: "All" },
  { id: "in_stock", label: "In Stock" },
  { id: "low_stock", label: "Low Stock" },
  { id: "out_of_stock", label: "Out of Stock" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Recently added" },
  { id: "name", label: "Name A-Z" },
  { id: "lowest_stock", label: "Lowest stock" },
];

const getCategoryName = (item) =>
  item.category_detail?.name ||
  item.category_name ||
  (typeof item.category === "object" ? item.category?.name : "") ||
  "";

const getCategoryId = (item) =>
  item.category_detail?.id ??
  (typeof item.category === "object" ? item.category?.id : item.category) ??
  "uncategorized";

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

const isOutOfStockTotals = ({ total = 0, available = 0 }) => {
  return total === 0 || available === 0;
};

const isLowStockTotals = ({ total = 0, available = 0 }) => {
  return !isOutOfStockTotals({ total, available }) && available <= Math.max(2, Math.ceil(total * 0.25));
};

const isInStockTotals = ({ total = 0, available = 0 }) =>
  !isOutOfStockTotals({ total, available }) && !isLowStockTotals({ total, available });

const getItemStockSnapshot = (item) => ({
  total: Number(item.quantity || 0),
  available: Number(item.available_quantity || 0),
});

const getCategoryStockSnapshot = (items) => ({
  total: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  available: items.reduce((sum, item) => sum + Number(item.available_quantity || 0), 0),
});

const getStockTone = ({ total = 0, available = 0 }) => {
  if (isOutOfStockTotals({ total, available })) {
    return {
      label: "Out of stock",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      accentClassName: "bg-rose-500",
    };
  }

  if (isLowStockTotals({ total, available })) {
    return {
      label: "Low stock",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      accentClassName: "bg-amber-500",
    };
  }

  return {
    label: "In stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accentClassName: "bg-emerald-500",
  };
};

const matchesStockFilter = (item, stockFilter) => {
  const stockSnapshot = getItemStockSnapshot(item);

  switch (stockFilter) {
    case "in_stock":
      return isInStockTotals(stockSnapshot);
    case "low_stock":
      return isLowStockTotals(stockSnapshot);
    case "out_of_stock":
      return isOutOfStockTotals(stockSnapshot);
    default:
      return true;
  }
};

const sortItems = (items, sortBy) => {
  const sorted = [...items];

  if (sortBy === "name") {
    sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return sorted;
  }

  if (sortBy === "lowest_stock") {
    sorted.sort((a, b) => {
      const availableDiff =
        Number(a.available_quantity || 0) - Number(b.available_quantity || 0);
      if (availableDiff !== 0) return availableDiff;
      return Number(a.quantity || 0) - Number(b.quantity || 0);
    });
    return sorted;
  }

  sorted.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;
    return Number(b.id || 0) - Number(a.id || 0);
  });
  return sorted;
};

const buildCategorySummary = (category) => {
  const categoryStock = getCategoryStockSnapshot(category.items);
  const lowStockItems = category.items.filter((item) =>
    isLowStockTotals(getItemStockSnapshot(item))
  ).length;

  return {
    ...category,
    totalQuantity: categoryStock.total,
    totalAvailable: categoryStock.available,
    lowStockItems,
    stockTone: getStockTone(categoryStock),
  };
};

function InventoryHeader({ onAddItem }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Inventory</h1>
          <p className="text-sm text-slate-600">
            Track stock, monitor shortages, and manage category-wise equipment.
          </p>
        </div>

        <Button
          onClick={onAddItem}
          className="h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
    </section>
  );
}

function InventoryStatCard({ icon: Icon, label, value, helper, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-50 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
        </div>
        <div className={`rounded-2xl p-2.5 ${toneMap[tone] || toneMap.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function InventoryStats({ totalItems, totalAvailable, lowStockCount, categoryCount }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InventoryStatCard
        icon={Boxes}
        label="Total Items"
        value={totalItems}
        helper="Inventory records"
        tone="slate"
      />
      <InventoryStatCard
        icon={Package}
        label="Available Units"
        value={totalAvailable}
        helper="Ready for use"
        tone="emerald"
      />
      <InventoryStatCard
        icon={AlertTriangle}
        label="Low Stock"
        value={lowStockCount}
        helper="Needs attention"
        tone="amber"
      />
      <InventoryStatCard
        icon={Shapes}
        label="Categories"
        value={categoryCount}
        helper="Equipment groups"
        tone="blue"
      />
    </section>
  );
}

function InventoryToolbar({
  searchTerm,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  sortBy,
  onSortByChange,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-950">Search & Filters</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search items, category, type"
              className="h-11 rounded-xl border-slate-200 pl-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Stock Status
          </p>
          <div className="flex flex-wrap gap-2">
            {STOCK_FILTERS.map((filter) => {
              const isActive = filter.id === stockFilter;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onStockFilterChange(filter.id)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sort</p>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-0"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function CategoryRail({ categories, activeCategoryId, onSelectCategory }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-950">Categories</p>
        <p className="mt-1 text-sm text-slate-500">
          Switch context and filter the inventory list.
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        <div className="flex gap-3 lg:flex-col">
          {categories.map((category) => {
            const isActive = String(category.id) === String(activeCategoryId);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(String(category.id))}
                className={`flex w-[140px] shrink-0 items-center gap-3 rounded-2xl border p-3 text-left transition lg:w-full ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ${
                    isActive ? "bg-white/10" : "bg-slate-100"
                  }`}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-scale-down p-2"
                      sizes="48px"
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "bg-[linear-gradient(135deg,#f1f5f9_0%,#e2e8f0_100%)] text-slate-400"
                      }`}
                    >
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-slate-950"}`}>
                    {category.name}
                  </p>
                  <p className={`mt-1 text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>
                    {category.items.length} item{category.items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SelectedCategoryPanel({ category }) {
  const summaryStats = [
    { label: "Items", value: category.items.length, tone: "text-slate-950 bg-slate-50" },
    {
      label: "Total Qty",
      value: category.totalQuantity,
      tone: "text-slate-950 bg-slate-50",
    },
    {
      label: "Available",
      value: category.totalAvailable,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Low Stock",
      value: category.lowStockItems,
      tone: "text-amber-700 bg-amber-50",
    },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[140px_minmax(0,1fr)] lg:items-center">
        <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-scale-down p-3"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-400">
              <Package className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">Current Category</Badge>
            <h2 className="text-xl font-semibold text-slate-950">{category.name}</h2>
            <p className="max-w-2xl text-sm text-slate-600">
              {category.description || "Monitor stock health, availability, and issue trends for this category."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map((stat) => (
              <div key={stat.label} className={`rounded-xl px-4 py-3 ${stat.tone}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InventoryEmptyState({ title, description, onAddItem }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <ClipboardList className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <Button
        onClick={onAddItem}
        className="mt-5 h-10 rounded-xl bg-slate-950 px-4 text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
}

function MetricPill({ label, value, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-50 text-slate-800",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-xl px-3 py-2 ${toneMap[tone] || toneMap.slate}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function InventoryItemCard({ item, onEdit, categorySummary }) {
  const itemImage = getItemImage(item);
  const total = Number(item.quantity || 0);
  const available = Number(item.available_quantity || 0);
  const distributed = Number(item.distributed_quantity || 0);
  const missing = Number(item.missing_quantity || 0);
  const damaged = Number(item.destroyed_quantity || 0);
  const categoryTotal = Number(categorySummary?.totalQuantity || 0);
  const categoryAvailable = Number(categorySummary?.totalAvailable || 0);
  const stockTone = categorySummary?.stockTone || getStockTone({ total, available });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {itemImage ? (
              <Image
                src={itemImage}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)]">
                <Package className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-950">{item.name}</h3>
              <Badge className={stockTone.className}>{categorySummary?.name || "Category"} {stockTone.label}</Badge>
              <Badge variant="outline">{getCategoryName(item) || "Uncategorized"}</Badge>
              <Badge variant="outline">{formatInventoryType(item.type)}</Badge>
            </div>
            <p className="text-sm text-slate-500">
              {item.description || "No item description added yet."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 xl:min-w-[180px] xl:flex-col xl:items-end">
          <div className="text-left xl:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Item Value
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              ₹{Number(item.cost || 0).toLocaleString()}
            </p>
          </div>

          <Button variant="outline" className="rounded-xl" onClick={() => onEdit(item)}>
            <PencilLine className="h-4 w-4" />
            Edit Item
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Category Stock
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {categoryAvailable} of {categoryTotal} available
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <MetricPill label="Total" value={total} tone="slate" />
          <MetricPill label="Available" value={available} tone="emerald" />
          <MetricPill label="Distributed" value={distributed} tone="blue" />
          <MetricPill label="Missing" value={missing} tone="rose" />
          <MetricPill label="Damaged" value={damaged} tone="amber" />
        </div>
      </div>
    </article>
  );
}

function InventoryList({
  items,
  onEdit,
  onAddItem,
  isFiltered,
  selectedCategory,
  categorySummaryMap,
}) {
  if (items.length === 0) {
    return (
      <InventoryEmptyState
        title={isFiltered ? "No items match the current filters." : "No items in this category yet."}
        description={
          isFiltered
            ? "Adjust the search, category, stock status, or sort settings to broaden the results."
            : "Add inventory to start tracking stock levels, shortages, and item condition here."
        }
        onAddItem={onAddItem}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <InventoryItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          categorySummary={
            selectedCategory?.id === "all"
              ? categorySummaryMap[String(getCategoryId(item))]
              : selectedCategory
          }
        />
      ))}
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [initialCategoryId, setInitialCategoryId] = useState("");

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
    setInitialCategoryId("");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddItem = (categoryId = "") => {
    setSelectedItem(null);
    setInitialCategoryId(categoryId ? String(categoryId) : "");
    setIsModalOpen(true);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const searchMatchedItems = items.filter((item) => {
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

  const toolbarFilteredItems = searchMatchedItems.filter((item) =>
    matchesStockFilter(item, stockFilter)
  );

  const itemsByCategory = toolbarFilteredItems.reduce((acc, item) => {
    const categoryId = getCategoryId(item);
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }

    acc[categoryId].push(item);
    return acc;
  }, {});

  const categorySections = [
    buildCategorySummary({
      id: "all",
      name: "All Categories",
      description: "Overview across every inventory category and stock state.",
      items: toolbarFilteredItems,
      image: categories.find((category) => getCategoryImage(category, []))
        ? getCategoryImage(
            categories.find((category) => getCategoryImage(category, [])),
            []
          )
        : null,
    }),
    ...categories.map((category) =>
      buildCategorySummary({
        id: category.id,
        name: category.name,
        description: category.description || "",
        items: itemsByCategory[category.id] || [],
        image: getCategoryImage(category, itemsByCategory[category.id] || []),
      })
    ),
    ...(itemsByCategory.uncategorized
      ? [
          buildCategorySummary({
            id: "uncategorized",
            name: "Uncategorized",
            description: "Items without a mapped inventory category.",
            items: itemsByCategory.uncategorized,
            image: getCategoryImage(null, itemsByCategory.uncategorized),
          }),
        ]
      : []),
  ];

  const activeCategoryId = categorySections.some(
    (category) => String(category.id) === String(selectedCategoryId)
  )
    ? selectedCategoryId
    : "all";

  const selectedCategory =
    categorySections.find((category) => String(category.id) === String(activeCategoryId)) ||
    categorySections[0];

  const categorySummaryMap = categorySections.reduce((acc, category) => {
    acc[String(category.id)] = category;
    return acc;
  }, {});

  const categoryFilteredItems =
    activeCategoryId === "all"
      ? toolbarFilteredItems
      : toolbarFilteredItems.filter(
          (item) => String(getCategoryId(item)) === String(activeCategoryId)
        );

  const visibleItems = sortItems(categoryFilteredItems, sortBy);

  const totalItems = items.length;
  const totalAvailable = items.reduce(
    (sum, item) => sum + Number(item.available_quantity || 0),
    0
  );
  const lowStockCount = items.filter((item) =>
    isLowStockTotals(getItemStockSnapshot(item))
  ).length;
  const categoryCount =
    categories.length + (items.some((item) => String(getCategoryId(item)) === "uncategorized") ? 1 : 0);

  const hasActiveFilters =
    normalizedSearch.length > 0 || stockFilter !== "all" || activeCategoryId !== "all";

  return (
    <div className="space-y-6">
      <InventoryHeader
        onAddItem={() =>
          handleAddItem(
            activeCategoryId === "all" || activeCategoryId === "uncategorized"
              ? ""
              : activeCategoryId
          )
        }
      />

      <InventoryStats
        totalItems={totalItems}
        totalAvailable={totalAvailable}
        lowStockCount={lowStockCount}
        categoryCount={categoryCount}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <InventoryToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          <CategoryRail
            categories={categorySections}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </aside>

        <main className="space-y-4">
          <SelectedCategoryPanel category={selectedCategory} />
          <InventoryList
            items={visibleItems}
            onEdit={handleEdit}
            onAddItem={() =>
              handleAddItem(
                activeCategoryId === "all" || activeCategoryId === "uncategorized"
                  ? ""
                  : activeCategoryId
              )
            }
            isFiltered={hasActiveFilters}
            selectedCategory={selectedCategory}
            categorySummaryMap={categorySummaryMap}
          />
        </main>
      </div>

      <InventoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        initialCategoryId={initialCategoryId}
        onSuccess={loadInventory}
      />
    </div>
  );
}
