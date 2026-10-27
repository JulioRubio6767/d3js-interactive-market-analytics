/*
---------------------------
ESTADO GLOBAL DE LA APP
---------------------------
Contiene los datos originales, filtrados y los filtros activos
*/
const state = {
  listings: [],         // Dataset completo
  filteredListings: [], // Dataset filtrado
  filters: {ciudad: "all", barrio: "all"}
};
//Tooltip global para interacción con gráficos 
const tooltip = d3.select("#tooltip");
//Escala de colores categóricos (D3) - Colores tipo paste
const colorScale = d3.scaleOrdinal(d3.schemeSet3);
//Formatea números enteros con separador de miles
function formatNumber(value) {
  return d3.format(",")(Math.round(value || 0));
}
//Formatea precios en euros
function formatPrice(value) {
  return "€ " + d3.format(",.0f")(value || 0);
}
//Muestra tooltip en posición del mouse
function showTooltip(event, html) {
  tooltip
    .style("opacity", 1)
    .html(html)
    .style("left", `${event.pageX + 14}px`)
    .style("top", `${event.pageY - 14}px`);
}
//Oculta tooltip
function hideTooltip() {
  tooltip.style("opacity", 0);
}
/*
---------------------------
CARGAR DATOS
---------------------------
Lee el CSV e inicializa el dashboard
*/
function loadData() {
  d3.csv("data_set/listings_clean.csv", d3.autoType).then(data => {
    state.listings = data;
    state.filteredListings = [...data];

    initFilters();
    updateDashboard();
  });
}
/*
---------------------------
AGRUPACIÓN POR BARRIO
---------------------------
Calcula métricas agregadas:
Conteo, Precio medio, Rating medio, Capacidad media
*/
function getBarrioStats(data) {
  return d3.rollups(
    data,
    v => ({
      count: v.length,
      avgPrice: d3.mean(v, d => d.price || 0) || 0,
      avgRating: d3.mean(v, d => d.review_scores_rating || 0) || 0,
      avgCapacity: d3.mean(v, d => d.accommodates || 0) || 0,
      city: v[0].city || "Ninguna"
    }),
    d => d.neighbourhood
  ).map(([neighbourhood, values]) => ({
    neighbourhood,
    ...values
  }));
}
/*
---------------------------
FILTROS
---------------------------
*/
function initFilters() {
  const cityFilter = d3.select("#cityFilter");
  // Obtener lista única de ciudades
  const cities = [...new Set(state.listings.map(d => d.city).filter(Boolean))].sort();
  // Agregar ciudaes - select dinámicamente
  cityFilter
    .selectAll("option.dynamic-city")
    .data(cities)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);
  // Evento cambio de filtro
  cityFilter.on("change", function () {
    state.filters.ciudad = this.value;

    aplicar_filtros();
  });
  // Reset filtro
  d3.select("#reset_filters").on("click", () => {
    state.filters.ciudad = "all";
    d3.select("#cityFilter").property("value", "all");

    aplicar_filtros();
  });
}

//Aplica filtros activos sobre el dataset
function aplicar_filtros() {
  state.filteredListings = state.listings.filter(d => {
    const cityOk =
      state.filters.ciudad === "all" || d.city === state.filters.ciudad;

    return cityOk;
  });

  updateDashboard();
}
/*
---------------------------
ACTUALIZACIÓN GLOBAL
---------------------------
Re-renderiza todos los componentes
*/
function updateDashboard() {
  renderKPIs();
  renderOfferBar();
  renderPriceNeighbourhoodBar();
  renderPriceHistogram();
  graficoReviews();
}

