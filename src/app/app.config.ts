import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import {
  ScreenTrackingService,
  UserTrackingService,
  getAnalytics,
  provideAnalytics,
} from '@angular/fire/analytics';
import { FirebaseApp, getApp, getApps, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { AppointmentService } from './services/appointment.service';
import { AuthService } from './services/auth.service';
import { CashierService } from './services/cashier.service';
import { HolidayService } from './services/holiday.service';
import { LoggingService } from './services/logging.service';
import { NotificationService } from './services/notification.service';
import { UserService } from './services/user.service';
import { environment } from '../environments/environment';
import { getBrazilianPaginatorIntl } from './shared/utils/brazilian-paginator-intl';

// Declaração para o TypeScript reconhecer window.ENV
declare global {
  interface Window {
    ENV?: {
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID: string;
    };
    firebaseInitAttempts?: number;
  }
}

// Formato de data brasileiro para toda a aplicação
export const BRAZILIAN_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

// Função para ser usada com APP_INITIALIZER
export function initializeFirebaseFactory(): () => Promise<FirebaseApp> {
  return () => {
    console.log('[APP_INITIALIZER] Attempting to initialize Firebase...');

    // Usar diretamente as variáveis de window.ENV em vez do environment
    const firebaseConfig = {
      apiKey: window.ENV?.FIREBASE_API_KEY || environment.firebase.apiKey,
      authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || environment.firebase.authDomain,
      projectId: window.ENV?.FIREBASE_PROJECT_ID || environment.firebase.projectId,
      storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || environment.firebase.storageBucket,
      messagingSenderId:
        window.ENV?.FIREBASE_MESSAGING_SENDER_ID || environment.firebase.messagingSenderId,
      appId: window.ENV?.FIREBASE_APP_ID || environment.firebase.appId,
      measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || environment.firebase.measurementId,
    };

    console.log('[APP_INITIALIZER] Firebase config:', JSON.stringify(firebaseConfig));

    return new Promise((resolve, reject) => {
      try {
        // Tenta obter o app [DEFAULT] para ver se já foi inicializado por algum motivo.
        // Se já existir, initializeApp com a mesma config é um no-op e retorna a instância existente.
        const app = initializeApp(firebaseConfig);
        console.log(
          '[APP_INITIALIZER] Firebase initialized successfully via initializeApp(). App instance:',
          app
        );
        console.log(
          '[APP_INITIALIZER] Active Firebase apps after initializeApp:',
          getApps().length
        );
        try {
          console.log(
            '[APP_INITIALIZER] Attempting getApp() immediately after initializeApp:',
            getApp()
          );
        } catch (e) {
          console.error(
            '[APP_INITIALIZER] Error calling getApp() immediately after initializeApp:',
            e
          );
        }
        resolve(app); // Resolve com a instância do app
      } catch (error) {
        console.error('[APP_INITIALIZER] Firebase initialization failed!', error);
        reject(error); // Importante rejeitar a promessa para parar a inicialização do app Angular
      }
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFirebaseFactory,
      multi: true,
    },
    provideFirebaseApp(() => {
      console.log('[PROVIDER] Factory for FirebaseApp: Calling getApp()');
      try {
        const app = getApp();
        console.log('[PROVIDER] Factory for FirebaseApp: getApp() successful:', app);
        return app;
      } catch (e) {
        console.error('[PROVIDER] Factory for FirebaseApp: Error in getApp():', e);
        console.log(
          '[PROVIDER] Factory for FirebaseApp: Active Firebase apps at this point:',
          getApps().length
        );
        throw e;
      }
    }),
    provideAuth(() => {
      const app = inject(FirebaseApp); // Injeta FirebaseApp
      console.log('[PROVIDER] Factory for Auth: Injected FirebaseApp:', app);
      console.log('[PROVIDER] Factory for Auth: Calling getAuth()');
      try {
        const auth = getAuth(app);
        console.log('[PROVIDER] Factory for Auth: getAuth() successful:', auth);
        return auth;
      } catch (e) {
        console.error('[PROVIDER] Factory for Auth: Error in getAuth():', e);
        throw e;
      }
    }),
    provideFirestore(() => {
      const app = inject(FirebaseApp); // Injeta FirebaseApp
      console.log('[PROVIDER] Factory for Firestore: Injected FirebaseApp:', app);
      console.log('[PROVIDER] Factory for Firestore: Calling getFirestore()');
      try {
        const firestore = getFirestore(app);
        console.log('[PROVIDER] Factory for Firestore: getFirestore() successful:', firestore);
        return firestore;
      } catch (e) {
        console.error('[PROVIDER] Factory for Firestore: Error in getFirestore():', e);
        throw e;
      }
    }),
    provideStorage(() => {
      const app = inject(FirebaseApp); // Injeta FirebaseApp
      console.log('[PROVIDER] Factory for Storage: Injected FirebaseApp:', app);
      console.log('[PROVIDER] Factory for Storage: Calling getStorage()');
      try {
        const storage = getStorage(app);
        console.log('[PROVIDER] Factory for Storage: getStorage() successful:', storage);
        return storage;
      } catch (e) {
        console.error('[PROVIDER] Factory for Storage: Error in getStorage():', e);
        throw e;
      }
    }),
    provideAnalytics(() => {
      const app = inject(FirebaseApp); // Injeta FirebaseApp
      console.log('[PROVIDER] Factory for Analytics: Injected FirebaseApp:', app);
      console.log('[PROVIDER] Factory for Analytics: Calling getAnalytics()');
      try {
        const analytics = getAnalytics(app);
        console.log('[PROVIDER] Factory for Analytics: getAnalytics() successful:', analytics);
        return analytics;
      } catch (e) {
        console.error('[PROVIDER] Factory for Analytics: Error in getAnalytics():', e);
        throw e;
      }
    }),
    ScreenTrackingService,
    UserTrackingService,

    // Providers do CoreModule
    AppointmentService,
    AuthService,
    CashierService,
    HolidayService,
    LoggingService,
    NotificationService,
    UserService,
    provideNgxMask(),

    // Configuração de roteamento
    provideRouter(routes),

    // Outros providers
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: BRAZILIAN_DATE_FORMATS },
    { provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    { provide: MatPaginatorIntl, useValue: getBrazilianPaginatorIntl() },
  ],
};
