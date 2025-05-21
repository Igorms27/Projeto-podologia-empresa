export interface User {
  id: string | number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  zipCode?: string;
  birthDate?: string;
  registrationDate: string;
  lastModified?: string;
  lastModifiedBy?: {
    id: string | number;
    name: string;
    role: 'admin' | 'client' | 'funcionario';
  };
  role: 'admin' | 'client' | 'funcionario';
  hasActiveAppointments?: boolean;
  lastAppointment?: string;
  medicalInfo: {
    diabetes: boolean;
    vascularDisease: boolean;
    hypertension: boolean;
    renalInsufficiency: boolean;
    hematologicDisorders: boolean;
    chemicalAllergies: boolean;
    allergiesDescription: string;
  };
}
