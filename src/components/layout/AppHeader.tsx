
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        </div>
      </div>
      <div className="hidden flex-1 md:flex md:max-w-xs lg:max-w-md">
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
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Novo paciente admitido")}>
              Novo paciente admitido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Medicação atualizada")}>
              Medicação atualizada
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Alta programada")}>
              Alta programada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" onClick={handleCalendarClick}>
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
