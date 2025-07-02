# Book Social Network

Una plataforma social desarrollada con Spring Boot que permite a los usuarios compartir, prestar y gestionar libros dentro de una comunidad en red .

## 🚀 Características Principales

- **Gestión de Usuarios**: Registro con activación por email y autenticación JWT
- **Gestión de Libros**: CRUD completo con subida de portadas
- **Sistema de Préstamos**: Workflow de préstamo y devolución de libros
- **Sistema Social**: Feedback, calificaciones y descubrimiento de libros
- **Seguridad**: Control de acceso basado en roles

## 🛠️ Stack Tecnológico

- **Framework**: Spring Boot 3.5.0
- **Lenguaje**: Java 17
- **Base de Datos**: PostgreSQL
- **Seguridad**: Spring Security + JWT
- **ORM**: Spring Data JPA
- **Email**: Spring Boot Mail
- **Documentación**: SpringDoc OpenAPI
- **Build**: Maven

## 📋 Dependencias Principales

```xml
<!-- Spring Boot Starters -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura en capas con separación clara de responsabilidades:

- **Capa de Presentación**: Controladores REST
- **Capa de Servicio**: Lógica de negocio
- **Capa de Acceso a Datos**: Repositorios JPA
- **Capa de Dominio**: Entidades y DTOs

## 🚦 Instalación y Configuración

### Prerrequisitos

- Java 17 o superior
- Maven 3.x
- PostgreSQL
- Servidor SMTP (para emails)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Daniel7759/book-social-network.git
cd book-social-network
```

2. **Configurar la base de datos**
```properties
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/book_social_network
    username: your_username
    password: your_password
```

3. **Configurar el servicio de email**
```properties
spring:
  mail:
    host: your_smtp_host
    port: 587
    username: your_email
    password: your_password
```

4. **Ejecutar la aplicación**
```bash
mvn spring-boot:run
```

## 📚 Funcionalidades del Sistema

### Autenticación y Autorización
- Registro de usuarios con validación por email
- Login con JWT tokens
- Sistema de roles automático

### Gestión de Libros
- Crear, leer, actualizar y eliminar libros
- Subida de portadas de libros
- Control de visibilidad y archivado

### Sistema de Préstamos
- Solicitar préstamo de libros
- Aprobar/rechazar solicitudes
- Historial de transacciones
- Sistema de devoluciones

### Interacciones Sociales
- Sistema de feedback y calificaciones
- Descubrimiento de libros de la comunidad
- Perfil de usuario con libros propios

## 🔧 Configuración Adicional

La aplicación incluye configuración automática para:
- Auditoría JPA habilitada
- Procesamiento asíncrono
- Inicialización automática de roles

## 📖 Documentación API

Una vez ejecutada la aplicación, la documentación de la API estará disponible en:
```
http://localhost:8080/swagger-ui.html
```
## 🙏 Agradecimientos

Este proyecto ha sido desarrollado siguiendo el excelente curso de [Ali Bouali](https://www.youtube.com/@boualiali), a quien agradezco por compartir su conocimiento y guiar paso a paso en la creación de aplicaciones seguras con Spring Boot.