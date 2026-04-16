# Admin Service - Servicio de Administración

Microservicio de funciones administrativas para el sistema de préstamos, construido con **NestJS**, **TypeScript** y **arquitectura hexagonal**.

## Descripción

Este microservicio forma parte del sistema [loans-software](https://github.com/JuanPar063/loans-software) y provee las funcionalidades administrativas del sistema: gestión de administradores, supervisión de préstamos, reportes y configuración del sistema.

## Arquitectura Hexagonal

```
src/
├── application/
│   └── services/          # Casos de uso administrativos
├── domain/                # Entidades y puertos (interfaces)
├── infrastructure/        # Controladores REST, repositorios, conexión DB
└── migrations/            # Migraciones de base de datos
```

## Tecnologías Utilizadas

- **NestJS** – Framework Node.js para el backend
- - **TypeScript** – Tipado estático
  - - **PostgreSQL** – Base de datos relacional
    - - **Docker** – Contenedorización
      - - **Jest** – Testing
       
        - ## Funcionalidades
       
        - - Gestión de roles y permisos de administradores
          - - Supervisión y aprobación de préstamos
            - - Generación de reportes del sistema
              - - Configuración de parámetros del sistema de préstamos
                - - Panel de control administrativo
                 
                  - ## Instalación
                 
                  - ```bash
                    npm install
                    ```

                    ## Ejecución

                    ```bash
                    # Desarrollo
                    npm run start:dev

                    # Producción
                    npm run start:prod
                    ```

                    ## Tests

                    ```bash
                    npm run test
                    npm run test:e2e
                    npm run test:cov
                    ```

                    ## Parte del Ecosistema

                    - [loans-software](https://github.com/JuanPar063/loans-software) – Orquestador principal
                    - - [user-service](https://github.com/JuanPar063/user-service) – Servicio de usuarios
                      - - [loan-service](https://github.com/JuanPar063/loan-service) – Servicio de préstamos
                        - - [loans-frontend](https://github.com/JuanPar063/loans-frontend) – Frontend
                         
                          - ## Autor
                         
                          - Juan Sebastian Pardo Anzola – [@JuanPar063](https://github.com/JuanPar063)
