import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { UserInfo } from '../models/user-info';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  private userInfoSubject: BehaviorSubject<UserInfo | null>;
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    // Inicializar inmediatamente con el estado real
    const initialAuthState = this.hasValidToken();
    const initialUserInfo = this.getUserInfoFromToken();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(initialAuthState);
    this.userInfoSubject = new BehaviorSubject<UserInfo | null>(initialUserInfo);
    
    // Marcar como inicializado después de verificar el token
    this.initialized = true;
  }

  /**
   * Verifica si hay un token válido en el localStorage
   */
  private hasValidToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && this.isTokenValid(token);
  }

  /**
   * Verifica si el token es válido y no ha expirado
   */
  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<UserInfo>(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      if (decoded.exp && decoded.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar token:', error);
      return false;
    }
  }

  /**
   * Decodifica el token JWT y extrae la información del usuario
   */
  private decodeToken(token: string): UserInfo | null {
    try {
      const decoded = jwtDecode<UserInfo>(token);
      return decoded;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Obtiene la información del usuario desde el token almacenado
   */
  private getUserInfoFromToken(): UserInfo | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token && this.isTokenValid(token)) {
      return this.decodeToken(token);
    }
    return null;
  }

  /**
   * Guarda el token de autenticación y actualiza el estado
   */
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      const userInfo = this.decodeToken(token);
      this.isAuthenticatedSubject.next(true);
      this.userInfoSubject.next(userInfo);
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene la información del usuario actual
   */
  getUserInfo(): UserInfo | null {
    return this.userInfoSubject.value;
  }

  /**
   * Observable para la información del usuario
   */
  get userInfo$(): Observable<UserInfo | null> {
    return this.userInfoSubject.asObservable();
  }

  /**
   * Elimina el token y limpia la sesión
   */
  logout(): void {
    this.clearSession();
  }

  /**
   * Limpia completamente la sesión
   */
  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.isAuthenticatedSubject.next(false);
    this.userInfoSubject.next(null);
  }

  /**
   * Observable para suscribirse al estado de autenticación
   * Solo emite cuando el servicio está completamente inicializado
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Verifica si el usuario está autenticado (síncrono)
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtiene el header de autorización para las peticiones HTTP
   */
  getAuthorizationHeader(): string {
    const token = this.getToken();
    return token ? `Bearer ${token}` : '';
  }

  /**
   * Obtiene el email del usuario actual
   */
  getUserEmail(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.email || '';
  }

  /**
   * Obtiene el nombre completo del usuario actual
   */
  getUserFullName(): string {
    const userInfo = this.getUserInfo();
    if (!userInfo) return 'Usuario';
    
    // Intentar diferentes campos que pueden contener el nombre
    if (userInfo.fullName) return userInfo.fullName;
    if (userInfo.name) return userInfo.name;
    if (userInfo.given_name && userInfo.family_name) {
      return `${userInfo.given_name} ${userInfo.family_name}`;
    }
    if (userInfo.given_name) return userInfo.given_name;
    if (userInfo.preferred_username) return userInfo.preferred_username;
    
    // Si no hay nombre, usar la parte del email antes del @
    if (userInfo.email) {
      const emailPart = userInfo.email.split('@')[0];
      // Convertir formato como "john.doe" a "John Doe"
      return emailPart.split(/[._-]/).map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return 'Usuario';
  }

}
