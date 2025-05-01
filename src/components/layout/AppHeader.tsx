
import React from "react";
import { BellIcon, CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AppHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:gap-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      </div>
      <div className="hidden flex-1 md:flex md:max-w-xs lg:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-8"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            3
          </span>
        </Button>
        <Button variant="outline" size="icon">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
