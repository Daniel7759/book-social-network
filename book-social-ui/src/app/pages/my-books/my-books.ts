import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/services/book.service';
import { BookCardComponent } from '../../components/book-card/book-card';
import { BookEditModalComponent } from '../../components/book-edit-modal/book-edit-modal';
import { BookResponse } from '../../services/models/book-response';
import { PageResponseBookResponse } from '../../services/models/page-response-book-response';
import { BookAddModalComponent } from '../../components/book-add-modal/book-add-modal';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent, BookEditModalComponent, BookAddModalComponent],
  templateUrl: './my-books.html',
  styleUrl: './my-books.css'
})
export class MyBooksComponent implements OnInit {
  books: BookResponse[] = [];
  filteredBooks: BookResponse[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalElements = 0;
  
  // Filters
  filterType: 'all' | 'available' | 'borrowed' | 'archived' = 'all';
  searchQuery = '';

  // Edit modal
  selectedBook: BookResponse | null = null;
  isEditModalOpen = false;

  // Add modal
  isAddModalOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    // Simplemente cargar los libros - los guards se encargan de la autenticación
    this.loadMyBooks();
  }

  loadMyBooks(): void {
    this.loading = true;
    this.error = null;

    this.bookService.findAllBooksByOwner({
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (response: PageResponseBookResponse) => {
        this.books = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;
        this.loading = false;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error al cargar mis libros:', error);
        this.error = 'Error al cargar tus libros. Por favor, inténtalo de nuevo.';
        this.loading = false;
        this.books = [];
        this.filteredBooks = [];
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.books];

    // Aplicar filtro de tipo
    if (this.filterType === 'available') {
      filtered = filtered.filter(book => book.shareable && !book.archived);
    } else if (this.filterType === 'borrowed') {
      // Para "prestados" podríamos usar otra lógica o property si existiera
      filtered = filtered.filter(book => !book.shareable); // Temporal
    } else if (this.filterType === 'archived') {
      filtered = filtered.filter(book => book.archived);
    }

    // Aplicar filtro de búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(book => 
        book.title?.toLowerCase().includes(query) ||
        book.authorName?.toLowerCase().includes(query) ||
        book.isbn?.toLowerCase().includes(query)
      );
    }

    this.filteredBooks = filtered;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMyBooks();
    }
  }

  getAvailableCount(): number {
    return this.books.filter(book => book.shareable && !book.archived).length;
  }

  getBorrowedCount(): number {
    return this.books.filter(book => !book.shareable && !book.archived).length;
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery.trim()) {
      return 'No se encontraron libros';
    }
    
    switch (this.filterType) {
      case 'available':
        return 'No tienes libros disponibles';
      case 'borrowed':
        return 'No tienes libros prestados';
      case 'archived':
        return 'No tienes libros archivados';
      default:
        return 'Aún no has agregado libros';
    }
  }

  getEmptyStateDescription(): string {
    if (this.searchQuery.trim()) {
      return 'Intenta con otros términos de búsqueda';
    }
    
    switch (this.filterType) {
      case 'available':
        return 'Marca algunos libros como compartibles para que aparezcan aquí';
      case 'borrowed':
        return 'Los libros que prestes a otros usuarios aparecerán aquí';
      case 'archived':
        return 'Los libros archivados aparecerán aquí';
      default:
        return 'Comienza agregando tu primer libro a la biblioteca';
    }
  }

  addNewBook(): void {
    console.log('Abriendo modal de agregar libro...');
    this.isAddModalOpen = true;
    console.log('isAddModalOpen:', this.isAddModalOpen);
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  onBookAdded(newBook: BookResponse): void {
    // Agregar el nuevo libro a la lista local
    this.books.unshift(newBook); // Lo agregamos al inicio
    this.totalElements++;
    this.applyFilter(); // Reaplica los filtros
    
    // Mostrar mensaje de éxito
    alert('¡Libro agregado exitosamente!');
  }

  onEditBook(book: BookResponse): void {
    this.selectedBook = book;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedBook = null;
  }

  onBookUpdated(updatedBook: BookResponse): void {
    // Actualizar el libro en la lista local
    const index = this.books.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      this.books[index] = updatedBook;
      this.applyFilter(); // Reaplica los filtros
    }
    
    // Mostrar mensaje de éxito
    alert('¡Portada actualizada exitosamente!');
  }

  onArchiveBook(book: BookResponse): void {
    if (!book.id) {
      console.error('ID del libro no disponible');
      return;
    }

    const action = book.archived ? 'desarchivar' : 'archivar';
    const confirmMessage = `¿Estás seguro de que quieres ${action} "${book.title}"?`;
    
    if (confirm(confirmMessage)) {
      // Por ahora solo simulamos la acción ya que el botón es solo visual
      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} libro:`, book);
      alert(`Funcionalidad de ${action} libro en desarrollo.\n\nEsto permitirá ${action} el libro "${book.title}" de tu biblioteca.\n\n¡Próximamente disponible!`);
      
      // Cuando se implemente realmente, descomentar esto:
      /*
      this.bookService.updateArchivedStatus({ 'book-id': book.id }).subscribe({
        next: (response) => {
          console.log(`Libro ${action}do exitosamente:`, response);
          alert(`¡Libro ${action}do exitosamente!`);
          this.loadMyBooks();
        },
        error: (error) => {
          console.error(`Error al ${action} el libro:`, error);
          alert(`Error al ${action} el libro. Por favor, inténtalo de nuevo.`);
        }
      });
      */
    }
  }

  openAddBookModal(): void {
    console.log('openAddBookModal llamado');
    this.addNewBook();
  }
}
