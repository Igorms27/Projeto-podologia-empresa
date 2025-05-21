import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { Observable, catchError, from, map, throwError } from 'rxjs';

import { ErrorHandlerService } from './error-handler.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly COLLECTION = 'users';

  constructor(
    private firestore: Firestore,
    private errorHandler: ErrorHandlerService
  ) {}

  getClients(): Observable<User[]> {
    const usersCollection = collection(this.firestore, this.COLLECTION);
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
            zipCode: userData['zipCode'],
          });
        });
        return users as User[];
      }),
      catchError(error => {
        this.errorHandler.handleError(error, 'UserService.getClients');
        return throwError(() => new Error('Erro ao buscar clientes'));
      })
    );
  }

  getUserById(id: string): Observable<User> {
    const userDoc = doc(this.firestore, this.COLLECTION, id);

    return from(getDoc(userDoc)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Usuário não encontrado');
        }

        const userData = docSnapshot.data();
        return {
          id: docSnapshot.id,
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
          zipCode: userData['zipCode'],
        };
      }),
      catchError(error => {
        this.errorHandler.handleError(error, 'UserService.getUserById');
        return throwError(() => new Error('Erro ao buscar usuário'));
      })
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<boolean> {
    const userDoc = doc(this.firestore, this.COLLECTION, userId);

    return from(updateDoc(userDoc, userData)).pipe(
      map(() => true),
      catchError(error => {
        this.errorHandler.handleError(error, 'UserService.updateUser');
        return throwError(() => new Error('Erro ao atualizar usuário'));
      })
    );
  }

  deleteUser(userId: string): Observable<boolean> {
    const userDoc = doc(this.firestore, this.COLLECTION, userId);

    return from(deleteDoc(userDoc)).pipe(
      map(() => true),
      catchError(error => {
        this.errorHandler.handleError(error, 'UserService.deleteUser');
        return throwError(() => new Error('Erro ao excluir usuário'));
      })
    );
  }

  createUser(user: Omit<User, 'id'>): Observable<string> {
    const usersCollection = collection(this.firestore, this.COLLECTION);
    const newUserDoc = doc(usersCollection);

    return from(setDoc(newUserDoc, user)).pipe(
      map(() => newUserDoc.id),
      catchError(error => {
        this.errorHandler.handleError(error, 'UserService.createUser');
        return throwError(() => new Error('Erro ao criar usuário'));
      })
    );
  }
}
