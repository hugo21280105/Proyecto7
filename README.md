# Arcana Tap - Roguelite Clicker (iPhone sin Unity)

Juego clicker roguelite completo en HTML/CSS/JS puro. Progresión tipo **Balatro/Isaac** adaptada a tapping en móvil.

## ✨ Características v2

### Mecánicas Principales
- **Tapping** de enemigos con daño escalable
- **Reliquias** (12+) con sinergias reales: daño, DPS, oro, crítico
- **Eventos aleatorios** que alteran la run (encuentros, portales)
- **Modificadores de enemigos**: Acelerado, Blindado, Regenerador, Explosivo
- **Sistema de Prestigio**: canjea kills por bonificaciones permanentes
- **Guardado automático** cada 3 segundos

### Progresión
- 4 mejoras de run por sala (Cuchilla, Familiar, Cáliz, Espejo)
- 4 mejoras permanentes con Esencias (daño, DPS, crítico, oro)
- Reliquias cada 6 salas
- Eventos cada 8 salas (~60% probabilidad)
- Enemigos progresivamente más fuertes

### UI/UX Mejorada
- **Tabs**: Tienda, Reliquias Activas, Taller Permanente
- **Stats en tiempo real**: oro, daño, DPS, esencias, prestige, contador de reliquias
- **Previsualización de daño** en botón de ataque
- **Hit detection mejorada** (botones con 44px mínimo, padding mayor)
- **Visual refrescante**: gradientes, animaciones, colores vibrantes
- Diseño **fullscreen en iPhone** (PWA)

## 🚀 Cómo jugar

### En PC
1. Abre `index.html` directamente en navegador
2. *Opcional*: instala extensión "Live Server" para recargas automáticas

### En iPhone
1. Crea un repo GitHub con esta carpeta
2. Ve a Settings > Pages > Deploy from branch (main, root)
3. Abre la URL HTTPS en Safari (ej: `https://tuusuario.github.io/Juego-iPhone/`)
4. Toca Compartir > Añadir a pantalla de inicio
5. Úsalo como app nativa

## 📋 Estructura
- `index.html` - Estructura y dialogs
- `styles.css` - UI moderna con grid, gradientes, animaciones
- `script.js` - Motor de juego, lógica, guardado local
- `manifest.json` - PWA metadata
- `service-worker.js` - Offline support
- `icon.svg` - Logo de la app

## 🎮 Mecánica Principal

1. **Sala 1→∞**: Derrota enemigos, gana oro
2. **Oro**: Compra mejoras de run (aplican solo esta sesión)
3. **Cada 6 salas**: Elige 1 reliquia de 3 opciones
4. **Cada 5 salas**: Ganas esencias (canjea por mejoras permanentes)
5. **Cada 8 salas**: Evento aleatorio con 3 opciones
6. **Prestige**: Al resetear, ganas prestige = kills/50 (bonus futuro)

## 🔮 Próximas Mejoras (Opcional)

- Cartas con sinergias tipo Balatro
- Artefactos especiales activables
- Leaderboard local
- Sonidos y partículas
- Más reliquias y enemigos
- Sistema de sacrificios (perder oro por powerups)

## ⚙️ Técnico

**Sin dependencias externas.** Puro vanilla JS + PWA standards.
- LocalStorage para guardado
- Service Worker para funcionamiento offline
- Responsive en todos los tamaños
- ~50KB total (muy rápido)
