# 🎵 Last.fm Statistics Dashboard

Dashboard interactivo para visualizar y analizar tus estadísticas de Last.fm con gráficos hermosos y estadísticas detalladas.

## ✨ Características

### Dashboard Web
- 📊 **Visualizaciones interactivas** con gráficos de barras, líneas y torta
- 🎨 **Diseño moderno** con glassmorphism y gradientes
- 📱 **Responsive** - funciona perfecto en móvil y desktop
- 🔄 **Dos formas de cargar datos**:
  - Subir archivo CSV generado por el script
  - Conectar directamente con la API de Last.fm

### Estadísticas incluidas
- Total de scrobbles y métricas generales
- Top 10 artistas más escuchados
- Top 10 canciones más reproducidas
- Top 6 álbumes favoritos
- Análisis de actividad por hora del día
- Análisis de actividad por día de la semana

### Script de Python
- ⚡ Descarga todos tus scrobbles automáticamente
- 🔒 Manejo seguro de credenciales con variables de entorno
- 📈 Muestra estadísticas mientras descarga
- 💾 Exporta a CSV con timestamp
- 🛡️ Manejo robusto de errores y rate limiting

## 🚀 Instalación y Uso

### Opción 1: Solo Dashboard Web

Simplemente abre el archivo HTML del dashboard en tu navegador. Puedes:
- Cargar un CSV existente de Last.fm
- O conectarte directamente ingresando tus credenciales

### Opción 2: Script Python + Dashboard

#### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 2. Configurar credenciales

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` y completa:
```
LASTFM_USER=tu_usuario
LASTFM_API_KEY=tu_api_key
```

**Obtener tu API key:**
1. Ve a https://www.last.fm/api/account/create
2. Completa el formulario (puedes poner cualquier cosa en "Application name")
3. Copia tu API key

#### 3. Ejecutar el script

```bash
python lastfm_downloader.py
```

Esto generará un archivo `lastfm_scrobbles_YYYYMMDD_HHMMSS.csv` con todos tus scrobbles.

#### 4. Visualizar en el dashboard

Abre el dashboard HTML en tu navegador y carga el CSV generado.

## 📁 Estructura del Proyecto

```
lastfm-stats/
├── lastfm_downloader.py    # Script de descarga mejorado
├── dashboard.html           # Dashboard interactivo
├── requirements.txt         # Dependencias de Python
├── .env.example            # Ejemplo de configuración
├── .env                    # Tu configuración (no commitear)
└── README.md              # Este archivo
```

## 🔒 Seguridad

- ⚠️ **NUNCA** subas tu archivo `.env` a GitHub o lo compartas
- El archivo `.env` debería estar en tu `.gitignore`
- Las credenciales en el dashboard se guardan solo en tu navegador (localStorage)

## 💡 Consejos

### Para el script de Python:
- El script respeta los límites de rate limiting de Last.fm
- Si tienes muchos scrobbles, la descarga puede tomar varios minutos
- El script muestra el progreso en tiempo real

### Para el dashboard:
- Usa "Conectar API" para ver tus últimas 2000 reproducciones rápidamente
- Usa "Cargar CSV" para análisis completo de todo tu historial
- Las credenciales se guardan automáticamente en tu navegador
- Los gráficos son interactivos - pasa el mouse sobre ellos

## 🐛 Solución de Problemas

**Error "Verificá tu usuario o API key"**
- Verifica que tu usuario y API key sean correctos
- Asegúrate de que tu perfil de Last.fm sea público

**El script se detiene o va muy lento**
- Esto es normal si tienes muchos scrobbles
- Last.fm tiene límites de rate limiting
- El script incluye delays automáticos para respetarlos

**El dashboard no muestra gráficos**
- Asegúrate de que el CSV tenga el formato correcto
- Verifica que el archivo tenga las columnas: artist, song, album, date

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso personal.

## 🤝 Contribuciones

¿Encontraste un bug o tienes una idea? ¡Las contribuciones son bienvenidas!

---

Hecho con ❤️ para los amantes de la música