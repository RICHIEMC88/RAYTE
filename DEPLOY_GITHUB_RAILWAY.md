# Deploy de Rayte con GitHub + Railway

## 1) Qué ya quedó listo en el proyecto
Este repo ya quedó preparado para Railway con estos cambios:

- `package.json`
  - `dev` usa `PORT` dinámico
  - `start` usa `PORT` dinámico
  - `db:seed:all` corre todos los seeds
  - `db:init` empuja esquema y siembra todo
- `.gitignore`
  - ignora `.env` y variantes locales
- `.env.example`
  - deja el formato esperado para `DATABASE_URL`

## 2) Sube el proyecto a GitHub
En la carpeta del proyecto corre:

```bash
git init
git add .
git commit -m "Rayte listo para deploy en Railway"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si tu repo ya existe y ya tiene remoto:

```bash
git add .
git commit -m "Config deploy Railway"
git push
```

## 3) Crea el proyecto en Railway
En Railway:

1. Entra a **New Project**
2. Elige **Provision PostgreSQL**
3. Luego **Add Service**
4. Elige **GitHub Repo**
5. Selecciona tu repo de `rayte`

## 4) Configura variables en Railway
En el servicio web de Railway abre **Variables** y agrega:

### Obligatoria
`DATABASE_URL`

Pon la variable que te da el servicio PostgreSQL de Railway.
Normalmente Railway la deja seleccionar desde la UI.

### Recomendada
`NODE_ENV=production`

### Opcional
`NIXPACKS_NODE_VERSION=20`

## 5) Configura comandos de Railway
Si Railway te pide los comandos, usa exactamente estos:

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm run start
```

## 6) Inicializa la base de datos
Cuando termine el primer deploy, abre la terminal del servicio web en Railway y corre:

```bash
npm run db:init
```

Ese comando hace esto:

```bash
npm run db:push -- --force
npm run db:seed:all
```

## 7) Genera tu dominio público
En Railway:

1. Abre tu servicio web
2. Ve a **Settings** o **Networking**
3. Da clic en **Generate Domain**

Te dará una URL parecida a:

```txt
https://rayte-production.up.railway.app
```

Esa ya la puedes:
- abrir en otra pestaña
- compartir
- usar en Wix
- poner como botón o iframe

## 8) Cómo actualizar después
Cada vez que cambies algo:

```bash
git add .
git commit -m "Cambios en Rayte"
git push
```

Railway vuelve a desplegar solo.

## 9) Si falla el deploy
### Error: no conecta a la base
Revisa que `DATABASE_URL` exista en Railway.

### Error: la app prende pero no carga datos
Corre otra vez:

```bash
npm run db:init
```

### Error: puerto
Ya quedó corregido en `package.json`, Railway debe poder arrancar bien usando su `PORT`.

## 10) Qué NO debes usar en Railway
No uses este script en producción:

```bash
bash scripts/reiniciar.sh
```

Ese script es para el sandbox local, no para Railway.
