import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookResponse } from '../../services/models/book-response';
import { BookRequest } from '../../services/models/book-request';
import { BookService } from '../../services/services/book.service';

@Component({
  selector: 'app-book-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-add-modal.html',
  styleUrl: './book-add-modal.css'
})
export class BookAddModalComponent {
  @Input() set isOpen(value: boolean) {
    console.log('Modal isOpen cambió a:', value);
    this._isOpen = value;
  }
  
  get isOpen(): boolean {
    return this._isOpen;
  }
  
  private _isOpen = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onBookAdded = new EventEmitter<BookResponse>();

  // Formulario
  bookData: BookRequest = {
    tittle: '',
    authorName: '',
    isbn: '',
    synopsis: '',
    shareable: true
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  error: string | null = null;

  // Validaciones
  titleError = '';
  authorError = '';
  isbnError = '';

  constructor(private bookService: BookService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido.';
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no puede ser mayor a 5MB.';
        return;
      }

      this.selectedFile = file;
      this.error = null;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  validateForm(): boolean {
    let isValid = true;

    // Validar título
    if (!this.bookData.tittle?.trim()) {
      this.titleError = 'El título es requerido';
      isValid = false;
    } else if (this.bookData.tittle.length < 2) {
      this.titleError = 'El título debe tener al menos 2 caracteres';
      isValid = false;
    } else {
      this.titleError = '';
    }

    // Validar autor
    if (!this.bookData.authorName?.trim()) {
      this.authorError = 'El autor es requerido';
      isValid = false;
    } else if (this.bookData.authorName.length < 2) {
      this.authorError = 'El nombre del autor debe tener al menos 2 caracteres';
      isValid = false;
    } else {
      this.authorError = '';
    }

    // Validar ISBN (opcional pero con formato si se proporciona)
    if (this.bookData.isbn?.trim()) {
      const isbnRegex = /^(?:\d{10}|\d{13}|[\d-]{13,17})$/;
      if (!isbnRegex.test(this.bookData.isbn.replace(/[-\s]/g, ''))) {
        this.isbnError = 'El formato del ISBN no es válido';
        isValid = false;
      } else {
        this.isbnError = '';
      }
    } else {
      this.isbnError = '';
    }

    return isValid;
  }

  async saveBook(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // 1. Crear el libro primero (devuelve el ID del libro)
      const bookId = await this.bookService.saveBook({ body: this.bookData }).toPromise();
      
      if (!bookId) {
        throw new Error('Error al crear el libro');
      }

      // 2. Si hay una imagen, subirla
      if (this.selectedFile && bookId) {
        try {
          await this.uploadBookCover(bookId);
        } catch (coverError) {
          console.warn('Error al subir la portada:', coverError);
          // El libro se creó pero falló la portada, continuamos
        }
      }

      // 3. Obtener el libro completo con todos los datos
      const finalBook = await this.bookService.findBookById({ 'book-id': bookId }).toPromise();
      
      if (!finalBook) {
        throw new Error('Error al obtener el libro creado');
      }

      // 4. Emitir evento de libro creado
      this.onBookAdded.emit(finalBook);
      this.closeModal();

    } catch (error: any) {
      console.error('Error al guardar el libro:', error);
      this.error = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private async uploadBookCover(bookId: number): Promise<void> {
    if (!this.selectedFile) return;

    await this.bookService.uploadBookCoverPicture({
      'book-id': bookId,
      body: { file: this.selectedFile }
    }).toPromise();
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 400) {
      return 'Datos inválidos. Por favor verifica la información ingresada.';
    } else if (error?.status === 409) {
      return 'Ya existe un libro con este ISBN.';
    } else if (error?.status === 413) {
      return 'La imagen es demasiado grande. Máximo 5MB.';
    } else if (error?.status === 422) {
      return 'El formato de imagen no es válido.';
    } else if (error?.status >= 500) {
      return 'Error del servidor. Por favor intenta más tarde.';
    } else {
      return error?.message || 'Error inesperado al guardar el libro.';
    }
  }

  closeModal(): void {
    this.resetForm();
    this.onClose.emit();
  }

  private resetForm(): void {
    this.bookData = {
      tittle: '',
      authorName: '',
      isbn: '',
      synopsis: '',
      shareable: true
    };
    this.selectedFile = null;
    this.previewUrl = null;
    this.error = null;
    this.titleError = '';
    this.authorError = '';
    this.isbnError = '';
    this.loading = false;
  }

  // Método para cerrar modal al hacer clic en el overlay
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
