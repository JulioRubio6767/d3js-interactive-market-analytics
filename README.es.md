# 📊 Cuadro de Mando Web Interactivo para Analítica de Mercado con D3.js

🌐 **Idiomas / Languages:** [🇪🇸 Versión en Español](README.es.md) | [🇬🇧 English Version](README.md)

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?logo=javascript)
![D3.js](https://img.shields.io/badge/D3.js-v7-orange?logo=d3dotjs)
![HTML5](https://img.shields.io/badge/HTML5-Semántico-red?logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Flexbox%20%26%20Grid-blue?logo=css3)

Panel de analítica web interactivo desarrollado nativamente con **D3.js (Data-Driven Documents)**, JavaScript moderno y renderizado SVG para analizar la dinámica del mercado inmobiliario y turístico, distribución de tarifas y tendencias de disponibilidad.

---

## 📌 Descripción del Proyecto

Mientras que las herramientas tradicionales de Business Intelligence (como Power BI o Tableau) permiten prototipado rápido, la visualización nativa en web con D3.js otorga control absoluto sobre la manipulación del DOM, curvas de animación, transiciones dinámicas e interacción fluida del usuario.

Este cuadro de mando procesa conjuntos de datos depurados y renderiza gráficos vectoriales sincronizados en tiempo real:
* **Histogramas de Distribución Dinámicos:** Visualización de la dispersión de precios y densidad de ofertas.
* **Comparativas por Zonas Urbanas:** Métricas agregadas por distrito, tipo de habitación y tasas de ocupación.
* **Tooltips y Filtrado Interactivo:** Efectos dinámicos al pasar el ratón (*hover*), ajuste automático de ejes y estilización vectorial en SVG.

---

## 🛠️ Estructura del Proyecto

```
d3js-interactive-market-analytics/
├── index.html        # Estructura principal y contenedores del dashboard
├── styles.css        # Diseño adaptable (responsive), tipografía y estilos SVG
├── app.js            # Lectura de datos, escalas, ejes y controladores de eventos D3.js
└── data_set/         # Datos limpios en formato CSV
    └── listings_clean.csv
```

---

## 🚀 Cómo Ejecutar en Local

Dado que D3.js carga datos mediante peticiones asíncronas (`d3.csv`), se requiere un servidor web local para evitar bloqueos por políticas CORS del navegador:

### Opción A: Usando Python (Más Rápido)
```bash
# Abre la terminal en la carpeta del proyecto y ejecuta:
python -m http.server 8000
```
Luego abre tu navegador en: `http://localhost:8000`

### Opción B: Usando la extensión Live Server de VS Code
Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.

---

## 👤 Autor
**Julio Andrés Rubio Echeverría**  
*Analytics & Machine Learning Engineer*  
* [LinkedIn](https://www.linkedin.com/in/juliorubio-data/)
* [GitHub](https://github.com/JulioRubio6767)
