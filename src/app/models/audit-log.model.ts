export interface AuditLog {
  id?: string;
  userId: string | number;
  timestamp: Date | { seconds: number; nanoseconds: number }; // Timestamp do Firestore
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'password_change'
    | 'medical_info_change';
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string;
  adminId?: string; // ID do admin se a ação foi realizada por admin
  isAutoModification?: boolean; // Indica se o usuário modificou seus próprios dados
}
