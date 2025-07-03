import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menu } from "./components/menu/menu";
import { Footer } from "./components/footer/footer";
import { FlowbiteService } from './services/flowbite.service';
import { initFlowbite } from 'flowbite';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected title = 'book-social-ui';
  isAuthPage = false;

  constructor(
    private flowbiteService: FlowbiteService,
    private router: Router
  ) {
    // Detectar inmediatamente si es página de autenticación desde el constructor
    this.isAuthPage = this.checkIfAuthPage(this.router.url);
  }

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });

    // Detectar cambios de ruta para ocultar/mostrar menú
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAuthPage = this.checkIfAuthPage(event.url);
    });
  }

  private checkIfAuthPage(url: string): boolean {
    const authRoutes = ['/login', '/register', '/activate-account'];
    return authRoutes.some(route => url.includes(route));
  }
}
