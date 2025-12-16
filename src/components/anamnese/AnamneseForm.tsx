import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { medicalRecordsService, MedicalRecord } from "@/services/medicalRecordsService";
import { format } from "date-fns";

const formSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  recordDate: z.string(),
});

interface Patient {
  id: string;
  name: string;
}

interface AnamneseFormProps {
  clinicId: string;
  record?: MedicalRecord | null;
  onSuccess: () => void;
}

export default function AnamneseForm({ clinicId, record, onSuccess }: AnamneseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: record?.patient_id || "",
      title: record?.title || "",
      content: record?.content || "",
      diagnosis: record?.diagnosis || "",
      treatmentPlan: record?.treatment_plan || "",
      recordDate: record?.record_date 
        ? format(new Date(record.record_date), "yyyy-MM-dd") 
        : format(new Date(), "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
    loadPatients();
  }, [clinicId]);

  useEffect(() => {
    if (record) {
      form.reset({
        patientId: record.patient_id || "",
        title: record.title || "",
        content: record.content || "",
        diagnosis: record.diagnosis || "",
        treatmentPlan: record.treatment_plan || "",
        recordDate: record.record_date 
          ? format(new Date(record.record_date), "yyyy-MM-dd") 
          : format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [record]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const { data, error } = await supabase
        .from("patients")
        .select("id, name")
        .eq("clinic_id", clinicId)
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      toast.error("Erro ao carregar pacientes");
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const recordData = {
        patient_id: data.patientId,
        title: data.title,
        content: data.content,
        diagnosis: data.diagnosis || undefined,
        treatment_plan: data.treatmentPlan || undefined,
        record_type: "anamnese",
        record_date: data.recordDate,
      };

      if (record) {
        const success = await medicalRecordsService.updateRecord(record.id, recordData);
        if (success) {
          onSuccess();
        }
      } else {
        const createdRecord = await medicalRecordsService.createRecord(clinicId, recordData);
        if (createdRecord) {
          form.reset();
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar anamnese:", error);
      toast.error("Erro ao salvar anamnese");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {record ? "Editar Anamnese" : "Nova Anamnese"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingPatients}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingPatients
                                ? "Carregando..."
                                : "Selecione o paciente"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Anamnese inicial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo da Anamnese</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o histórico do paciente, queixas, antecedentes..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Diagnóstico ou hipótese diagnóstica..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatmentPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de Tratamento (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o plano de tratamento proposto..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : record ? (
                "Atualizar Anamnese"
              ) : (
                "Salvar Anamnese"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
