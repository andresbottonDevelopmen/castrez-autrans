# Castrez Autrans - PRD (Product Requirements Document)

## Descripcion del Proyecto
Web para taller mecanico de alta gama "Castrez Autrans" con sistema de gestion de empleados, asistencia con geolocalizacion, y panel de administracion completo.

## Stack Tecnologico
- **Frontend**: React.js + Tailwind CSS + Framer Motion + Shadcn/UI
- **Backend**: FastAPI + MongoDB (motor async)
- **Autenticacion**: JWT simple para admin y empleados
- **Email**: Resend API (onboarding@resend.dev -> industriasbotton@gmail.com)
- **WhatsApp**: Redirect via wa.me API to +34 613430084

---

## Credenciales de Acceso

### Panel de Administracion (/admin)
- **Email**: `admin@castrezautrans.com`
- **Password**: `Castrez2024!`

### Empleados (/asistencia)
| Empleado | Usuario | Password |
|----------|---------|----------|
| Juan Garcia Lopez | `juan.garcia` | `Juan2024` |

> Los demas empleados necesitan que les asignes usuario/password desde el panel admin.

---

## URLs del Sistema

| Modulo | URL |
|--------|-----|
| Web Publica | https://castrez-preview.preview.emergentagent.com |
| Panel Admin | https://castrez-preview.preview.emergentagent.com/admin |
| Control Asistencia | https://castrez-preview.preview.emergentagent.com/asistencia |

---

## Funcionalidades Implementadas

### Web Publica
- [x] Preloader animado con logo
- [x] Hero section con video de fondo automotriz
- [x] Seccion de paquetes de mantenimiento con disclaimer legal
- [x] Ofertas de la Semana (grid responsive: 2 cols mobile, 3 tablet, 4 desktop)
- [x] Buscador de recambios con filtro por categorias
- [x] Formulario de citas funcional con:
  - Envio de email a industriasbotton@gmail.com via Resend
  - Redireccion a WhatsApp +34 613430084 con datos pre-rellenados
- [x] Mapa de ubicacion Google Maps embed
- [x] Boton flotante WhatsApp
- [x] Diseno responsive completo (mobile/tablet/desktop)

### Panel de Administracion
- [x] Login con email/password (JWT)
- [x] Gestion de Productos (CRUD)
- [x] Gestion de Citas
- [x] Gestion de Promociones/Banners
- [x] Gestion de Empleados con usuario/password
- [x] Gestion de Lugares de Trabajo
- [x] Registrar Asistencia Manual (crear, editar, eliminar, ver detalles)
- [x] Reportes con graficos
- [x] Exportar a Excel (verificado y funcionando)

### Sistema de Asistencia para Empleados
- [x] Login con usuario/password
- [x] Registrar entrada (con geolocalizacion)
- [x] Registrar salida (con geolocalizacion)
- [x] Ver horas trabajadas del dia
- [x] Deteccion de retardos
- [x] Empleados NO pueden editar ni eliminar (solo registrar)

---

## Arquitectura

### Backend Endpoints Principales
```
POST /api/appointments              -> Crear cita + email Resend + WhatsApp
POST /api/auth/login                -> Login admin
POST /api/auth/employee/login       -> Login empleado
POST /api/auth/verify               -> Verificar token

GET/POST/PUT/DELETE /api/admin/employees   -> CRUD empleados
GET/POST/PUT/DELETE /api/admin/attendance  -> CRUD asistencias
GET/POST/PUT/DELETE /api/admin/workplaces  -> CRUD lugares
GET/POST/PUT/DELETE /api/admin/products    -> CRUD productos
GET/POST/PUT/DELETE /api/admin/banners     -> CRUD banners

POST /api/attendance/check-in       -> Empleado registra entrada
POST /api/attendance/check-out      -> Empleado registra salida

GET /api/admin/reports/attendance/excel -> Exportar Excel
```

---

## Integraciones 3rd Party
- **Resend**: Email transaccional (API Key: re_7ZuBmRQ7_...)
- **WhatsApp**: Redirect via wa.me API (no API key needed)
- **Google Maps**: Embed iframe (no API key needed)
- **xlsxwriter**: Generacion de Excel en backend

---

## Proximas Mejoras Sugeridas
- [ ] Notificaciones por email
- [ ] Dashboard con estadisticas en tiempo real
- [ ] Comparacion de ubicacion vs lugar asignado (alerta si no coincide)
- [ ] Seccion Piezas Reacondicionadas de Alta Gama (expandida)

---

Fecha de Implementacion: Marzo 2026
