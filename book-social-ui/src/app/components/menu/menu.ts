import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  isAuthenticated = false;
  userEmail = '';
  userName = '';
  showUserMenu = false;
  showMobileMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Suscribirse a la información del usuario
    this.authService.userInfo$.subscribe(userInfo => {
      if (userInfo) {
        this.userEmail = userInfo.email;
        this.userName = this.authService.getUserFullName();
      } else {
        this.userEmail = '';
        this.userName = '';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método para obtener las iniciales del usuario
  getUserInitials(): string {
    if (!this.userEmail) return 'U';
    
    // Si hay un nombre completo, usar esas iniciales
    const userInfo = this.authService.getUserInfo();
    if (userInfo?.fullName) {
      const names = userInfo.fullName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    // Si no hay nombre completo, usar el email
    const emailPart = this.userEmail.split('@')[0];
    const parts = emailPart.split(/[._-]/); // Dividir por puntos, guiones bajos o guiones
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return emailPart[0].toUpperCase();
  }

  // Toggle para el menú de usuario
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  // Toggle para el menú móvil
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  // Método para manejar la navegación con verificación de autenticación
  navigateWithAuth(route: string, event?: Event): void {
    // Si es la ruta de inicio, siempre permitir
    if (route === '/home') {
      this.router.navigate([route]);
      return;
    }

    // Si el usuario no está autenticado, redirigir al login
    if (!this.isAuthenticated) {
      if (event) {
        event.preventDefault();
      }
      this.router.navigate(['/login']);
      return;
    }

    // Usuario autenticado: navegar normalmente
    this.router.navigate([route]);
  }
}
