# Castrez Autrans - PRD (Product Requirements Document)

## Descripción del Proyecto
Web para taller mecánico de alta gama "Castrez Autrans" con sistema de gestión de empleados, asistencia con geolocalización, y panel de administración completo.

## Stack Tecnológico
- **Frontend**: React.js + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Autenticación**: JWT simple para admin y empleados

---

## 🔐 CREDENCIALES DE ACCESO

### Panel de Administración (/admin)
- **Email**: `admin@castrezautrans.com`
- **Contraseña**: `Castrez2024!`

### Empleados (/asistencia)
| Empleado | Usuario | Contraseña |
|----------|---------|------------|
| Juan García López | `juan.garcia` | `Juan2024` |

> Los demás empleados necesitan que les asignes usuario/contraseña desde el panel admin.

---

## URLs del Sistema

| Módulo | URL |
|--------|-----|
| Web Pública | https://castrez-preview.preview.emergentagent.com |
| Panel Admin | https://castrez-preview.preview.emergentagent.com/admin |
| Control Asistencia (Empleados) | https://castrez-preview.preview.emergentagent.com/asistencia |

---

## Funcionalidades Implementadas

### ✅ Web Pública
- [x] Preloader animado con logo
- [x] Hero section con video de fondo automotriz
- [x] Sección de paquetes de mantenimiento
- [x] **Ofertas de la Semana** con descuentos
- [x] Buscador de recambios
- [x] Formulario de citas
- [x] Mapa de ubicación
- [x] Botón flotante WhatsApp

### ✅ Panel de Administración
- [x] **Login con email/contraseña** (validaciones incluidas)
- [x] Gestión de Productos (CRUD)
- [x] Gestión de Citas
- [x] Gestión de Promociones/Banners
- [x] **Gestión de Empleados** con usuario/contraseña
- [x] Gestión de Lugares de Trabajo
- [x] **Registrar Asistencia Manual** (crear, editar, eliminar, ver detalles)
- [x] Reportes con gráficos
- [x] Exportar a Excel

### ✅ Sistema de Asistencia para Empleados
- [x] **Login con usuario/contraseña** (cada empleado tiene su cuenta)
- [x] Registrar entrada (con geolocalización)
- [x] Registrar salida (con geolocalización)
- [x] Ver horas trabajadas del día
- [x] Detección de retardos
- [x] **Los empleados NO pueden editar ni eliminar** (solo registrar)

---

## Arquitectura

### Backend Endpoints Principales
```
POST /api/auth/login           → Login admin
POST /api/auth/employee/login  → Login empleado
POST /api/auth/verify          → Verificar token

GET/POST/PUT/DELETE /api/admin/employees   → CRUD empleados
GET/POST/PUT/DELETE /api/admin/attendance  → CRUD asistencias
GET/POST/PUT/DELETE /api/admin/workplaces  → CRUD lugares

POST /api/attendance/check-in   → Empleado registra entrada
POST /api/attendance/check-out  → Empleado registra salida

GET /api/admin/reports/attendance/excel → Exportar Excel
```

---

## Próximas Mejoras Sugeridas
- [ ] Notificaciones por email
- [ ] Dashboard con estadísticas en tiempo real
- [ ] Comparación de ubicación vs lugar asignado (alerta si no coincide)

---

Fecha de Implementación: Marzo 2026
