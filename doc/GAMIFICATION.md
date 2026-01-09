# Sistema de Gamificación - Sion Leche y Miel

Este documento detalla el sistema de gamificación implementado en la aplicación, incluyendo las medallas disponibles y los criterios para su desbloqueo.

## 🏆 Medallas Disponibles

### 🌱 Nivel: Iniciación

#### 1. Primer Paso (`footsteps`)
*   **Criterio:** Registrar actividad por lo menos 1 día.
*   **Icono:** Huellas (Verde)

#### 2. Constancia (`flame`)
*   **Criterio:** Racha de 3 días seguidos.
*   **Icono:** Llama (Naranja)

#### 3. Estudioso (`bookmarks`)
*   **Criterio:** Marcar 100 versículos.
*   **Icono:** Marcador (Azul)

#### 4. Escritor (`document-text`)
*   **Criterio:** Crear 10 notas personales.
*   **Icono:** Texto (Bronce)

---

### 🔥 Nivel: Hábito

#### 5. Hábito de Hierro (`barbell`)  *[NUEVA]*
*   **Criterio:** Racha de **7 días seguidos**.
*   **Icono:** Pesa/Fuerza (Rojo)
*   **Motivación:** Premia la disciplina semanal.

#### 6. Madrugador (`sunny`)  *[NUEVA]*
*   **Criterio:** Leer algún capítulo antes de las **7:00 AM**.
*   **Icono:** Sol (Amarillo)

#### 7. Nocturno (`moon`)  *[NUEVA]*
*   **Criterio:** Leer algún capítulo después de las **10:00 PM**.
*   **Icono:** Luna (Oscuro)

---

### 📖 Nivel: Maestría Bíblica (Categorías)

Estas medallas se desbloquean al leer **todos los capítulos** de los libros correspondientes a cada sección.

#### 8. Torá (`newspaper`)
*   **Criterio:** Completar Génesis, Éxodo, Levítico, Números y Deuteronomio.
*   **Color:** Oro

#### 9. Profetas (`eye`)
*   **Criterio:** Completar desde Josué hasta Ezequiel (Libros Históricos + Profetas Mayores en orden hebreo extendido).
*   **Color:** Secundario

#### 10. Profetas Menores (`mic`)
*   **Criterio:** Completar desde Oseas hasta Malaquías (Los 12).
*   **Color:** Medio/Gris

#### 11. Escritos (`library`)
*   **Criterio:** Completar Salmos, Proverbios, Job, Cantares, Rut, Lamentaciones, Eclesiastés, Ester, Daniel, Esdras, Nehemías y Crónicas.
*   **Color:** Claro

#### 12. Segundo Pacto (`book`)
*   **Criterio:** Completar todo el Nuevo Testamento (Mateo a Apocalipsis).
*   **Color:** Verde Éxito

---

### 🏆 Nivel: Logro Máximo

#### 13. Biblia en un Año (`trophy`)
*   **Criterio:** Completar el plan de lectura anual al 100%.
*   **Color:** Dorado Brillante

---

## ⚙️ Funcionamiento Técnico Actualizado

### 1. Rastreo de Lectura (`chapter_views`)
Para las medallas de categoría y horarios, el sistema ahora registra cada vez que abres un capítulo:
*   Tabla: `chapter_views`
*   Datos: `book_id`, `chapter`, `timestamp`.
*   **Horarios:** El `timestamp` se analiza para determinar si esMadrugador o Nocturno.
*   **Completitud:** Un Worker compara los capítulos vistos con el total de capítulos de cada libro (metadata).

### 2. Racha (`streak`)
Sigue basándose en `activity_logs` (una entrada por día) para garantizar equidad.

### 3. Rendimiento
Todo el cálculo pesado (comparar miles de capítulos vistos) se delega a un **Web Worker** (`stats.worker.ts`), asegurando que la app siga siendo rápida aunque tengas años de historial de lectura.
