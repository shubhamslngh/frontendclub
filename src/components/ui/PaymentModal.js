"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { clubService } from "@/services/clubService";

export default function PaymentModal({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  
  // Updated state to match your API structure
  const [formData, setFormData] = useState({
    player: "",
    amount: "",
    category: "monthly",
    payment_date: new Date().toISOString().split('T')[0], // Changed from date
    paid: false, // Default to pending invoice
    waived: false,
    waived_reason: "",
  });

  useEffect(() => {
    if (open) {
      clubService.getPlayers().then(res => setPlayers(res.data));
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        player: parseInt(formData.player),
        amount: parseFloat(formData.amount),
        category: formData.category,
        payment_date: formData.payment_date,
        paid: formData.paid,
        waived: formData.waived,
        waived_reason: formData.waived ? formData.waived_reason.trim() : "",
        // If your backend requires due_date, we can set it to payment_date for immediate payments
        due_date: formData.payment_date 
      };

      console.log("Sending Payment:", payload);
      await clubService.recordTransaction(payload);
      
      toast.success("Payment recorded successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to record payment";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Select Player</Label>
            <Select 
              value={formData.player} 
              onValueChange={(v) => setFormData({...formData, player: v})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Search player..." />
              </SelectTrigger>
              <SelectContent>
                {players.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.first_name} {p.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="monthly">Monthly Fee</SelectItem>
                  <SelectItem value="tournament">Match Fee</SelectItem>
                  <SelectItem value="fine">Fine / Penalty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input 
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="paid"
              checked={formData.paid}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  paid: Boolean(checked),
                  waived: checked ? false : formData.waived,
                })
              }
            />
            <Label htmlFor="paid" className="cursor-pointer">
              Mark as Paid?
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="waived"
              checked={formData.waived}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  waived: Boolean(checked),
                  paid: checked ? false : formData.paid,
                  waived_reason: checked ? formData.waived_reason : "",
                })
              }
            />
            <Label htmlFor="waived" className="cursor-pointer">
              Mark as Waived?
            </Label>
          </div>

          {formData.waived ? (
            <div className="space-y-2">
              <Label htmlFor="waived_reason">Waiver Reason</Label>
              <textarea
                id="waived_reason"
                value={formData.waived_reason}
                onChange={(e) => setFormData({ ...formData, waived_reason: e.target.value })}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                placeholder="Approved leave or management exception"
                required
              />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
