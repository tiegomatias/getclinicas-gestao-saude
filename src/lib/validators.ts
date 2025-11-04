// Validação de CPF
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// Validação de telefone brasileiro
export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '');
  
  // Verifica formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (phone.length === 11) {
    // Celular com 9 dígitos
    return /^[1-9]{2}9[0-9]{8}$/.test(phone);
  } else if (phone.length === 10) {
    // Fixo com 8 dígitos
    return /^[1-9]{2}[2-9][0-9]{7}$/.test(phone);
  }
  
  return false;
};

// Validação de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Máscaras de formatação
export const maskCPF = (value: string): string => {
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return value;
};

export const maskCNPJ = (value: string): string => {
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');
  return value;
};

export const maskPhone = (value: string): string => {
  value = value.replace(/\D/g, '');
  if (value.length <= 10) {
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
};

// Validação completa de formulários
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validatePatientForm = (data: {
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Nome deve ter no mínimo 3 caracteres';
  }
  
  if (data.cpf && !validateCPF(data.cpf)) {
    errors.cpf = 'CPF inválido';
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Telefone inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateClinicForm = (data: {
  name: string;
  cnpj?: string;
  email: string;
  phone?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Nome da clínica deve ter no mínimo 3 caracteres';
  }
  
  if (data.cnpj && !validateCNPJ(data.cnpj)) {
    errors.cnpj = 'CNPJ inválido';
  }
  
  if (!validateEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Telefone inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
