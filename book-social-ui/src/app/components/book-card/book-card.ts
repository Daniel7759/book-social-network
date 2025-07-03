import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookResponse } from '../../services/models/book-response';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css'
})
export class BookCardComponent {
  @Input() book!: BookResponse;
  @Input() showActions = true;
  @Input() isOwner = false; // Nueva propiedad para indicar si es el propietario
  @Output() onBorrow = new EventEmitter<BookResponse>();
  @Output() onViewDetails = new EventEmitter<BookResponse>();
  @Output() onEdit = new EventEmitter<BookResponse>(); // Nuevo evento para editar
  @Output() onArchive = new EventEmitter<BookResponse>(); // Nuevo evento para archivar
  @Output() onAddToWaitlist = new EventEmitter<BookResponse>(); // Nuevo evento para agregar a lista de espera

  constructor() {}

  /**
   * Obtiene la URL de la imagen de portada o una imagen por defecto
   */
  getBookCover(): string {
    if (this.book.cover) {
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
    return 'https://via.placeholder.com/200x280/6366f1/ffffff?text=No+Cover';
  }

  /**
   * Genera un array de estrellas para mostrar la calificación
   */
  getStars(): boolean[] {
    const rating = this.book.rate || 0;
    return Array(5).fill(false).map((_, index) => index < Math.floor(rating));
  }

  /**
   * Obtiene la calificación como string
   */
  getRatingText(): string {
    const rating = this.book.rate || 0;
    return rating > 0 ? rating.toFixed(1) : 'Sin calificar';
  }

  /**
   * Trunca el texto si es muy largo
   */
  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Emite evento para pedir prestado el libro
   */
  borrowBook(): void {
    this.onBorrow.emit(this.book);
  }

  /**
   * Emite evento para ver detalles del libro
   */
  viewDetails(): void {
    this.onViewDetails.emit(this.book);
  }

  /**
   * Emite evento para editar el libro
   */
  editBook(): void {
    this.onEdit.emit(this.book);
  }

  /**
   * Emite evento para archivar/desarchivar el libro
   */
  toggleArchive(): void {
    this.onArchive.emit(this.book);
  }

  /**
   * Emite evento para agregar el libro a la lista de espera
   */
  addToWaitlist(): void {
    this.onAddToWaitlist.emit(this.book);
  }

  /**
   * Verifica si el libro está disponible para préstamo
   */
  isAvailable(): boolean {
    return this.book.shareable === true && this.book.archived === false;
  }

  /**
   * Detecta el tipo MIME de una imagen Base64 basándose en su signature
   */
  private detectImageType(base64String: string): string {
    // Tomamos los primeros caracteres del Base64 para detectar el tipo
    const signatures: { [key: string]: string } = {
      '/9j/': 'image/jpeg',
      'iVBORw0': 'image/png',
      'R0lGOD': 'image/gif',
      'UklGRg': 'image/webp',
      'Qk0': 'image/bmp'
    };

    for (const [signature, mimeType] of Object.entries(signatures)) {
      if (base64String.startsWith(signature)) {
        return mimeType;
      }
    }

    // Por defecto, asumimos JPEG
    return 'image/jpeg';
  }

  /**
   * Maneja el evento de carga exitosa de la imagen
   */
  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('book-cover-loaded');
    img.classList.remove('loading');
  }

  /**
   * Maneja el evento de error al cargar la imagen
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn('Error al cargar la imagen del libro:', this.book.title);
    
    // Fallback a imagen por defecto
    img.src = 'https://via.placeholder.com/200x280/6366f1/ffffff?text=No+Cover';
    img.alt = `${this.book.title} - Sin portada`;
  }
}
