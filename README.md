# 📅 DataStudio Calendario

Visualización comunitaria para **Looker Studio (Google Data Studio)** que muestra tasks por fecha en un calendario interactivo con vista mensual y semanal.

---

## ✨ Características

- Toggle **vista mensual / semanal**
- Navegación por mes o semana (← Hoy →)
- **Tasks por día** con nombre, estado y métrica
- **Colores por estado** con leyenda automática
- Primer día de semana configurable (Domingo / Lunes)
- Datos de muestra para desarrollo local

---

## 📁 Estructura del proyecto

```
DataStudioCalendario/
├── manifest.json        ← Metadatos de la viz para Looker Studio
├── package.json         ← Dependencias Node
├── build.js             ← Script de compilación (esbuild)
├── src/
│   ├── index.js         ← Lógica del calendario
│   ├── index.css        ← Estilos
│   └── index.json       ← Config de campos y estilos de Looker Studio
└── dist/                ← Archivos compilados (se generan con npm run build)
    ├── index.js
    └── index.css
```

---

## 🚀 Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar (genera dist/)
npm run build

# 3. Abrir src/index.js en el navegador directamente
#    o usar un servidor local:
npx serve .
# → Abrir http://localhost:3000/src/ para ver con datos de ejemplo
```

---

## 📤 Deploy en GitHub Pages

GitHub Pages servirá los archivos compilados directamente desde el repo.

**Paso 1 — Subir el repo a GitHub**

```bash
git add .
git commit -m "feat: add calendar community visualization"
git push origin main
```

**Paso 2 — Activar GitHub Pages**

1. Ir a tu repo `DataStudioCalendario` en GitHub
2. Settings → Pages → Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)` → Save
4. Tu viz quedará en: `https://<tu-usuario>.github.io/DataStudioCalendario/`

---

## 🔗 Registrar en Looker Studio

1. Abrir [Looker Studio](https://lookerstudio.google.com)
2. Crear o abrir un reporte
3. Menú **Insertar → Visualización de la comunidad**
4. Hacer clic en **Explorar más** → icono ⚙️ **Crear visualización**
5. En el campo **Ruta del manifiesto**, pegar:
   ```
   https://<tu-usuario>.github.io/DataStudioCalendario/manifest.json
   ```
6. Aceptar y agregar al reporte

---

## 📊 Conectar tu fuente de datos

La viz espera estos campos en tu fuente de datos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Fecha** | Dimensión — DATE | Fecha de la task (YYYYMMDD) |
| **Nombre de Task** | Dimensión — TEXT | Título o nombre de la tarea |
| **Estado / Categoría** | Dimensión — TEXT | Estado para colorear (Pendiente, En progreso, etc.) |
| **Métrica** | Métrica — NUMBER | Valor numérico (horas, puntos, prioridad) |

> **Tip:** El campo Estado es opcional. Si no lo conectas, todas las tasks aparecerán en azul.

---

## ⚙️ Opciones de estilo en Looker Studio

Una vez registrada la viz, desde el panel de estilos puedes configurar:

- **Vista por defecto:** Mensual o Semanal
- **Primer día de la semana:** Domingo o Lunes
- **Mostrar métrica en chips:** Sí / No

---

## 🛠 Modificar la visualización

```bash
# Editar src/index.js o src/index.css
# Luego recompilar:
npm run build
# Hacer commit y push — GitHub Pages se actualiza automáticamente
git add dist/ && git commit -m "update viz" && git push
```

---

## 📦 Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| `@google/dscc` | ^0.3.14 | Librería oficial de Looker Studio |
| `esbuild` | ^0.28.0 | Compilador/bundler |

---

## 📄 Licencia

Json
