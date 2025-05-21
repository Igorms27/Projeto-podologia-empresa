import { User } from '../../../../models/user.model';

/**
 * Interface para informações médicas do cliente
 * Utilizada nos métodos do componente ClientDetailsDialog
 */
export interface MedicalInfo {
  diabetes: boolean;
  vascularDisease: boolean;
  hypertension: boolean;
  renalInsufficiency: boolean;
  hematologicDisorders: boolean;
  chemicalAllergies: boolean;
  allergiesDescription: string;
  [key: string]: unknown;
}

/**
 * Interface para dados de clientes no diálogo de detalhes
 * Contém as propriedades mínimas necessárias para o componente
 */
export interface ClientData {
  id: string | number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  zipCode?: string;
  birthDate?: string | Date;
  registrationDate: string;
  lastModified?: string;
  lastModifiedBy?: {
    id: string | number;
    name: string;
    role: 'admin' | 'client';
  };
  role: 'admin' | 'client';
  medicalInfo: MedicalInfo;
}

/**
 * Converte um objeto User para o formato ClientData
 * Garante que todas as propriedades necessárias estejam presentes
 */
export function mapUserToClientData(user: User): ClientData {
  // Garantir que medicalInfo está inicializado com valores padrão
  const defaultMedicalInfo: MedicalInfo = {
    diabetes: false,
    vascularDisease: false,
    hypertension: false,
    renalInsufficiency: false,
    hematologicDisorders: false,
    chemicalAllergies: false,
    allergiesDescription: '',
  };

  // Unir os dados médicos do usuário com os valores padrão
  const medicalInfo = {
    ...defaultMedicalInfo,
    ...(user.medicalInfo || {}),
  };

  return {
    id: user.id,
    name: user.name,
    cpf: user.cpf,
    email: user.email,
    phone: user.phone,
    address: user.address,
    zipCode: user.zipCode,
    birthDate: user.birthDate,
    registrationDate: user.registrationDate,
    lastModified: user.lastModified,
    lastModifiedBy: user.lastModifiedBy,
    role: user.role,
    medicalInfo,
  };
}
