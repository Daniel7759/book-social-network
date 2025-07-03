import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/services/book.service';
import { BorrowedBookResponse } from '../../services/models/borrowed-book-response';
import { PageResponseBorrowedBookResponse } from '../../services/models/page-response-borrowed-book-response';

@Component({
  selector: 'app-returned-books',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './returned-books.html',
  styleUrl: './returned-books.css'
})
export class ReturnedBooksComponent implements OnInit, OnDestroy {
  returnedBooks: BorrowedBookResponse[] = [];
  loading = false;
  error: string | null = null;
  
  // Paginación
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalElements = 0;
  
  private subscriptions: Subscription[] = [];
  
  // Hacer Math disponible en el template
  Math = Math;

  constructor(
    private authService: AuthService,
    public router: Router, // Cambiar a public para usarlo en el template
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadReturnedBooks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadReturnedBooks(): void {
    this.loading = true;
    this.error = null;

    const subscription = this.bookService.findAllReturnedBooks({
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response: PageResponseBorrowedBookResponse) => {
        this.returnedBooks = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar libros retornados:', error);
        this.loading = false;
        this.returnedBooks = [];
        
        if (error.status === 401 || error.status === 403) {
          this.error = 'No tienes permisos para ver esta información.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error al cargar los libros retornados. Por favor, inténtalo de nuevo.';
        }
      }
    });

    this.subscriptions.push(subscription);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadReturnedBooks();
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

  getPendingApprovalCount(): number {
    return this.returnedBooks.filter(book => book.returned && !book.returnApproved).length;
  }

  getApprovedCount(): number {
    return this.returnedBooks.filter(book => book.returned && book.returnApproved).length;
  }

  viewBookDetail(bookId: number): void {
    this.router.navigate(['/book', bookId]);
  }

  approveReturn(book: BorrowedBookResponse): void {
    if (!book.id) {
      console.error('ID del libro no disponible');
      alert('Error: ID del libro no disponible.');
      return;
    }

    if (!book.returned) {
      alert('Este libro no ha sido marcado para retorno.');
      return;
    }

    if (book.returnApproved) {
      alert('El retorno de este libro ya ha sido aprobado.');
      return;
    }

    const confirmApproval = confirm(
      `¿Estás seguro de que quieres aprobar el retorno de "${book.title}"?\n\n` +
      `Una vez aprobado, el libro estará disponible para ser prestado nuevamente.`
    );
    
    if (!confirmApproval) {
      return;
    }

    const originalTitle = book.title;
    
    console.log('Aprobando retorno del libro:', {
      bookId: book.id,
      title: book.title,
      returned: book.returned,
      returnApproved: book.returnApproved
    });
    
    const subscription = this.bookService.approveReturnBorrowBook({
      'book-id': book.id
    }).subscribe({
      next: (approvalId) => {
        console.log('Retorno aprobado exitosamente:', approvalId);
        
        // Mostrar mensaje de éxito
        alert(
          `¡Retorno de "${originalTitle}" aprobado exitosamente!\n\n` +
          `El libro está ahora disponible para ser prestado nuevamente.`
        );
        
        // Recargar la lista para actualizar el estado
        this.loadReturnedBooks();
      },
      error: (error) => {
        console.error('Error al aprobar el retorno:', error);
        let errorMessage = 'Error al aprobar el retorno.';
        
        if (error.status === 400) {
          errorMessage = 'No puedes aprobar este retorno. Puede que ya haya sido procesado.';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para aprobar este retorno. Solo el dueño del libro puede aprobarlo.';
        } else if (error.status === 404) {
          errorMessage = 'El libro no fue encontrado. Puede que ya haya sido procesado.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Por favor, inténtalo de nuevo más tarde.';
        }
        
        alert(`Error al aprobar retorno de "${originalTitle}": ${errorMessage}`);
      }
    });

    this.subscriptions.push(subscription);
  }

  canApproveReturn(book: BorrowedBookResponse): boolean {
    // Solo mostrar el botón si el libro está retornado pero no aprobado
    // El backend determinará si el usuario es el dueño del libro
    return book.returned === true && book.returnApproved === false;
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getPageDisplay(pageNum: number): number {
    return pageNum + 1;
  }
}
