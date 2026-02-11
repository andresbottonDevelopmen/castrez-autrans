# Castrez Autrans - PRD (Product Requirements Document)

## Descripción del Proyecto
Web para taller mecánico de alta gama "Castrez Autrans" con sistema de gestión de empleados, asistencia con geolocalización, y panel de administración completo.

## Stack Tecnológico
- **Frontend**: React.js + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Autenticación**: JWT simple para admin

## Arquitectura

### Backend Endpoints
- `/api/auth/login` - Login admin con JWT
- `/api/auth/verify` - Verificar token
- `/api/products/*` - CRUD productos
- `/api/appointments/*` - CRUD citas
- `/api/banners/*` - CRUD promociones
- `/api/admin/employees/*` - CRUD empleados
- `/api/admin/workplaces/*` - CRUD lugares de trabajo
- `/api/admin/attendance/*` - CRUD asistencia
- `/api/admin/stats/attendance` - Estadísticas
- `/api/admin/reports/attendance/excel` - Exportar Excel

### Páginas Frontend
- `/` - Homepage con video hero, ofertas de la semana, servicios, recambios, citas, ubicación
- `/admin` - Panel de administración completo
- `/asistencia` - Control de asistencia para empleados (tablet/PC del taller)

## Credenciales Admin
- **Email**: admin@castrezautrans.com
- **Contraseña**: Castrez2024!

## Funcionalidades Implementadas

### ✅ Web Pública
- [x] Preloader animado con logo
- [x] Hero section con video de fondo automotriz
- [x] Sección de paquetes de mantenimiento (Essential, Advance, Premium)
- [x] Ofertas de la Semana con descuentos
- [x] Buscador de recambios por matrícula/referencia
- [x] Formulario de citas
- [x] Mapa de ubicación
- [x] Botón flotante WhatsApp (+34 607665474)
- [x] Banner promocional dinámico

### ✅ Panel de Administración
- [x] Login con email/contraseña y validaciones
- [x] Gestión de Productos (CRUD)
- [x] Gestión de Citas (ver, confirmar, completar, cancelar)
- [x] Gestión de Promociones/Banners
- [x] Gestión de Empleados (CRUD con ID, nombre, cargo, lugar, estado)
- [x] Gestión de Lugares de Trabajo (con coordenadas GPS)
- [x] Control de Asistencia (filtros, editar, eliminar)
- [x] Reportes con gráficos (horas, puntualidad, rendimiento)
- [x] Exportar a Excel

### ✅ Sistema de Asistencia
- [x] Búsqueda de empleados por nombre (autocompletado)
- [x] Registro de entrada/salida
- [x] Captura de geolocalización GPS
- [x] Validación: no duplicados, entrada antes de salida
- [x] Detección de retardos (después de 8:15)
- [x] Reloj en tiempo real

## Datos de Prueba Creados
- 1 lugar de trabajo (Taller Principal)
- 3 empleados (Juan García, María Rodríguez, Carlos Martínez)
- 4 productos con descuento (Ofertas de la semana)
- 1 banner promocional activo

## Próximas Mejoras Sugeridas
- [ ] Notificaciones por email de citas
- [ ] App móvil para empleados
- [ ] Integración con facturación
- [ ] Sistema de puntos de fidelidad para clientes

## Fecha de Implementación
Enero 2026
