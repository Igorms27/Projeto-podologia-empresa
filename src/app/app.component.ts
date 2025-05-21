import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    CommonModule,
    MatDividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  toggleSidenav() {
    this.sidenav.toggle();
  }

  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;
  isFuncionario = this.authService.isFuncionario;

  navigateToHome(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
