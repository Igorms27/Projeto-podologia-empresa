// Importações externas
import { Injectable, Optional, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { Observable, from, of, throwError } from 'rxjs';

import { catchError, map } from 'rxjs/operators';

// Importações internas
import { LoggingService } from './logging.service';
import { User } from '../models/user.model';

// Interface para resposta padronizada
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

/**
 * Serviço de autenticação e gestão de usuários
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isFuncionario = computed(() => this.currentUser()?.role === 'funcionario');
  readonly currentUser$ = toObservable(this.currentUser);

  constructor(
    private router: Router,
    @Optional() private auth: Auth,
    @Optional() private firestore: Firestore,
    private logger: LoggingService
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        this.logger.debug('Usuário carregado do localStorage:', user.name);
      } catch (e) {
        this.logger.error('Erro ao carregar usuário do localStorage:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Realizar login do administrador ou funcionário
   */
  login(cpf: string, password: string): Observable<ApiResponse<User>> {
    // Remover qualquer caractere não numérico do CPF
    const normalizedCpf = cpf.replace(/\D/g, '');

    this.logger.debug(`Tentativa de login - CPF: ${normalizedCpf}, Senha: ***********`);

    // Em produção, isso deve vir de um banco de dados seguro ou serviço de autenticação
    // Esta é uma implementação temporária para desenvolvimento
    if (!this.firestore) {
      // Verificar mapeamento local de usuários para desenvolvimento
      return this.verifyLocalCredentials(normalizedCpf, password);
    }

    // Implementar lógica real de autenticação com Firebase
    return this.verifyFirebaseCredentials(normalizedCpf, password);
  }

  /**
   * Método temporário para verificação local de credenciais (somente desenvolvimento)
   * Em produção, isso deve ser substituído por autenticação segura
   */
  private verifyLocalCredentials(cpf: string, password: string): Observable<ApiResponse<User>> {
    // Esta verificação deve ser substituída por um mecanismo seguro em produção
    if (cpf === '12345678900' && (password === 'admin_dev_password' || password === 'admin')) {
      const adminUser: User = {
        id: 'admin',
        name: 'Administrador',
        cpf: '12345678900',
        email: 'admin@institutodospes.com',
        phone: '',
        address: '',
        registrationDate: new Date().toISOString(),
        role: 'admin',
        medicalInfo: {
          diabetes: false,
          vascularDisease: false,
          hypertension: false,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: false,
          allergiesDescription: '',
        },
      };

      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      this.currentUser.set(adminUser);

      return of({ success: true, data: adminUser });
    } else if (
      cpf === '98765432100' &&
      (password === 'func_dev_password' || password === 'funcionario')
    ) {
      const funcionarioUser: User = {
        id: 'funcionario',
        name: 'Funcionário',
        cpf: '98765432100',
        email: 'funcionario@institutodospes.com',
        phone: '',
        address: '',
        registrationDate: new Date().toISOString(),
        role: 'funcionario',
        medicalInfo: {
          diabetes: false,
          vascularDisease: false,
          hypertension: false,
          renalInsufficiency: false,
          hematologicDisorders: false,
          chemicalAllergies: false,
          allergiesDescription: '',
        },
      };

      localStorage.setItem('currentUser', JSON.stringify(funcionarioUser));
      this.currentUser.set(funcionarioUser);

      return of({ success: true, data: funcionarioUser });
    }

    this.logger.warn(`Tentativa de login não autorizada. CPF não reconhecido: ${cpf}`);
    return throwError(() => new Error('Usuário não autorizado'));
  }

  /**
   * Verificar credenciais no Firebase
   */
  private verifyFirebaseCredentials(cpf: string, password: string): Observable<ApiResponse<User>> {
    if (!this.firestore) {
      return throwError(() => new Error('Firestore não inicializado'));
    }

    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('cpf', '==', cpf));

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        if (querySnapshot.empty) {
          throw new Error('Usuário não encontrado');
        }

        // Na implementação real, devemos usar uma função serverless para verificar a senha
        // Este é apenas um placeholder para o fluxo de autenticação
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const user: User = {
          id: userDoc.id,
          name: userData['name'],
          cpf: userData['cpf'],
          email: userData['email'],
          phone: userData['phone'],
          address: userData['address'],
          birthDate: userData['birthDate'],
          registrationDate: userData['registrationDate'],
          role: userData['role'],
          medicalInfo: userData['medicalInfo'],
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser.set(user);

        return { success: true, data: user };
      }),
      catchError(error => {
        this.logger.error('Erro ao autenticar usuário:', error);
        return throwError(() => new Error('Erro ao autenticar usuário'));
      })
    );
  }

  /**
   * Obter lista de clientes
   */
  getClientsLegacy(): Observable<User[]> {
    if (!this.firestore) {
      return throwError(() => new Error('Firestore não inicializado'));
    }

    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('role', '==', 'client'));

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const users: User[] = [];
        querySnapshot.forEach(doc => {
          const userData = doc.data();
          users.push({
            id: doc.id,
            name: userData['name'],
            cpf: userData['cpf'],
            email: userData['email'],
            phone: userData['phone'],
            address: userData['address'],
            birthDate: userData['birthDate'],
            registrationDate: userData['registrationDate'],
            lastModified: userData['lastModified'],
            lastModifiedBy: userData['lastModifiedBy'],
            role: userData['role'],
            hasActiveAppointments: userData['hasActiveAppointments'],
            lastAppointment: userData['lastAppointment'],
            medicalInfo: userData['medicalInfo'],
          });
        });
        return users;
      }),
      catchError(error => {
        this.logger.error('Erro ao buscar clientes:', error);
        return throwError(() => new Error('Erro ao buscar clientes: ' + error.message));
      })
    );
  }

  /**
   * Buscar cliente por ID
   */
  getClientById(id: string): Observable<User> {
    if (!this.firestore) {
      return throwError(() => new Error('Firestore não inicializado'));
    }

    const userDoc = doc(this.firestore, 'users', id);
    return from(getDoc(userDoc)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Cliente não encontrado');
        }
        const userData = docSnapshot.data();
        return {
          id: docSnapshot.id,
          name: userData['name'],
          cpf: userData['cpf'],
          email: userData['email'],
          phone: userData['phone'],
          address: userData['address'],
          zipCode: userData['zipCode'],
          birthDate: userData['birthDate'],
          registrationDate: userData['registrationDate'],
          lastModified: userData['lastModified'],
          lastModifiedBy: userData['lastModifiedBy'],
          role: userData['role'],
          hasActiveAppointments: userData['hasActiveAppointments'],
          lastAppointment: userData['lastAppointment'],
          medicalInfo: userData['medicalInfo'],
        };
      }),
      catchError(error => {
        this.logger.error('Erro ao buscar cliente:', error);
        return throwError(() => new Error('Erro ao buscar cliente: ' + error.message));
      })
    );
  }

  /**
   * Buscar usuários por termo de busca
   */
  searchUsers(term: string): Observable<User[]> {
    if (!this.firestore) {
      return throwError(() => new Error('Firestore não inicializado'));
    }

    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('role', '==', 'client'));

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const users: User[] = [];
        querySnapshot.forEach(doc => {
          const userData = doc.data();
          const user: User = {
            id: doc.id,
            name: userData['name'],
            cpf: userData['cpf'],
            email: userData['email'],
            phone: userData['phone'],
            address: userData['address'],
            birthDate: userData['birthDate'],
            registrationDate: userData['registrationDate'],
            lastModified: userData['lastModified'],
            lastModifiedBy: userData['lastModifiedBy'],
            role: userData['role'],
            hasActiveAppointments: userData['hasActiveAppointments'],
            lastAppointment: userData['lastAppointment'],
            medicalInfo: userData['medicalInfo'],
          };

          // Filtrar por termo de busca
          if (
            user.name.toLowerCase().includes(term.toLowerCase()) ||
            user.cpf.includes(term) ||
            user.email.toLowerCase().includes(term.toLowerCase())
          ) {
            users.push(user);
          }
        });
        return users;
      }),
      catchError(error => {
        this.logger.error('Erro ao buscar usuários:', error);
        return throwError(() => new Error('Erro ao buscar usuários: ' + error.message));
      })
    );
  }

  /**
   * Obter o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  /**
   * Obter o token de autenticação
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Realizar logout do usuário
   */
  logout(): void {
    if (this.auth) {
      signOut(this.auth).catch(error => {
        this.logger.error('Erro ao fazer logout do Firebase Auth:', error);
      });
    }

    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Certifica-se de que o usuário atual está autenticado como administrador
   */
  ensureAdmin(): Observable<boolean> {
    const currentUser = this.currentUser();

    if (currentUser && currentUser.role === 'admin') {
      return of(true);
    }

    return throwError(() => new Error('Usuário não autenticado como administrador'));
  }
}
