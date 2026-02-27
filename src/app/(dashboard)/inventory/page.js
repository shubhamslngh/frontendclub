"use client";
import React, { useEffect, useState } from 'react';
import { clubService } from '@/services/clubService';
import InventoryModal from "@/components/ui/InventoryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Package, Search, Plus } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadInventory = async () => {
    try {
      const res = await clubService.getInventory();
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const getCategoryName = (item) =>
    item.category_detail?.name ||
    item.category_name ||
    (typeof item.category === "string" ? item.category : "");

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getCategoryName(i).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage equipment availability and status.</p>
        </div>
        <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="divide-y md:hidden">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No items found.</div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                    <Package className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{getCategoryName(item) || "-"}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs border" onClick={() => handleEdit(item)}>
                    Manage
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-semibold">{item.quantity}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Available</div>
                    <div>{item.available_quantity ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Distributed</div>
                    <div>{item.distributed_quantity ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Missing</div>
                    <div>{item.missing_quantity ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Destroyed</div>
                    <div>{item.destroyed_quantity ?? "-"}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 border-t pt-3">
                  {item.description || "-"}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block">
          <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Distributed</TableHead>
              <TableHead>Missing</TableHead>
              <TableHead>Destroyed</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
               <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No items found.</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{getCategoryName(item) || "-"}</TableCell>
                  <TableCell>
                    <span className="font-bold">{item.quantity}</span>
                  </TableCell>
                  <TableCell>{item.available_quantity ?? "-"}</TableCell>
                  <TableCell>{item.distributed_quantity ?? "-"}</TableCell>
                  <TableCell>{item.missing_quantity ?? "-"}</TableCell>
                  <TableCell>{item.destroyed_quantity ?? "-"}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      Edit / Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
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
