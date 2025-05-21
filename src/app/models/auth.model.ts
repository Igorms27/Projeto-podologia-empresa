export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  cpf: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  medicalConditions?: {
    diabetes?: boolean;
    vascularDisease?: boolean;
    hypertension?: boolean;
    renalInsufficiency?: boolean;
    hematologicDisorders?: boolean;
    chemicalAllergies?: boolean;
    allergiesDescription?: string;
  };
}