/*
---------------------------
KPI
---------------------------
Calcula y muestra indicadores clave
*/
function renderKPIs() {
  const data = state.filteredListings;  // Datos filtrados para analizar kpis
  const global = state.listings;        // Datos globales para usar indicadores y validar

  // Métricas principales
  const totalListings = data.length;
  const totalListingsGlobal = global.length;

  const avgPrice = d3.mean(data, d => d.price || 0) || 0;
  const globalPrice = d3.mean(global, d => d.price || 0) || 0;

  const avgRating = d3.mean(data, d => d.review_scores_rating || 0) || 0;
  const globalRating = d3.mean(global, d => d.review_scores_rating || 0) || 0;

  const avgCapacity = d3.mean(data, d => d.accommodates || 0) || 0;
  const globalCapacity = d3.mean(global, d => d.accommodates || 0) || 0;

  // Diferencias vs global
  const totalPct = totalListingsGlobal ? (totalListings / totalListingsGlobal) * 100 : 0;
  const priceDiff = avgPrice - globalPrice;
  const ratingDiff = avgRating - globalRating;
  const capacityDiff = avgCapacity - globalCapacity;

  // Render KPIs
  d3.select("#kpi-total-listings")
    .html(`<h3>Total de alojamientos</h3><p>${formatNumber(totalListings)}</p>
      <small>${totalPct.toFixed(1)}% del total disponible</small>`);

  d3.select("#kpi-avg-price")
    .html(`<h3>Precio medio</h3><p>${formatPrice(avgPrice)}</p>
      <small style="color:${priceDiff >= 0 ? '#2ca02c' : '#d62728'}">
        ${priceDiff >= 0 ? '+' : '-'}${formatPrice(Math.abs(priceDiff))} ${priceDiff >= 0 ? 'sobre' : 'bajo'} el promedio global
      </small>`);

  d3.select("#kpi-avg-rating")
    .html(`<h3>Calificación media</h3><p>${avgRating.toFixed(2)} </p>
      <small style="color:${ratingDiff >= 0 ? '#2ca02c' : '#d62728'}">
        ${ratingDiff >= 0 ? '+' : '-'}${Math.abs(ratingDiff).toFixed(2)} ${ratingDiff >= 0 ? 'sobre' : 'bajo'} el promedio global
      </small>`);

  d3.select("#kpi-avg-capacity")
    .html(`<h3>Capacidad media</h3><p>${avgCapacity.toFixed(1)}</p>
      <small style="color:${capacityDiff >= 0 ? '#2ca02c' : '#d62728'}">
        ${capacityDiff >= 0 ? '+' : '-'}${Math.abs(capacityDiff).toFixed(1)} huéspedes ${capacityDiff >= 0 ? 'sobre' : 'bajo'} el promedio global
      </small>`);
}

/*
---------------------------------------------------------
FUNCIÓN GENÉRICA PARA GRÁFICOS DE BARRAS HORIZONTALES
---------------------------------------------------------
Esta función centraliza la creación de gráficos de barras
horizontales reutilizables para distintos indicadores.

Parámetros:
  - containerId: selector del contenedor donde se renderiza el gráfico
  - data: arreglo de datos a representar
  - valueKey: propiedad numérica usada para el eje X y tamaño de barra
  - labelKey: propiedad categórica usada para el eje Y
  - fillFn: función que devuelve el color de cada barra
  - tooltipFn: función que devuelve el contenido HTML del tooltip
  - clickFn: función opcional para interacción al hacer clic
  - xAxisLabel: texto descriptivo del eje X
*/
function drawHorizontalBar({containerId, data, valueKey, labelKey, fillFn, tooltipFn, clickFn, xAxisLabel}) {
  // Selecciona el contenedor y limpia su contenido previo
  const container = d3.select(containerId);
  container.html("");
  // Dimensiones generales del SVG (grafica)
  const width = 560;
  const height = 420;
  // Dimensiones generales del SVG
  const margin = { top: 10, right: 20, bottom: 60, left: 170 };
  // Crea el lienzo SVG principal
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);
  // Grupo principal desplazado según márgenes
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  // Dimensiones efectivas del área del gráfico
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  /*
   Escala Y:
    - Tipo band porque representa categorías
    - Cada categoría corresponde a una barra horizontal
  */
  const y = d3.scaleBand()
    .domain(data.map(d => d[labelKey]))
    .range([0, chartHeight])
    .padding(0.22);
  /*
   Escala X:
    - Tipo lineal porque representa magnitudes numéricas
    - Parte desde 0 hasta el valor máximo encontrado
  */
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[valueKey]) || 0])
    .nice()
    .range([0, chartWidth]);
  // Rejilla horizontal de referencia visual - Se genera usando el eje inferior con ticks extendidos
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickSize(-chartHeight).tickFormat(""))
    .select(".domain").remove();
  // Eje Y con etiquetas de categorías
  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));
  // Eje X con escala numérica
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x));
  // Dibujo de barras - Cada rectángulo representa un elemento del arreglo data
  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d[labelKey]))
    .attr("width", d => x(d[valueKey]))
    .attr("height", y.bandwidth())
    .attr("fill", d => fillFn(d))
    .style("cursor", clickFn ? "pointer" : "default")
    .on("mousemove", (event, d) => showTooltip(event, tooltipFn(d)))
    .on("mouseleave", hideTooltip)
    .on("click", (_, d) => {
      if (clickFn) clickFn(d);
    });
  // Etiqueta descriptiva del eje X
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("class", "note")
    .text(xAxisLabel);
}

