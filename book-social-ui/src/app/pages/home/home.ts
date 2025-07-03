import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/services/book.service';
import { BookCardComponent } from '../../components/book-card/book-card';
import { BookResponse } from '../../services/models/book-response';
import { PageResponseBookResponse } from '../../services/models/page-response-book-response';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, BookCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  books: BookResponse[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalElements = 0;
  
  private authSubscription?: Subscription;
  isAuthStateInitialized = false;
  private currentAuthState = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    // Suscribirse al estado de autenticación para detectar cambios
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      const authStateChanged = this.isAuthStateInitialized && this.currentAuthState !== isAuthenticated;
      
      this.currentAuthState = isAuthenticated;
      
      if (!this.isAuthStateInitialized) {
        // Primera inicialización: cargar libros después de determinar el estado
        this.isAuthStateInitialized = true;
        this.loadBooks();
      } else if (authStateChanged) {
        // El estado cambió (login/logout): recargar libros
        this.currentPage = 0; // Resetear a la primera página
        this.loadBooks();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadBooks(): void {
    this.loading = true;
    this.error = null;

    // Usar el estado de autenticación interno que ya está determinado
    const bookRequest = this.currentAuthState 
      ? this.bookService.findAllBooks({
          page: this.currentPage,
          size: this.pageSize
        })
      : this.bookService.findAllBooksPublic({
          page: this.currentPage,
          size: this.pageSize
        });

    bookRequest.subscribe({
      next: (response: PageResponseBookResponse) => {
        this.books = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar libros:', error);
        this.loading = false;
        this.books = [];
        
        // Solo mostrar error real, no mensaje de autenticación
        // ya que ahora usamos endpoint público cuando no está autenticado
        this.error = 'Error al cargar los libros. Por favor, inténtalo de nuevo.';
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadBooks();
    }
  }

  isAuthenticated(): boolean {
    return this.currentAuthState;
  }

  onBorrowBook(book: BookResponse): void {
    // Verificar si el usuario está autenticado
    if (!this.currentAuthState) {
      // Redirigir al login si no está autenticado
      this.router.navigate(['/login']);
      return;
    }

    if (!book.id) {
      console.error('ID del libro no disponible');
      return;
    }

    this.bookService.borrowBook({ 'book-id': book.id }).subscribe({
      next: (borrowId) => {
        console.log('Libro prestado exitosamente:', borrowId);
        // Mostrar mensaje de éxito
        alert('¡Libro prestado exitosamente!');
        // Recargar la lista para actualizar el estado
        this.loadBooks();
      },
      error: (error) => {
        console.error('Error al pedir prestado el libro:', error);
        let errorMessage = 'Error al pedir prestado el libro.';
        
        if (error.status === 400) {
          errorMessage = 'No puedes pedir prestado tu propio libro o el libro no está disponible.';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        }
        
        alert(errorMessage);
      }
    });
  }

  onViewBookDetails(book: BookResponse): void {
    // Navegar a la página de detalle del libro
    if (book.id) {
      this.router.navigate(['/book', book.id]);
    } else {
      console.error('ID del libro no disponible');
    }
  }

  onAddToWaitlist(book: BookResponse): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    // Por ahora mostrar un mensaje de confirmación
    // TODO: Implementar servicio de lista de espera
    alert(`"${book.title}" se agregará a tu lista de espera cuando esté disponible el servicio.`);
    
    console.log('Agregando a lista de espera:', book.title);
  }

  getTokenPreview(): string {
    const token = this.authService.getToken();
    if (token && token.length > 20) {
      return token.substring(0, 20) + '...';
    }
    return token || 'No token';
  }

  getUserEmail(): string {
    return this.authService.getUserEmail();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
