# Guía de Estilo y Marca - Sion Leche y Miel

Este documento describe la paleta de colores oficial, tipografía y guías de diseño para mantener la consistencia visual de la aplicación "Biblia Sion: Leche y Miel" en materiales de marketing y tiendas de aplicaciones.

## 🎨 Paleta de Colores

### Colores Principales (Identidad)
El corazón de la marca es una combinación elegante de dorado antiguo y tonos oscuros profundos.

| Nombre | Hex | Vista | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primary Gold** | `#9E7F2A` | 🟤 | Color principal de la marca, bordes, elementos activos. |
| **Gold Tint** | `#a88c3f` | 🟡 | Variación ligera para estados 'hover' o modo oscuro. |
| **Dark Charcoal** | `#121212` | ⚫️ | **Fondo oficial** para Modo Oscuro. (Más premium que el negro puro). |
| **Soft Charcoal** | `#2C2C2C` | ⚫️ | Color de texto principal en modo claro. |

### Colores de Interfaz (UI)
| Nombre | Hex | Uso |
| :--- | :--- | :--- |
| **Tertiary Gold** | `#F2C94C` | Botones de acción (Call-to-Action), iconos brillantes. |
| **Highlight Blue** | `rgba(0,162,255,0.3)` | Resaltado de versículos (Lectura sincronizada). |
| **Text White** | `#FFFFFF` | Texto sobre fondos oscuros. |
| **Text Grey** | `#B0B0B0` | Subtítulos o textos secundarios en modo oscuro. |

---

## ✒️ Tipografía

La aplicación utiliza una combinación de fuentes para legibilidad y estética clásica.

*   **Títulos y UI:** `Roboto` (Sans-serif, moderna, limpia).
*   **Texto Bíblico:** `Libre Baskerville` (Serif, clásica, excelente para lectura prolongada).

---

## 📱 Guía para Diseño de Tiendas (Screenshots)

Al crear imágenes para App Store y Google Play, sigue estas recomendaciones:

### 1. Fondos
*   Evita el blanco puro o negro puro.
*   Usa `#121212` como base para diseños oscuros.
*   Usa degradados sutiles desde `#121212` hacia `#1F1F1F` para dar profundidad sin distraer.

### 2. Texto Promocional
*   **Palabras Clave:** Usa el **Primary Gold** (`#9E7F2A`) para resaltar la funcionalidad clave (ej: "Audio Sincronizado").
*   **Texto General:** Usa Blanco (`#FFFFFF`) para máxima legibilidad sobre fondo oscuro.

### 3. Jerarquía Visual
1.  **Captura de Pantalla:** Debe ser el elemento más grande.
2.  **Título Corto:** Arriba de la captura (Fuente Roboto Bold).
3.  **Fondo:** Sutil, que no compita con la app.

---

## 💾 Referencias de Código (Variables.scss)

```scss
// Primary
--ion-color-primary: #9E7F2A;
--ion-color-primary-rgb: 158, 127, 42;

// Dark Background
--ion-background-color: #121212;

// Highlight
.versiculo-highlight {
    background-color: rgba(0, 162, 255, 0.3);
}
```
