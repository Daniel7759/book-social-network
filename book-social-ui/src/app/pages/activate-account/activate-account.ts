import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/services/authentication.service';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './activate-account.html',
  styleUrl: './activate-account.css'
})
export class ActivateAccountComponent {
  activationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.activationForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.activationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const token = this.activationForm.get('token')?.value;

      this.authService.confirm({
        token: token
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = '¡Cuenta activada exitosamente! Serás redirigido al login en unos segundos.';
          console.log('Activación exitosa');
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error en activación:', error);
          
          // Manejo de diferentes tipos de errores
          if (error.status === 400) {
            this.errorMessage = 'Código de activación inválido. Por favor, verifica el código ingresado.';
          } else if (error.status === 404) {
            this.errorMessage = 'Código de activación no encontrado o ya utilizado.';
          } else if (error.status === 410) {
            this.errorMessage = 'El código de activación ha expirado. Solicita un nuevo código.';
          } else if (error.status === 500) {
            this.errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          } else {
            this.errorMessage = error.error?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.activationForm.controls).forEach(key => {
      const control = this.activationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos auxiliares para validaciones en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.activationForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.activationForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'El código de activación es requerido.';
      }
      if (field.errors['minlength']) {
        return 'El código debe tener al menos 6 caracteres.';
      }
    }
    return '';
  }

  // Método para navegar al login manualmente
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Método para volver al registro
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
