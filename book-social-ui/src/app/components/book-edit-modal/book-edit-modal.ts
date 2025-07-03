import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookResponse } from '../../services/models/book-response';
import { BookService } from '../../services/services/book.service';

@Component({
  selector: 'app-book-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-edit-modal.html',
  styleUrl: './book-edit-modal.css'
})
export class BookEditModalComponent implements OnInit {
  @Input() book!: BookResponse;
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onBookUpdated = new EventEmitter<BookResponse>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  error: string | null = null;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Inicializar preview con la imagen actual del libro
    this.updatePreview();
  }

  private updatePreview(): void {
    if (this.book && this.book.cover) {
      // Si el cover ya es una URL data, usarla directamente
      if (this.book.cover.startsWith('data:image/')) {
        this.previewUrl = this.book.cover;
      } else {
        // Si es Base64 sin prefijo, agregarlo
        this.previewUrl = `data:image/jpeg;base64,${this.book.cover}`;
      }
    } else {
      this.previewUrl = null;
    }
  }

  /**
   * Maneja la selección de archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona una imagen válida.';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no puede ser mayor a 5MB.';
        return;
      }

      this.selectedFile = file;
      this.error = null;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Sube la portada del libro
   */
  uploadCover(): void {
    if (!this.selectedFile || !this.book.id) {
      return;
    }

    this.uploading = true;
    this.error = null;

    this.bookService.uploadBookCoverPicture({
      'book-id': this.book.id,
      body: {
        file: this.selectedFile
      }
    }).subscribe({
      next: (response) => {
        this.uploading = false;
        // Actualizar el libro con la nueva portada
        const updatedBook = { ...this.book, cover: this.previewUrl || undefined };
        this.onBookUpdated.emit(updatedBook);
        this.closeModal();
      },
      error: (error) => {
        this.uploading = false;
        console.error('Error al subir la portada:', error);
        this.error = 'Error al subir la imagen. Por favor, inténtalo de nuevo.';
      }
    });
  }

  /**
   * Elimina la imagen seleccionada
   */
  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = this.book?.cover || null;
    this.error = null;
    
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.selectedFile = null;
    this.previewUrl = this.book?.cover || null;
    this.error = null;
    this.uploading = false;
    this.onClose.emit();
  }

  /**
   * Maneja el clic en el overlay para cerrar el modal
   */
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Obtiene la URL de la imagen por defecto
   */
  getDefaultCover(): string {
    return 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Cover';
  }
}
