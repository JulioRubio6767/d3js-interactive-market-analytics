# 📊 Interactive Market Analytics Web Dashboard with D3.js

🌐 **Idiomas / Languages:** [🇪🇸 Versión en Español](README.es.md) | [🇬🇧 English Version](README.md)


![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?logo=javascript)
![D3.js](https://img.shields.io/badge/D3.js-v7-orange?logo=d3dotjs)
![HTML5](https://img.shields.io/badge/HTML5-Semantic%20Markup-red?logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Flexbox%20%26%20Grid-blue?logo=css3)

A bespoke, interactive web analytics dashboard built natively with **D3.js (Data-Driven Documents)**, vanilla JavaScript, and SVG rendering to analyze rental housing market dynamics, price distributions, and availability trends.

---

## 📌 Project Overview

While BI tools (like Power BI or Tableau) offer rapid prototyping, custom web-native data visualization with D3.js provides complete control over DOM manipulation, animation curves, dynamic transitions, and responsive user interaction.

This dashboard processes cleaned housing market datasets and renders synchronized, interactive charts:
* **Dynamic Distribution Histograms:** Visualizing listing price spreads and frequency.
* **Neighborhood Comparison Charts:** Aggregated metrics by city zone, room type, and occupancy.
* **Interactive Tooltips & Filtering:** Real-time hover effects, dynamic domain scales, and custom SVG styling.

---

## 🛠️ Architecture & File Structure

```
d3js-interactive-market-analytics/
├── index.html        # Main dashboard layout and container elements
├── styles.css        # Responsive layout, typography, and SVG styling
├── app.js            # D3.js data parsing, scales, axes, and event listeners
└── data_set/         # Cleaned CSV data sources
    └── listings_clean.csv
```

---

## 🚀 How to Run Locally

Because D3.js loads datasets via HTTP requests (`d3.csv`), you need a local web server (to prevent browser CORS errors):

### Option A: Using Python (Simplest)
```bash
# In the project directory:
python -m http.server 8000
```
Then open your browser at: `http://localhost:8000`

### Option B: Using VS Code Live Server
Right-click on `index.html` and select **"Open with Live Server"**.

---

## 👤 Author
**Julio Andrés Rubio Echeverría**  
*Analytics & Machine Learning Engineer*  
* [LinkedIn](https://www.linkedin.com/in/juliorubio-data/)
* [GitHub](https://github.com/JulioRubio6767)
