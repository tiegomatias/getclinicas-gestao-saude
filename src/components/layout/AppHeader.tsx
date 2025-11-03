
import React, { useState, useEffect } from "react";
import { CalendarIcon, Search, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useSubscription } from "@/hooks/useSubscription";

export default function AppHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  const subscription = useSubscription();
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  useEffect(() => {
    const clinicDataStr = localStorage.getItem("clinicData");
    if (clinicDataStr) {
      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);
    }
  }, []);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("searchQuery") as string;
    toast.info(`Pesquisando por: ${query}`);
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
        {/* Badge de Assinatura */}
        {subscription.isSubscribed() && (
          <Badge 
            variant="outline" 
            className="hidden lg:flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
          >
            <Crown className="h-3 w-3" />
            {subscription.getPlanName()}
          </Badge>
        )}
        
        {/* Mobile search toggle */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-4 w-4" />
        </Button>
        
        <NotificationPanel clinicId={clinicId} />
        
        <Button variant="outline" size="icon" onClick={handleCalendarClick}>
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
}
