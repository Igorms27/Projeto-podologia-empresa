import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

registerLocaleData(localePt);

bootstrapApplication(AppComponent, appConfig).catch(err => {
  // Em produção, isso seria capturado pelo serviço de logging
  console.error('Erro ao inicializar aplicação:', err);
});
