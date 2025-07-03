import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/services/authentication.service';
import { RegistrationRequest } from '../../services/models/registration-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(1)]],
      lastname: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const registerRequest: RegistrationRequest = {
        firstname: this.registerForm.get('firstname')?.value,
        lastname: this.registerForm.get('lastname')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value
      };

      this.authService.register({
        body: registerRequest
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registro exitoso! Te hemos enviado un código de activación a tu email.';
          console.log('Registro exitoso:', response);
          
          // Redirigir a la página de activación después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/activate-account']);
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error en registro:', error);
          
          // Manejo de diferentes tipos de errores
          if (error.status === 400) {
            if (error.error?.message?.includes('email')) {
              this.errorMessage = 'Este email ya está registrado. Por favor, usa otro email.';
            } else {
              this.errorMessage = 'Datos inválidos. Por favor, revisa los campos ingresados.';
            }
          } else if (error.status === 409) {
            this.errorMessage = 'Este email ya está registrado. Por favor, usa otro email.';
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
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos auxiliares para validaciones en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'firstname': return 'El nombre es requerido.';
          case 'lastname': return 'El apellido es requerido.';
          case 'email': return 'El email es requerido.';
          case 'password': return 'La contraseña es requerida.';
          default: return 'Este campo es requerido.';
        }
      }
      if (field.errors['email']) {
        return 'Por favor, ingresa un email válido.';
      }
      if (field.errors['minlength']) {
        if (fieldName === 'password') {
          return 'La contraseña debe tener al menos 8 caracteres.';
        }
        return 'Este campo debe tener al menos 1 caracter.';
      }
    }
    return '';
  }

  // Método para navegar a la página de activación
  goToActivation(): void {
    this.router.navigate(['/activate-account']);
  }
}
