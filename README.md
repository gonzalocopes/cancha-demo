# ⚽ Sistema de Alquiler de Canchas de Fútbol

Aplicación web completa para gestionar reservas de canchas de fútbol con disponibilidad en tiempo real, múltiples opciones de pago y panel de administración.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca de UI
- **React Router DOM** - Navegación
- **Vite** - Build tool y dev server
- **CSS Vanilla** - Estilos con variables CSS modernas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Supabase** - Base de datos PostgreSQL (gratuita)

### Utilidades
- **date-fns** - Manejo de fechas
- **bcryptjs** - Hashing de contraseñas

## 📋 Características Principales

### Para Clientes
- ✅ Ver lista de canchas disponibles con precios
- ✅ Seleccionar fecha y horario
- ✅ Verificar disponibilidad en tiempo real
- ✅ Reservar con datos personales y WhatsApp
- ✅ Elegir tipo de pago: completo, seña (50%) o presencial

### Para Administradores
- ✅ Panel protegido con login
- ✅ Dashboard con estadísticas
- ✅ Ver todas las reservas
- ✅ Filtrar por fecha y cancha
- ✅ Ver datos del cliente y WhatsApp (con enlace directo)
- ✅ Actualizar estado de pago
- ✅ Cancelar reservas

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
cd /home/administra/Escritorio/cancha
```

### 2. Instalar dependencias

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

#### 3.2. Ejecutar el schema de base de datos
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `database/schema.sql`
3. Ejecuta el script
4. Luego ejecuta `database/seed.sql` para agregar datos de ejemplo

#### 3.3. Obtener credenciales
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL** (URL del proyecto)
   - **anon public** key (clave pública)

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_aqui

PORT=3001

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 5. Iniciar la aplicación

Necesitas dos terminales:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📁 Estructura del Proyecto

```
cancha/
├── database/
│   ├── schema.sql          # Esquema de base de datos
│   └── seed.sql            # Datos iniciales
├── server/
│   ├── config/
│   │   └── supabase.js     # Configuración de Supabase
│   ├── routes/
│   │   ├── auth.js         # Rutas de autenticación
│   │   ├── canchas.js      # Rutas de canchas
│   │   └── reservas.js     # Rutas de reservas
│   └── index.js            # Servidor Express
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── admin/          # Componentes del admin
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   └── AuthContext.jsx # Contexto de autenticación
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── Booking.jsx     # Página de reserva
│   │   └── Home.jsx        # Página principal
│   ├── utils/
│   │   ├── api.js          # Cliente API
│   │   ├── formatters.js   # Formateadores
│   │   └── validators.js   # Validadores
│   ├── App.jsx             # Componente principal
│   ├── index.css           # Estilos globales
│   └── main.jsx            # Punto de entrada
├── .env.example            # Template de variables de entorno
├── package.json
└── vite.config.js
```

## 🔄 Flujo Completo de una Reserva

### Desde el Cliente

1. **Seleccionar Cancha**
   - El usuario ve la lista de canchas en la página principal
   - Cada cancha muestra: nombre, tipo, precio por hora
   - Click en "Reservar Ahora"

2. **Elegir Fecha y Horario**
   - Selecciona la fecha deseada
   - Ve los horarios disponibles (8:00 - 23:00)
   - Los horarios ocupados aparecen deshabilitados
   - Click en un horario disponible

3. **Completar Formulario**
   - Ingresa nombre completo
   - Ingresa número de WhatsApp
   - Selecciona tipo de pago:
     - **Pago Completo**: Paga el 100% ahora
     - **Seña (50%)**: Paga el 50% ahora, resto presencial
     - **Pago Presencial**: Paga todo en el lugar

4. **Confirmar Reserva**
   - Revisa el resumen
   - Confirma la reserva
   - Recibe mensaje de éxito

### Desde el Admin

1. **Acceder al Panel**
   - Ir a `/admin/login`
   - Ingresar credenciales (admin/admin123)

2. **Ver Dashboard**
   - Estadísticas generales
   - Lista de todas las reservas
   - Filtrar por fecha o cancha

3. **Gestionar Reservas**
   - Ver datos del cliente y WhatsApp
   - Marcar como "Pagado Completo"
   - Marcar como "Seña"
   - Cancelar reservas

## 🗄️ Modelo de Base de Datos

### Tabla: `canchas`
- `id` - ID único
- `nombre` - Nombre de la cancha
- `tipo` - Tipo (Fútbol 5, 7, 9, 11)
- `precio_hora` - Precio por hora
- `activa` - Si está activa o no

### Tabla: `reservas`
- `id` - ID único
- `cancha_id` - Referencia a la cancha
- `fecha` - Fecha de la reserva
- `horario_inicio` - Hora de inicio
- `horario_fin` - Hora de fin
- `cliente_nombre` - Nombre del cliente
- `cliente_whatsapp` - WhatsApp del cliente
- `estado_pago` - Estado: completo, seña, pendiente
- `monto_pagado` - Monto ya pagado
- `monto_total` - Monto total de la reserva

### Tabla: `usuarios_admin`
- `id` - ID único
- `username` - Usuario
- `password_hash` - Contraseña hasheada

## 🎨 Diseño y UX

- **Tema**: Colores verdes inspirados en canchas de fútbol
- **Responsive**: Funciona en móviles, tablets y desktop
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Notificaciones**: Toast messages para feedback inmediato
- **Validaciones**: Formularios con validación en tiempo real

## 🔐 Seguridad

- Autenticación simple para panel admin
- Variables de entorno para credenciales
- Row Level Security (RLS) en Supabase
- Validación de datos en frontend y backend

## 📱 Acceso al Panel Admin

**URL**: http://localhost:5173/admin/login

**Credenciales por defecto**:
- Usuario: `admin`
- Contraseña: `admin123`

> ⚠️ **Importante**: Cambia estas credenciales en el archivo `.env` antes de usar en producción.

## 🚀 Despliegue

### Frontend (Vercel)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Backend
Puedes usar:
- **Railway**
- **Render**
- **Heroku**

Asegúrate de configurar las variables de entorno en el servicio de hosting.

## 📝 Notas Adicionales

- Los horarios van de 8:00 a 23:00 (cada hora)
- Cada reserva dura 1 hora
- No se permiten reservas en horarios ocupados
- El sistema verifica disponibilidad en tiempo real
- Los datos persisten en Supabase PostgreSQL

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de haber ejecutado el schema SQL

### El servidor no inicia
- Verifica que el puerto 3001 esté libre
- Revisa que todas las dependencias estén instaladas

### Error en el frontend
- Limpia la caché: `rm -rf node_modules package-lock.json && npm install`
- Reinicia el servidor de desarrollo

## 📞 Soporte

Para cualquier duda o problema, revisa:
1. Los logs del servidor
2. La consola del navegador
3. El dashboard de Supabase

---

**¡Listo para usar! 🎉**

Desarrollado con ❤️ para gestionar canchas de fútbol de forma profesional.
