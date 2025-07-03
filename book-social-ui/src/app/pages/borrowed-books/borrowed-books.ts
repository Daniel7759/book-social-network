import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/services/book.service';
import { BorrowedBookResponse } from '../../services/models/borrowed-book-response';
import { PageResponseBorrowedBookResponse } from '../../services/models/page-response-borrowed-book-response';

@Component({
  selector: 'app-borrowed-books',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './borrowed-books.html',
  styleUrl: './borrowed-books.css'
})
export class BorrowedBooksComponent implements OnInit, OnDestroy {
  borrowedBooks: BorrowedBookResponse[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginación
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalElements = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadBorrowedBooks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBorrowedBooks(): void {
    this.loading = true;
    this.error = null;

    const subscription = this.bookService.findAllBorrowedBooks({
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response: PageResponseBorrowedBookResponse) => {
        this.borrowedBooks = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar libros prestados:', error);
        this.loading = false;
        this.borrowedBooks = [];
        
        if (error.status === 401 || error.status === 403) {
          this.error = 'No tienes permisos para ver esta información.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error al cargar los libros prestados. Por favor, inténtalo de nuevo.';
        }
      }
    });

    this.subscriptions.push(subscription);
  }

  returnBook(book: BorrowedBookResponse): void {
    if (!book.id) {
      console.error('ID del libro no disponible');
      alert('Error: ID del libro no disponible.');
      return;
    }

    if (book.returned) {
      alert('Este libro ya ha sido retornado.');
      return;
    }

    if (book.returnApproved) {
      alert('El retorno de este libro ya ha sido aprobado.');
      return;
    }

    // Verificación adicional usando canReturnBook
    if (!this.canReturnBook(book)) {
      alert('No puedes retornar este libro en este momento.');
      return;
    }

    const confirmReturn = confirm(
      `¿Estás seguro de que quieres retornar "${book.title}"?\n\n` +
      `Una vez que envíes la solicitud de retorno, estará pendiente de aprobación por el propietario del libro.`
    );
    
    if (!confirmReturn) {
      return;
    }

    // Agregar estado de carga para este libro específico
    const originalTitle = book.title;
    
    console.log('Intentando retornar libro:', {
      bookId: book.id,
      title: book.title,
      returned: book.returned,
      returnApproved: book.returnApproved,
      fullBookObject: book
    });
    
    const subscription = this.bookService.returnBorrowBook({
      'book-id': book.id
    }).subscribe({
      next: (returnId) => {
        console.log('Libro retornado exitosamente:', returnId);
        
        // Mostrar mensaje de éxito más informativo
        alert(
          `¡Libro "${originalTitle}" marcado para retorno exitosamente!\n\n` +
          `El retorno está ahora pendiente de aprobación por el propietario. ` +
          `Recibirás una notificación cuando sea aprobado.`
        );
        
        // Recargar la lista para actualizar el estado
        this.loadBorrowedBooks();
      },
      error: (error) => {
        console.error('Error al retornar el libro:', error);
        let errorMessage = 'Error al retornar el libro.';
        
        if (error.status === 400) {
          // Verificar el mensaje específico del error
          if (error.error && error.error.error === 'You did not borrow this book') {
            errorMessage = 'No puedes retornar este libro porque no aparece como prestado por ti. Puede que ya haya sido procesado o hubo un error en los datos.';
          } else {
            errorMessage = 'No puedes retornar este libro en este momento. Puede que ya esté marcado para retorno.';
          }
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (error.status === 404) {
          errorMessage = 'El libro no fue encontrado. Puede que ya haya sido procesado.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Por favor, inténtalo de nuevo más tarde.';
        }
        
        alert(`Error al retornar "${originalTitle}": ${errorMessage}`);
        
        // Recargar la lista para asegurar que los datos estén actualizados
        this.loadBorrowedBooks();
      }
    });

    this.subscriptions.push(subscription);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadBorrowedBooks();
    }
  }

  getStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= (rating || 0));
    }
    return stars;
  }

  getStatusText(book: BorrowedBookResponse): string {
    if (book.returnApproved && book.returned) {
      return 'Retorno Aprobado';
    } else if (book.returned) {
      return 'Pendiente de Aprobación';
    } else {
      return 'En Préstamo';
    }
  }

  getStatusClass(book: BorrowedBookResponse): string {
    if (book.returnApproved && book.returned) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else if (book.returned) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    } else {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  }

  canReturnBook(book: BorrowedBookResponse): boolean {
    return !book.returned && !book.returnApproved;
  }

  getActiveBooksCount(): number {
    return this.borrowedBooks.filter(book => !book.returned).length;
  }

  getReturnedBooksCount(): number {
    return this.borrowedBooks.filter(book => book.returned).length;
  }

  viewBookDetail(bookId: number): void {
    this.router.navigate(['/book', bookId]);
  }

  // showBookDetails method removed - debug completed
}
