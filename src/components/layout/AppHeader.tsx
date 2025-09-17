
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";

export default function AppHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("searchQuery") as string;
    toast.info(`Pesquisando por: ${query}`);
  };

  const handleNotificationClick = () => {
    toast.info("Notificações abertas");
  };

  const handleCalendarClick = () => {
    navigate("/agenda");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b bg-background px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="flex items-center gap-1 sm:gap-2">
          <Logo size="sm" />
          <h1 className="text-lg sm:text-xl font-semibold md:text-2xl line-clamp-1">{title}</h1>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 md:max-w-xs lg:max-w-md mx-4">
        <form className="relative w-full" onSubmit={handleSearch}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="searchQuery"
            placeholder="Pesquisar..."
            className="w-full pl-8"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile search toggle */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 animate-pulse items-center justify-center rounded-full bg-destructive text-[9px] sm:text-[10px] text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Novo paciente admitido")}>
              <div className="flex flex-col">
                <span className="font-medium">Novo paciente admitido</span>
                <span className="text-xs text-muted-foreground">Há 5 minutos</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Medicação atualizada")}>
              <div className="flex flex-col">
                <span className="font-medium">Medicação atualizada</span>
                <span className="text-xs text-muted-foreground">Há 12 minutos</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Alta programada")}>
              <div className="flex flex-col">
                <span className="font-medium">Alta programada</span>
                <span className="text-xs text-muted-foreground">Há 30 minutos</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="icon" onClick={handleCalendarClick}>
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
}