/*
---------------------------------------------------------
 GRÁFICO: BARRIOS CON MAYOR OFERTA DE ALOJAMIENTOS
---------------------------------------------------------
 Muestra los 12 barrios con mayor cantidad de alojamientos
 dentro del conjunto filtrado.
*/
function renderOfferBar() {
  // Agrupa los datos por barrio, ordena por cantidad y toma el top 12
  const grouped = getBarrioStats(state.filteredListings)
    .sort((a, b) => d3.descending(a.count, b.count))
    .slice(0, 12);
  /* 
   Reutiliza la función genérica de barras horizontales,
   Configurada previamente para resiBir los parametros siguientes
  */
  drawHorizontalBar({
    containerId: "#bar-offer",
    data: grouped,
    valueKey: "count",
    labelKey: "neighbourhood",
    fillFn: d => colorScale(d.city),
    tooltipFn: d => `
      <strong>${d.neighbourhood}</strong><br>
      Ciudad: ${d.city}<br>
      Alojamientos: ${formatNumber(d.count)}<br>
      Precio medio: ${formatPrice(d.avgPrice)}<br>
      Rating medio: ${d.avgRating.toFixed(2)}
    `,
    xAxisLabel: "Cantidad de alojamientos"
  });
}

/*
---------------------------------------------------------
 GRÁFICO: BARRIOS CON MAYOR PRECIO MEDIO
---------------------------------------------------------
 Muestra los 12 barrios con mayor precio promedio dentro
 del conjunto filtrado.
*/
function renderPriceNeighbourhoodBar() {
  // Agrupa por barrio, ordena por precio medio y toma el top 12
  const grouped = getBarrioStats(state.filteredListings)
    .sort((a, b) => d3.descending(a.avgPrice, b.avgPrice))
    .slice(0, 12);
  /*
   Reutiliza la función genérica de barras horizontales,
   Configurada previamente para resiBir los parametros siguientes
  */
  drawHorizontalBar({
    containerId: "#bar-price-neighbourhood",
    data: grouped,
    valueKey: "avgPrice",
    labelKey: "neighbourhood",
    fillFn: d => colorScale(d.city),
    tooltipFn: d => `
      <strong>${d.neighbourhood}</strong><br>
      Ciudad: ${d.city}<br>
      Precio medio: ${formatPrice(d.avgPrice)}<br>
      Rating medio: ${d.avgRating.toFixed(2)}<br>
      Alojamientos: ${formatNumber(d.count)}
    `,
    xAxisLabel: "Precio medio (€)"
  });
}

/*
---------------------------------------------------------
 GRÁFICO: HISTOGRAMA DE DISTRIBUCIÓN DE PRECIOS
 ---------------------------------------------------------
 Representa la frecuencia de alojamientos por rangos de precio.
 Permite observar concentración, dispersión y posibles valores extremos dentro de los precios.
*/
function renderPriceHistogram() {
  // Selecciona y limpia el contenedor
  const container = d3.select("#hist-price");
  container.html("");
  // Extrae solo precios válidos y mayores que cero
  const data = state.filteredListings.map(d => d.price).filter(d => d > 0);
  // Valida que hay datos q mostrar, si no hay datos no dibuja nada
  if (!data.length) return;
  // Dimensiones del gráfico
  const width = 560;
  const height = 420;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  // Crea el SVG principal
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);
  // Grupo de dibujo interno
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  // Dimensiones útiles
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  // Escala X: Define el rango de precios representado en el histograma
  const x = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .nice()
    .range([0, chartWidth]);
  /*
   Generador de bins: 
    - Divide el dominio de precios en 30 intervalos.
   Se utilizan 30 bins para agrupar los precios en rangos.
   Este valor permite representar la distribución con suficiente
   detalle visual sin generar un gráfico excesivamente fragmentado.
  */
  const bins = d3.bin()
    .domain(x.domain())
    .thresholds(30)(data);
  // Escala Y: Representa la frecuencia de observaciones por bin
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .nice()
    .range([chartHeight, 0]);

  // Grid(rejilla) de fondo
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickSize(-chartHeight).tickFormat(""))
    .select(".domain").remove();

  /*
   Barras del histograma:
   Cada barra representa la frecuencia de alojamientos dentro de un rango específico de precios
  */
  g.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x0))
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr("height", d => chartHeight - y(d.length))
    .attr("fill", "#4f46e5")
    .attr("opacity", 0.8)
    .on("mousemove", (event, d) => {
      showTooltip(event, `
        Rango: ${formatPrice(d.x0)} - ${formatPrice(d.x1)}<br>
        Alojamientos: ${formatNumber(d.length)}
      `);
    })
    .on("mouseleave", hideTooltip);

  // Eje X
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x));
  // Eje y
  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));

  // Etiqueta del eje X
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("class", "note")
    .text("Precio (€)");
  // Etiqueta del eje Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("class", "note")
    .text("Cantidad de alojamientos");
}

