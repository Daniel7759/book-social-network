import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/services/book.service';
import { FeedbackService } from '../../services/services/feedback.service';
import { BookResponse } from '../../services/models/book-response';
import { FeedbackResponse } from '../../services/models/feedback-response';
import { FeedbackRequest } from '../../services/models/feedback-request';
import { PageResponseFeedbackResponse } from '../../services/models/page-response-feedback-response';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetailComponent implements OnInit, OnDestroy {
  book: BookResponse | null = null;
  feedbacks: FeedbackResponse[] = [];
  loading = false;
  loadingFeedbacks = false;
  submittingFeedback = false;
  checkingBorrowStatus = false;
  error: string | null = null;
  feedbackError: string | null = null;
  canLeaveFeedback = false;
  
  // Formulario de feedback
  newFeedback: FeedbackRequest = {
    bookId: 0,
    comment: '',
    note: 5
  };
  
  // Paginación de feedbacks
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private bookService: BookService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del libro de la ruta
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.newFeedback.bookId = parseInt(bookId, 10);
      this.loadBook();
      this.loadFeedbacks();
      
      // Verificar si el usuario puede dejar feedback (solo si está autenticado)
      if (this.authService.isAuthenticated) {
        this.checkBorrowStatus();
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBook(): void {
    this.loading = true;
    this.error = null;

    const subscription = this.bookService.findBookById({
      'book-id': this.newFeedback.bookId
    }).subscribe({
      next: (book: BookResponse) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el libro:', error);
        this.loading = false;
        if (error.status === 404) {
          this.error = 'Libro no encontrado.';
        } else if (error.status === 401 || error.status === 403) {
          this.error = 'Necesitas iniciar sesión para ver los detalles del libro.';
        } else {
          this.error = 'Error al cargar los detalles del libro.';
        }
      }
    });

    this.subscriptions.push(subscription);
  }

  loadFeedbacks(): void {
    this.loadingFeedbacks = true;
    this.feedbackError = null;

    const subscription = this.feedbackService.findAllFeedbacksByBook({
      'book-id': this.newFeedback.bookId,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response: PageResponseFeedbackResponse) => {
        this.feedbacks = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;
        this.loadingFeedbacks = false;
      },
      error: (error) => {
        console.error('Error al cargar feedbacks:', error);
        this.loadingFeedbacks = false;
        this.feedbacks = [];
        
        if (error.status === 401 || error.status === 403) {
          this.feedbackError = 'Necesitas iniciar sesión para ver los comentarios.';
        } else {
          this.feedbackError = 'Error al cargar los comentarios.';
        }
      }
    });

    this.subscriptions.push(subscription);
  }

  submitFeedback(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.canLeaveFeedback) {
      this.feedbackError = 'Solo puedes comentar libros que hayas pedido prestado.';
      return;
    }

    if (!this.newFeedback.comment.trim()) {
      this.feedbackError = 'El comentario es obligatorio.';
      return;
    }

    this.submittingFeedback = true;
    this.feedbackError = null;

    const subscription = this.feedbackService.saveFeedback({
      body: this.newFeedback
    }).subscribe({
      next: (feedbackId: number) => {
        console.log('Feedback guardado exitosamente:', feedbackId);
        this.submittingFeedback = false;
        
        // Limpiar formulario
        this.newFeedback.comment = '';
        this.newFeedback.note = 5;
        
        // Recargar feedbacks para mostrar el nuevo
        this.currentPage = 0;
        this.loadFeedbacks();
        
        // Mostrar mensaje de éxito
        alert('¡Comentario guardado exitosamente!');
      },
      error: (error) => {
        console.error('Error al guardar feedback:', error);
        this.submittingFeedback = false;
        
        if (error.status === 400) {
          this.feedbackError = 'Ya has comentado este libro anteriormente.';
        } else if (error.status === 401 || error.status === 403) {
          this.feedbackError = 'No tienes permisos para comentar este libro.';
        } else {
          this.feedbackError = 'Error al guardar el comentario. Inténtalo de nuevo.';
        }
      }
    });

    this.subscriptions.push(subscription);
  }

  onBorrowBook(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.book?.id) {
      console.error('ID del libro no disponible');
      return;
    }

    const subscription = this.bookService.borrowBook({ 'book-id': this.book.id }).subscribe({
      next: (borrowId) => {
        console.log('Libro prestado exitosamente:', borrowId);
        alert('¡Libro prestado exitosamente!');
        // Actualizar el estado del libro
        this.loadBook();
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

    this.subscriptions.push(subscription);
  }

  addToWaitlist(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.book) {
      return;
    }

    // Por ahora mostrar un mensaje de confirmación
    // TODO: Implementar servicio de lista de espera
    alert(`"${this.book.title}" se agregará a tu lista de espera cuando esté disponible el servicio.`);
    
    console.log('Agregando a lista de espera:', this.book.title);
  }

  goToFeedbackPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadFeedbacks();
    }
  }

  getBookCover(): string {
    if (this.book?.cover) {
      // Si ya es una URL completa, la devolvemos tal como está
      if (this.book.cover.startsWith('http://') || this.book.cover.startsWith('https://')) {
        return this.book.cover;
      }
      
      // Si ya tiene el prefijo data:image, la devolvemos tal como está
      if (this.book.cover.startsWith('data:image/')) {
        return this.book.cover;
      }
      
      // Si es Base64 sin prefijo, agregamos el prefijo data:image/jpg;base64,
      return 'data:image/jpg;base64,' + this.book.cover;
    }
    
    // Imagen por defecto si no hay portada
    return 'https://via.placeholder.com/400x600/6366f1/ffffff?text=No+Cover';
  }

  getStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/400x600/6366f1/ffffff?text=No+Cover';
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  checkBorrowStatus(): void {
    this.checkingBorrowStatus = true;
    this.canLeaveFeedback = false;

    // Buscar en todos los libros prestados si incluye este libro
    const subscription = this.bookService.findAllBorrowedBooks({
      page: 0,
      size: 1000 // Un número alto para obtener todos los prestados
    }).subscribe({
      next: (response) => {
        const borrowedBooks = response.content || [];
        // Verificar si el libro actual está en la lista de libros prestados
        const hasBorrowedThisBook = borrowedBooks.some(borrowedBook => 
          borrowedBook.id === this.newFeedback.bookId
        );
        
        this.canLeaveFeedback = hasBorrowedThisBook;
        this.checkingBorrowStatus = false;
      },
      error: (error) => {
        console.error('Error al verificar estado de préstamo:', error);
        this.checkingBorrowStatus = false;
        this.canLeaveFeedback = false;
      }
    });

    this.subscriptions.push(subscription);
  }
}
