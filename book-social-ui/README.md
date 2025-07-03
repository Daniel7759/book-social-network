# Book Social Network - Frontend

Sistema de red social para compartir libros desarrollado en Angular 20 con SSR (Server-Side Rendering).

## 🚀 Características implementadas

### Sistema de Autenticación
- ✅ **Login** con validación de formularios y manejo de errores
- ✅ **Registro** de nuevos usuarios
- ✅ **Activación de cuenta** mediante código de verificación
- ✅ **Mantención de sesión** tras recargar la página
- ✅ **JWT Token** decodificado para obtener información del usuario
- ✅ **Interceptor HTTP** para agregar automáticamente el token a las peticiones

### Interfaz de Usuario
- ✅ **Menú responsivo** con navegación principal
- ✅ **Información del usuario** mostrada en el menú (email/nombre)
- ✅ **Modo oscuro** soportado
- ✅ **Footer** con información adicional
- ✅ **Visibilidad condicional** de menú/footer según la ruta actual

### Gestión de Libros
- ✅ **Página principal (Home)** que muestra lista de libros disponibles
- ✅ **Componente BookCard** para mostrar información de cada libro
- ✅ **Paginación** para navegar entre páginas de libros
- ✅ **Funcionalidad de préstamo** de libros
- ✅ **Estados de carga y error** con feedback visual apropiado

### Arquitectura
- ✅ **Componentes standalone** de Angular
- ✅ **Lazy loading** de rutas para optimizar rendimiento
- ✅ **Guards de autenticación** para proteger rutas
- ✅ **Servicios generados** por ng-openapi-gen
- ✅ **TypeScript** con tipado fuerte

## 🛠 Tecnologías utilizadas

- **Angular 20** con SSR
- **TypeScript**
- **Tailwind CSS** para estilos
- **jwt-decode** para decodificación de tokens JWT
- **ng-openapi-gen** para generación de servicios API
- **RxJS** para programación reactiva

## 📦 Instalación y ejecución

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm

### Pasos para ejecutar

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <url-del-repositorio>
   cd book-social-ui
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   ```
   La aplicación estará disponible en `http://localhost:4200/`

4. **Compilar para producción**
   ```bash
   npm run build
   ```

## 🔧 Configuración

### Variables de entorno
Asegúrate de configurar la URL base del API en `src/app/services/api-configuration.ts`

### Servicios de API
Los servicios son generados automáticamente desde el esquema OpenAPI. Para regenerarlos:
```bash
ng-openapi-gen --input path/to/openapi.json --output src/app/services
```

## 📱 Estructura del proyecto

```
src/
├── app/
│   ├── components/           # Componentes reutilizables
│   │   ├── book-card/       # Componente para mostrar libros
│   │   ├── footer/          # Footer de la aplicación
│   │   └── menu/            # Menú de navegación
│   ├── pages/               # Páginas principales
│   │   ├── home/            # Página principal con lista de libros
│   │   ├── login/           # Página de inicio de sesión
│   │   ├── register/        # Página de registro
│   │   └── activate-account/ # Página de activación
│   ├── services/            # Servicios generados y personalizados
│   │   ├── auth.service.ts  # Servicio de autenticación
│   │   ├── models/          # Modelos de datos
│   │   └── services/        # Servicios API generados
│   └── guards/              # Guards de autenticación
└── ...
```

## 🎯 Funcionalidades principales

### Autenticación
- Login/logout seguro
- Registro de nuevos usuarios
- Activación de cuenta
- Persistencia de sesión
- Redirecciones automáticas

### Gestión de libros
- Visualización de libros disponibles
- Información detallada de cada libro (título, autor, sinopsis, rating)
- Funcionalidad de préstamo
- Paginación de resultados
- Estados de carga y error

### Navegación
- Menú principal con secciones
- Rutas protegidas por autenticación
- Lazy loading para optimización
- Responsive design

## 🚧 Pendientes por implementar

- Páginas específicas para "Mis Libros", "Mi Lista de Espera", etc.
- Página de detalles de libro individual
- Funcionalidad de subir nuevos libros
- Sistema de calificaciones y reseñas
- Perfil de usuario
- Búsqueda y filtros de libros

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios
4. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/nueva-funcionalidad`)
6. Crea un Pull Request
```

