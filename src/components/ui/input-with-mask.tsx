import React from "react";
import { Input } from "@/components/ui/input";
import { maskCPF, maskCNPJ, maskPhone } from "@/lib/validators";

interface InputWithMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: "cpf" | "cnpj" | "phone";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputWithMask = React.forwardRef<HTMLInputElement, InputWithMaskProps>(
  ({ mask, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let maskedValue = e.target.value;
      
      switch (mask) {
        case "cpf":
          maskedValue = maskCPF(maskedValue);
          break;
        case "cnpj":
          maskedValue = maskCNPJ(maskedValue);
          break;
        case "phone":
          maskedValue = maskPhone(maskedValue);
          break;
      }
      
      e.target.value = maskedValue;
      onChange(e);
    };
    
    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
      />
    );
  }
);

InputWithMask.displayName = "InputWithMask";
