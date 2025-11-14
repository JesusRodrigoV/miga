# Configuración de Angular con Bun

Este repositorio contiene la configuración base para proyectos Angular utilizando **Bun** como runtime y gestor de paquetes.

## Stack Tecnológico

- **Angular** - Framework principal para aplicaciones web
- **Bun** - Runtime de JavaScript ultrarrápido y gestor de paquetes
- **NgRx Signals** - Manejo de estado reactivo moderno

## Prerrequisitos

### Instalar Bun

**Bun** es nuestro runtime y gestor de paquetes principal. **NO usar npm** para este proyecto.

#### Windows :
```powershell
npm -g install bun
```

#### Verificar instalación:
```bash
bun --version
```

##  Estructura de Proyecto Típica

```
public/                          # Recursos estáticos
src/
├── app/
│   ├── core/                    # Funcionalidades centrales
│   │   ├── guards/              # Guards de autenticación
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # Tipos e interfaces
│   │   └── store/               # Estado global con NgRx Signals
│   │
│   ├── features/                # Módulos funcionales
│   │   ├── auth/                # Autenticación
│   │   ├── admin/               # Panel administrativo
│   │   └── ...                  # Más módulos
│   │
│   ├── shared/                  # Recursos compartidos
│   │   ├── components/          # Componentes reutilizables
│   │   ├── services/            # Servicios globales
│   │   └── utils/               # Utilidades
│   │
│   ├── app.config.ts            # Configuración principal
│   ├── app.routes.ts            # Definición de rutas
│   └── app.ts                   # Componente raíz
│
├── environment/                 # Variables de entorno
└── styles.scss                  # Estilos globales
```

## 🏃‍♂️ Scripts de Desarrollo

### Servidor de desarrollo
```bash
bun run start
```
La aplicación estará disponible en `http://localhost:4200/`

### Build de producción
```bash
bun run ng build
```

### Servidor SSR 
```bash
bun run serve:ssr
```

## Gestión de Dependencias

### Usa Bun

```bash
# Añadir dependencia
bun add nombre-paquete

# Añadir dependencia de desarrollo
bun add -d nombre-paquete

# Actualizar dependencias
bun update
```
