// Initialize and configure the interactive world map visualization
function initializeMap() {
    // Get container dimensions
    const containerWidth = document.getElementById("map-container").offsetWidth;
    const mapHeight = 600;
  
    // Create and configure the SVG element
    const mapSvg = d3
      .select("#world-map")
      .attr("width", containerWidth)
      .attr("height", mapHeight);
  
    // Configure map projection settings
    const mapProjection = createMapProjection(containerWidth, mapHeight);
    const pathGenerator = d3.geoPath().projection(mapProjection);
  
    // Add map background
    createMapBackground(mapSvg, containerWidth, mapHeight);
  
    // Load and render geographical data
    loadWorldMapData(mapSvg, pathGenerator);
  }
  
  // Create the map projection with appropriate scaling
  function createMapProjection(width, height) {
    return d3
      .geoMercator()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 1.5]);
  }
  
  // Create the base background for the map
  function createMapBackground(svg, width, height) {
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#111927");
  }
  
  // Load geographical data and set up map features
  function loadWorldMapData(svg, pathGenerator) {
    d3.json(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    ).then(function (worldData) {
      // Render country boundaries
      renderCountries(svg, worldData, pathGenerator);
      
      // Add visual effects for the map
      setupMapEffects(svg);
      
      // Begin generating simulated network traffic
      startNetworkSimulation();
    });
  }
  
  // Render country boundaries on the map
  function renderCountries(svg, worldData, pathGenerator) {
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(worldData, worldData.objects.countries).features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", "#1e293b")
      .attr("stroke", "#2c3e50")
      .attr("stroke-width", 0.5);
  }
  
  // Set up visual effects for the map
  function setupMapEffects(svg) {
    // Create definitions for filter effects
    const defs = svg.append("defs");
    const glowFilter = defs.append("filter").attr("id", "glow");
  
    // Configure the glow effect
    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
  
    // Merge original and blurred elements
    const mergeLayers = glowFilter.append("feMerge");
    mergeLayers.append("feMergeNode").attr("in", "coloredBlur");
    mergeLayers.append("feMergeNode").attr("in", "SourceGraphic");
  }
  
  // Begin the network simulation with periodic events
  function startNetworkSimulation() {
    setInterval(generateNetworkEvent, 1000);
  }
  
  // Create a network event between two cities
  function generateNetworkEvent() {
    const svg = d3.select("#world-map");
    const projectionFunction = getMapProjection(svg);
  
    // Select source and target cities
    const [sourceCity, targetCity] = selectCityPair();
    
    // Determine event characteristics
    const eventType = Math.random() > 0.5 ? "denial" : "automated";
    const eventColor = eventType === "denial" ? "#ff3a8c" : "#36d7b7";
  
    // Convert geographic coordinates to pixel positions
    const sourcePoint = projectionFunction([sourceCity.lng, sourceCity.lat]);
    const targetPoint = projectionFunction([targetCity.lng, targetCity.lat]);
  
    // Create the visual elements
    visualizeNetworkEvent(svg, sourcePoint, targetPoint, eventColor, sourceCity, targetCity);
  }
  
  // Get the current map projection from SVG
  function getMapProjection(svg) {
    return d3
      .geoMercator()
      .scale(svg.attr("width") / 2 / Math.PI)
      .translate([svg.attr("width") / 2, svg.attr("height") / 1.5]);
  }
  
  // Select two different cities for network event
  function selectCityPair() {
    const sourceCity = GLOBAL_METROPOLISES[Math.floor(Math.random() * GLOBAL_METROPOLISES.length)];
    let targetCity;
    
    do {
      targetCity = GLOBAL_METROPOLISES[Math.floor(Math.random() * GLOBAL_METROPOLISES.length)];
    } while (targetCity === sourceCity);
    
    return [sourceCity, targetCity];
  }
  
  // Generate a curved path between two points
  function generateCurvedPath(source, target) {
    const dx = target[0] - source[0];
    const dy = target[1] - source[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midpoint = [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2];
    const curveFactor = 0.35;
  
    return `M${source[0]},${source[1]} 
            Q${midpoint[0]},${midpoint[1] - distance * curveFactor} 
            ${target[0]},${target[1]}`;
  }
  
  // Create visual elements for network event
  function visualizeNetworkEvent(svg, source, target, color, sourceCity, targetCity) {
    // Create unique ID for this event
    const eventId = Date.now();
    
    // 1. Create source glow effect
    createSourceGlow(svg, source, color);
    
    // 2. Create color gradient for the path
    createEventGradient(svg, eventId, source, target, color);
    
    // 3. Create and animate the path
    animateEventPath(svg, source, target, color, eventId);
    
    // 4. Create impact visualization
    createImpactEffect(svg, target, color);
    
    // 5. Display city labels
    displayConnectionLabel(svg, target, sourceCity, targetCity, color);
  }
  
  // Create glow effect at source point
  function createSourceGlow(svg, point, color) {
    const glow = svg
      .append("circle")
      .attr("cx", point[0])
      .attr("cy", point[1])
      .attr("r", 0)
      .attr("fill", color)
      .style("filter", "url(#glow)");
  
    glow
      .transition()
      .duration(500)
      .ease(d3.easeElastic)
      .attr("r", 4)
      .transition()
      .duration(1000)
      .attr("r", 2);
  }
  
  // Create gradient for path animation
  function createEventGradient(svg, id, source, target, color) {
    const gradient = svg
      .append("linearGradient")
      .attr("id", `gradient-${id}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", source[0])
      .attr("y1", source[1])
      .attr("x2", target[0])
      .attr("y2", target[1]);
  
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 1);
  
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);
  }
  
  // Create and animate path between points
  function animateEventPath(svg, source, target, color, id) {
    const pathData = generateCurvedPath(source, target);
    
    const line = svg
      .append("path")
      .attr("class", "attack-line")
      .attr("d", pathData)
      .attr("stroke", `url(#gradient-${id})`)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .style("filter", "url(#glow)");
  
    // Get path length for animation
    const pathLength = line.node().getTotalLength();
  
    // Animate the path
    line
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", pathLength)
      .attr("opacity", 1)
      .transition()
      .duration(2000)
      .ease(d3.easePolyOut)
      .attr("stroke-dashoffset", 0)
      .transition()
      .duration(500)
      .attr("opacity", 0)
      .remove();
  }
  
  // Create impact visualization at target point
  function createImpactEffect(svg, point, color) {
    const impact = svg
      .append("circle")
      .attr("cx", point[0])
      .attr("cy", point[1])
      .attr("r", 0)
      .attr("fill", color)
      .style("filter", "url(#glow)")
      .attr("opacity", 0);
  
    impact
      .transition()
      .delay(1500)
      .duration(500)
      .attr("r", 8)
      .attr("opacity", 1)
      .transition()
      .duration(1000)
      .attr("r", 0)
      .attr("opacity", 0)
      .remove();
  }
  
  // Display connecting cities text label
  function displayConnectionLabel(svg, position, sourceCity, targetCity, color) {
    const label = svg
      .append("text")
      .attr("x", position[0])
      .attr("y", position[1] - 15)
      .attr("text-anchor", "middle")
      .attr("fill", color)
      .attr("font-size", "0px")
      .attr("class", "city-label")
      .text(`${sourceCity.name} → ${targetCity.name}`);
  
    label
      .transition()
      .delay(1500)
      .duration(500)
      .ease(d3.easeElastic)
      .attr("font-size", "12px")
      .transition()
      .delay(1000)
      .duration(500)
      .attr("font-size", "0px")
      .remove();
  }