/*
---------------------------------------------------------
 GRÁFICO: RELACIÓN ENTRE PRECIO Y CALIFICACIÓN
---------------------------------------------------------
 Scatter plot que permite analizar si existe alguna relación
 visual entre el precio del alojamiento y su calificación.
*/
function graficoReviews() {
  // Limpia contenido previo del contenedor
  d3.select("#grafico-reviews").html("");
  const data = state.filteredListings;
  /*
   Filtra únicamente registros válidos:
    - precio no nulo, numérico y mayor que 0
    - calificación no nula, numérica y mayor que 0
  */
  const datosValidos = data.filter(d =>
    d.price != null && !isNaN(d.price) && d.price > 0 && d.review_scores_rating != null && !isNaN(d.review_scores_rating) && d.review_scores_rating > 0
  );
  //Si no hay datos, muestra mensaje en lugar de dejar el gráfico vacío.
  if (!datosValidos.length) {
    d3.select("#grafico-reviews")
      .html("<p>No hay datos suficientes para mostrar la relación entre precio y calificación.</p>");
    return;
  }
  // Márgenes y dimensiones del gráfico
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const width = 560;
  const height = 420;
  // Crea el SVG y el grupo principal de dibujo
  const svg = d3.select("#grafico-reviews")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  // Valores extremos para construir las escalas
  const maxPrecio = d3.max(datosValidos, d => d.price);
  const minRating = d3.min(datosValidos, d => d.review_scores_rating);
  const maxRating = d3.max(datosValidos, d => d.review_scores_rating);
  // Escala X: Representa el precio
  const x = d3.scaleLinear()
    .domain([0, maxPrecio])
    .nice()
    .range([0, width]);
  // Escala Y: Representa la calificación, se ajusta ligeramente alrededor del mínimo y máximo observados
  const y = d3.scaleLinear()
    .domain([Math.max(0, minRating - 0.1), Math.min(5, maxRating + 0.1)])
    .nice()
    .range([height, 0]);
  // Obtiene el conjunto de ciudades para construir una escala categórica de color
  const ciudades = [...new Set(datosValidos.map(d => d.city).filter(Boolean))].sort();
  const color = d3.scaleOrdinal()
    .domain(ciudades)
    .range(d3.schemeTableau10);
  // Eje X
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "axis")
    .call(d3.axisBottom(x));
  // Eje Y
  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));
  // Etiqueta del eje X
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Precio");
  // Etiqueta del eje Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -42)
    .attr("text-anchor", "middle")
    .text("Calificación");
  // Dibujo de puntos: Cada círculo representa un alojamiento
  svg.selectAll("circle")
    .data(datosValidos)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.price))
    .attr("cy", d => y(d.review_scores_rating))
    .attr("r", 4)
    .attr("fill", d => color(d.city || "Sin ciudad"))
    .attr("opacity", 0.5)
    .on("mousemove", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(`
          <strong>Ciudad:</strong> ${d.city || "N/A"}<br>
          <strong>Precio:</strong> ${d.price}<br>
          <strong>Calificación:</strong> ${d.review_scores_rating}
        `)
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseleave", hideTooltip);
}
/*
---------------------------------------------------------
 INICIO DE LA APLICACIÓN
---------------------------------------------------------
 - Lanza la carga inicial de datos y el render del dashboard.
 - Se ejecuta al final del archivo para asegurar que todas las funciones 
   y variables necesarias ya estén definidas antes de iniciar la carga de datos y renderizado.
*/
loadData();