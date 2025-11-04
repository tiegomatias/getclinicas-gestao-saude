import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClinicData } from "@/services/masterService";

interface EditClinicDialogProps {
  clinic: ClinicData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (clinicId: string, updates: Partial<ClinicData>) => Promise<void>;
}

export function EditClinicDialog({
  clinic,
  open,
  onOpenChange,
  onSave,
}: EditClinicDialogProps) {
  const [name, setName] = useState(clinic?.name || "");
  const [adminEmail, setAdminEmail] = useState(clinic?.admin_email || "");
  const [plan, setPlan] = useState(clinic?.plan || "Mensal");
  const [bedsCapacity, setBedsCapacity] = useState(clinic?.beds_capacity || 30);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (clinic) {
      setName(clinic.name);
      setAdminEmail(clinic.admin_email);
      setPlan(clinic.plan);
      setBedsCapacity(clinic.beds_capacity);
    }
  }, [clinic]);

  const handleSave = async () => {
    if (!clinic) return;

    setSaving(true);
    try {
      await onSave(clinic.id, {
        name,
        admin_email: adminEmail,
        plan,
        beds_capacity: bedsCapacity,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!clinic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Clínica</DialogTitle>
          <DialogDescription>
            Atualize as informações da clínica
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Clínica</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email do Administrador</Label>
            <Input
              id="email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="plan">Plano</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mensal">Mensal - R$ 490/mês</SelectItem>
                <SelectItem value="Semestral">Semestral - R$ 440/mês (R$ 2.640 a cada 6 meses)</SelectItem>
                <SelectItem value="Anual">Anual - R$ 408/mês (R$ 4.900/ano)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity">Capacidade de Leitos</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={bedsCapacity}
              onChange={(e) => setBedsCapacity(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
