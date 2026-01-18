"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Teams', href: '/teams', icon: Trophy },
  { name: 'Matches', href: '/matches', icon: Calendar },
  { name: 'Media', href: '/media', icon: ImageIcon },
  { name: 'Finance', href: '/finance', icon: Landmark },
  { name: 'Inventory', href: '/inventory', icon: Package },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("club_token");
    localStorage.removeItem("club_user_name");
    router.push("/login");
  };

  useEffect(() => {
    const storedName = localStorage.getItem("club_user_name");
    if (storedName) {
      setDisplayName(storedName);
    }
    const token = localStorage.getItem("club_token");
    if (!token) {
      router.replace("/login");
    }
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-radial-[at_20%_75%] from-stone-900 via-gray-900 to-black to-90% text-slate-50">
      <div className="p-6">
        <h2 className="text-xl text-stone-100 bg-linear-to-l from-black from-10% via-black-500 via-30% to-gray-900 to-90%  shadow-md bg-black/90 font-bold rounded-sm p-2 tracking-tight flex items-center gap-2">
          <Image src="/KK11-logo.webp" alt="KK Logo" width={50} height={50} className="inline-block"/>
          KK Cricket
        </h2>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${isActive ? "bg-slate-200" : "hover:bg-slate-100"}`}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              {displayName ? `Welcome, ${displayName}` : "Admin Portal"}
            </span>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
