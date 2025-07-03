import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/services/authentication.service';
import { AuthService } from '../../services/auth.service';
import { AuthenticateRequest } from '../../services/models/authenticate-request';
import { AuthenticationResponse } from '../../services/models/authentication-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const loginRequest: AuthenticateRequest = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authenticationService.authenticate({
        body: loginRequest
      }).subscribe({
        next: (response: AuthenticationResponse) => {
          this.isLoading = false;
          if (response.token) {
            // Guardar el token usando el servicio de autenticación
            this.authService.setToken(response.token);
            console.log('Login exitoso! Token guardado:', response.token);
            
            // Redirigir a la página principal
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = 'No se recibió un token válido del servidor.';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error en login:', error);
          
          // Manejo de diferentes tipos de errores
          if (error.status === 401) {
            this.errorMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
          } else if (error.status === 400) {
            this.errorMessage = 'Datos inválidos. Por favor, revisa los campos ingresados.';
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
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos auxiliares para validaciones en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'email' ? 'El email' : 'La contraseña'} es requerida.`;
      }
      if (field.errors['email']) {
        return 'Por favor, ingresa un email válido.';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres.';
      }
    }
    return '';
  }
}
