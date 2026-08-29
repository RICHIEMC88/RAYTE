# 🛵 Rayte — Estado de la web app

**Fecha:** 22 de agosto de 2026 · **Versión: v1.28** · **Servidor:** producción, puerto 3000

---

## 🆕 Novedades de la v1.28 (¡3 pendientes grandes resueltos!)

### 1. 🔐 Login / registro con sesión REAL (era el pendiente #1)
- Tablas `users` y `sessions` en PostgreSQL, contraseñas con **scrypt + sal**.
- Cookie de sesión **httpOnly** (30 días) — la sesión sobrevive al cerrar el navegador.
- En **Cuenta**: crear cuenta / iniciar sesión / cerrar sesión. "Guardar datos" ahora también actualiza el perfil en el servidor.
- API: `GET/POST /api/auth` (register · login · logout · update).

### 2. 🗃️ Pedidos REALES en la base de datos (era el pendiente #3)
- Nueva tabla `orders` (productos en JSONB, totales, cliente, estado, conductor, timestamps por etapa, calificación).
- El **checkout guarda el pedido en PostgreSQL** y lo liga al usuario con sesión.
- **Mis pedidos** se carga desde la DB (por sesión, o por teléfono como respaldo) y se refresca cada 6 s. El almacenamiento local queda solo como respaldo sin conexión.

### 3. 🖥️ Paneles operativos de socio y conductor (era el pendiente #5)
- **Panel socio**: los pedidos de los clientes aparecen solos (sondeo cada 5 s). Botones reales: **Aceptar → Listo para recoger**. Las ventas/pedidos/ticket del día se calculan con pedidos reales. "Simular pedido" ahora crea un pedido real en la DB.
- **Panel conductor**: eliges conductor, te conectas y ves las **entregas listas para recoger**; las tomas (**→ en camino**) y las marcas **entregadas**. Ganancias del día reales (envío + propina + base).

### 4. 📡 Seguimiento conectado a la DB (avance del pendiente #4)
- La página del pedido **sondea la API cada 4 s**: el estado que ve el cliente es el que mueven la tienda y el conductor.
- Flujo: `placed → preparing → ready → on_way → delivered` + badge "en vivo".
- **Autopiloto**: si nadie gestiona un pedido, avanza solo (20 s → preparación, 60 s → listo, 90 s → en camino con conductor asignado, 180 s → entregado). En cuanto la tienda o un conductor lo tocan, el autopiloto se apaga para ese pedido.
- La calificación ⭐ se guarda en la DB y la tienda la ve en su panel.

## 🗺️ Ruta de prueba nueva (5 minutos)

1. **Cuenta** → crea tu cuenta (nombre, teléfono, contraseña) → sesión iniciada
2. Entra a **Tacos El Farol** → agrega algo → **Ir a pagar** → confirma (el pedido va a PostgreSQL)
3. Abre **/socio** en otra pestaña → elige Tacos El Farol → el pedido está ahí → **Aceptar** → **Listo para recoger**
4. Abre **/conductor** → elige un conductor → conéctate → **Recoger pedido** → **Marcar entregado**
5. Vuelve a la pestaña del cliente: el seguimiento fue reflejando cada paso **en vivo** → califica ⭐ (la tienda ve las estrellas)
6. Cierra sesión y vuelve a entrar: tus pedidos siguen ahí (viven en la DB, no en el navegador)

## 🏪 Catálogo (sin cambios)

18 negocios en 8 rubros (220 productos), 16 servicios agendables (4 médicos) y 4 conductores. Fotos a medida en `public/tiendas/` y `public/servicios/` (regeneradas en esta revisión).

## ⏳ Pendientes (siguientes niveles)

1. **Pagos** (MercadoPago / Stripe) — el checkout sigue simulado
2. **Seguimiento con WebSockets/GPS real** (hoy es sondeo cada 4-5 s, ya con estados reales)
3. Horarios reales de apertura/cierre por tienda
4. Roles/permisos: que cada socio solo vea SU tienda (hoy el panel es abierto por ser demo)
5. Recuperación de contraseña

## 🔁 Arranque

```bash
cd ~/rayte && ./scripts/reiniciar.sh        # producción (recomendado)
cd ~/rayte && ./scripts/reiniciar.sh --dev  # desarrollo
```

Si PostgreSQL no está como servicio (sandbox nuevo), también sirve:

```bash
sudo apt-get install -y postgresql
sudo chown user /var/run/postgresql && sudo mkdir -p /var/lib/pgdata && sudo chown user /var/lib/pgdata
/usr/lib/postgresql/17/bin/initdb -D /var/lib/pgdata -U postgres
/usr/lib/postgresql/17/bin/pg_ctl -D /var/lib/pgdata -l /tmp/pg.log start
/usr/lib/postgresql/17/bin/psql -U postgres -h 127.0.0.1 -c "CREATE USER zappy WITH PASSWORD 'zappy' SUPERUSER;" -c "CREATE DATABASE zappy OWNER zappy;"
npm run db:push && npm run db:seed && npm run build && npm run start
```
