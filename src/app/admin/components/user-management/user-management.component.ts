import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { User } from '../../../models/user.model';
import { LoggingService } from '../../../services/logging.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { CpfPipe } from '../../../shared/pipes/cpf.pipe';
import { PhonePipe } from '../../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CpfPipe,
    PhonePipe,
  ],
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'cpf', 'email', 'phone', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  searchQuery: string = '';
  roleFilter: string = 'all';
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getClients().subscribe({
      next: users => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: error => {
        this.logger.error('Erro ao carregar usuários:', error);
        this.notificationService.error('Erro ao carregar a lista de usuários.');
        this.isLoading = false;
      },
    });
  }

  applyFilter() {
    const filterValue = this.searchQuery.trim().toLowerCase();

    // Primeiro resetamos o filtro
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = (
        data.name +
        ' ' +
        data.cpf +
        ' ' +
        data.email +
        ' ' +
        data.phone
      ).toLowerCase();
      return searchStr.includes(filter);
    };

    // Aplicamos o filtro de texto
    this.dataSource.filter = filterValue;

    // Se um filtro de tipo (role) específico estiver selecionado, aplicamos esse filtro também
    if (this.roleFilter !== 'all') {
      const filteredData = this.dataSource.filteredData.filter(
        user => user.role === this.roleFilter
      );
      this.dataSource.data = this.dataSource.data
        .map(user => {
          // Mantém o usuário visível apenas se estiver no filteredData
          return filteredData.some(filtered => filtered.id === user.id) ? user : null;
        })
        .filter(user => user !== null) as User[];
    } else if (filterValue === '') {
      // Se não houver texto de busca e o filtro for 'todos', recarregamos todos os usuários
      this.loadUsers();
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editUser(user: User): void {
    this.logger.debug('Editar usuário:', user);
    // Implementar edição de usuário
    this.notificationService.info('Funcionalidade de edição em desenvolvimento');
  }

  deleteUser(user: User) {
    // Implementar exclusão de usuário
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      // Ensure user.id is a string
      const userId = String(user.id);
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.notificationService.success(`Usuário ${user.name} excluído com sucesso`);
          this.loadUsers(); // Recarregar a lista
        },
        error: error => {
          this.logger.error('Erro ao excluir usuário:', error);
          this.notificationService.error('Erro ao excluir usuário. Tente novamente.');
        },
      });
    }
  }

  addNewUser(): void {
    this.logger.debug('Adicionar novo usuário');
    // Implementar adição de novo usuário
    this.notificationService.info('Funcionalidade de adição em desenvolvimento');
  }
}
