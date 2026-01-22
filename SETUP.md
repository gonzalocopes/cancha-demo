# 🚀 Guía de Configuración Rápida

Esta guía te ayudará a configurar y ejecutar la aplicación de alquiler de canchas en pocos minutos.

## ✅ Pre-requisitos

- Node.js instalado (v18 o superior)
- Navegador web moderno
- Cuenta de Supabase (gratuita)

---

## 📝 Paso 1: Configurar Supabase

### 1.1. Crear Cuenta y Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Click en "New Project"
4. Completa:
   - **Name**: cancha-futbol (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña en un lugar seguro
   - **Region**: Selecciona la más cercana a tu ubicación
5. Click en "Create new project" y espera 1-2 minutos

### 1.2. Ejecutar el Schema de Base de Datos

1. En el dashboard de Supabase, ve al menú lateral izquierdo
2. Click en **SQL Editor**
3. Click en "New query"
4. Abre el archivo `database/schema.sql` de este proyecto
5. Copia TODO el contenido y pégalo en el editor SQL
6. Click en "Run" (botón verde en la esquina inferior derecha)
7. Deberías ver: "Success. No rows returned"

### 1.3. Agregar Datos Iniciales

1. En el mismo SQL Editor, crea una nueva query
2. Abre el archivo `database/seed.sql`
3. Copia TODO el contenido y pégalo
4. Click en "Run"
5. Deberías ver: "Success. No rows returned"

### 1.4. Obtener Credenciales

1. En el menú lateral, ve a **Settings** (⚙️)
2. Click en **API**
3. Busca y copia:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (una clave larga que empieza con `eyJ...`)

---

## 🔧 Paso 2: Configurar Variables de Entorno

1. En la carpeta del proyecto, copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` con tu editor de texto

3. Reemplaza los valores:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_aqui
   
   PORT=3001
   
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. Guarda el archivo

> ⚠️ **Importante**: Cambia `ADMIN_USERNAME` y `ADMIN_PASSWORD` por credenciales seguras antes de usar en producción.

---

## 🎯 Paso 3: Iniciar la Aplicación

Necesitas **dos terminales** abiertas:

### Terminal 1 - Backend

```bash
cd /home/administra/Escritorio/cancha
npm run server
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3001
```

### Terminal 2 - Frontend

```bash
cd /home/administra/Escritorio/cancha
npm run dev
```

Deberías ver:
```
VITE v7.3.1  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🌐 Paso 4: Abrir la Aplicación

1. Abre tu navegador
2. Ve a: **http://localhost:5173**
3. ¡Deberías ver la página principal con las canchas!

---

## 🧪 Paso 5: Probar el Sistema

### Probar Reserva de Cliente

1. En la página principal, click en "Reservar Ahora" en cualquier cancha
2. Selecciona una fecha (hoy o futura)
3. Click en un horario disponible (verde)
4. Completa el formulario:
   - **Nombre**: Tu nombre
   - **WhatsApp**: Tu número (ej: 11 1234-5678)
   - **Tipo de Pago**: Selecciona una opción
5. Click en "Confirmar Reserva"
6. Deberías ver un mensaje de éxito ✓

### Probar Panel de Admin

1. Ve a: **http://localhost:5173/admin/login**
2. Ingresa:
   - **Usuario**: admin
   - **Contraseña**: admin123
3. Click en "Iniciar Sesión"
4. Deberías ver el dashboard con:
   - Estadísticas (1 reserva total)
   - Tu reserva en la lista
5. Prueba:
   - Filtrar por fecha
   - Marcar como "Pagado"
   - Cancelar la reserva

---

## ✅ Verificación Completa

Si todo funciona correctamente, deberías poder:

- ✓ Ver las 4 canchas en la página principal
- ✓ Reservar una cancha
- ✓ Ver la reserva en el panel admin
- ✓ Actualizar el estado de pago
- ✓ Cancelar reservas

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to Supabase"

**Causa**: Credenciales incorrectas en `.env`

**Solución**:
1. Verifica que copiaste correctamente la URL y la Key de Supabase
2. Asegúrate de que no haya espacios extra
3. Reinicia el servidor backend (Ctrl+C y `npm run server`)

### Error: "Port 3001 already in use"

**Causa**: El puerto 3001 está ocupado

**Solución**:
1. Cambia el puerto en `.env`: `PORT=3002`
2. Reinicia el servidor

### Error: "Table does not exist"

**Causa**: No ejecutaste el schema SQL

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta `database/schema.sql`
3. Ejecuta `database/seed.sql`

### La página está en blanco

**Causa**: Error en el frontend

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el backend esté corriendo
4. Reinicia el frontend (Ctrl+C y `npm run dev`)

---

## 📱 Accesos Rápidos

- **Página Principal**: http://localhost:5173
- **Panel Admin**: http://localhost:5173/admin/login
- **API Backend**: http://localhost:3001/api
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 🎉 ¡Listo!

Tu aplicación está funcionando. Ahora puedes:

1. **Personalizar las canchas**: Edita los datos en Supabase
2. **Cambiar precios**: Modifica la tabla `canchas`
3. **Agregar más canchas**: Inserta nuevos registros
4. **Cambiar horarios**: Modifica el código en `server/routes/reservas.js`

---

## 📚 Documentación Adicional

- [README.md](file:///home/administra/Escritorio/cancha/README.md) - Documentación completa
- [Walkthrough](file:///home/administra/.gemini/antigravity/brain/ce82db3f-9004-4bd9-9123-1c13a1e46664/walkthrough.md) - Detalles de implementación
- [Supabase Docs](https://supabase.com/docs) - Documentación de Supabase

---

**¿Necesitas ayuda?** Revisa los logs del servidor y la consola del navegador para más información sobre errores.
