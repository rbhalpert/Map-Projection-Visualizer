const R_EARTH_KM = 6371;

const projectionRegistry = [
  {
    id: "equirectangular",
    name: "Equirectangular",
    project: (lat, lon, width, height) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      return { x, y };
    },
  },
  {
    id: "mercator",
    name: "Web Mercator",
    project: (lat, lon, width, height) => {
      const limitedLat = Math.max(Math.min(lat, 85.05112878), -85.05112878);
      const x = ((lon + 180) / 360) * width;
      const rad = (limitedLat * Math.PI) / 180;
      const mercN = Math.log(Math.tan(Math.PI / 4 + rad / 2));
      const y = height / 2 - (width * mercN) / (2 * Math.PI);
      return { x, y };
    },
  },
  {
    id: "orthographic",
    name: "Orthographic (0°, 0°)",
    project: (lat, lon, width, height) => {
      const phi = (lat * Math.PI) / 180;
      const lambda = (lon * Math.PI) / 180;
      const scale = Math.min(width, height) * 0.42;
      const x = width / 2 + scale * Math.cos(phi) * Math.sin(lambda);
      const y = height / 2 - scale * Math.sin(phi);
      return { x, y };
    },
  },
  {
    id: "gall-peters",
    name: "Gall-Peters",
    project: (lat, lon, width, height) => {
      const phi = (lat * Math.PI) / 180;
      const x = ((lon + 180) / 360) * width;
      const y = (height / 2) * (1 - Math.sin(phi));
      return { x, y };
    },
  },
];

const state = {
  start: { lat: 40.7128, lon: -74.006 },
  end: { lat: 51.5074, lon: -0.1278 },
  maximizedPanelId: null,
};

const gridEl = document.querySelector("#panel-grid");
const panelTemplate = document.querySelector("#panel-template");

const controls = {
  startLat: document.querySelector("#start-lat"),
  startLon: document.querySelector("#start-lon"),
  endLat: document.querySelector("#end-lat"),
  endLon: document.querySelector("#end-lon"),
};

const panelControllers = new Map();

init();

function init() {
  buildPanelsFromRegistry();
  wireControls();
  renderAllPanels();
}

function buildPanelsFromRegistry() {
  const fragment = document.createDocumentFragment();

  projectionRegistry.forEach((projection) => {
    const panel = panelTemplate.content.firstElementChild.cloneNode(true);
    panel.dataset.projectionId = projection.id;

    const nameEl = panel.querySelector(".projection-name");
    nameEl.textContent = projection.name;

    const toggleButton = panel.querySelector(".panel-toggle");
    toggleButton.addEventListener("click", () => toggleMaximize(projection.id));

    const canvas = panel.querySelector("canvas");
    panelControllers.set(projection.id, {
      projection,
      panel,
      toggleButton,
      trueDistanceEl: panel.querySelector(".true-distance"),
      mapDistanceEl: panel.querySelector(".map-distance"),
      canvas,
      ctx: canvas.getContext("2d"),
    });

    fragment.append(panel);
  });

  gridEl.append(fragment);
}

function wireControls() {
  Object.values(controls).forEach((input) => {
    input.addEventListener("input", () => {
      updateStateFromControls();
      renderAllPanels();
    });
  });
}

function updateStateFromControls() {
  state.start.lat = clamp(parseFloat(controls.startLat.value), -90, 90);
  state.start.lon = clamp(parseFloat(controls.startLon.value), -180, 180);
  state.end.lat = clamp(parseFloat(controls.endLat.value), -90, 90);
  state.end.lon = clamp(parseFloat(controls.endLon.value), -180, 180);
}

function renderAllPanels() {
  const trueDistanceKm = haversineDistanceKm(state.start, state.end);

  panelControllers.forEach((controller) => {
    renderPanel(controller, trueDistanceKm);
  });

  syncMaximizedVisualState();
}

function renderPanel(controller, trueDistanceKm) {
  const { projection, trueDistanceEl, mapDistanceEl, canvas, ctx } = controller;

  const startPoint = projection.project(state.start.lat, state.start.lon, canvas.width, canvas.height);
  const endPoint = projection.project(state.end.lat, state.end.lon, canvas.width, canvas.height);

  const mapPxLength = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);

  trueDistanceEl.textContent = `True distance: ${trueDistanceKm.toFixed(1)} km`;
  mapDistanceEl.textContent = `Panel map length: ${mapPxLength.toFixed(1)} px`;

  drawPanelCanvas(ctx, canvas.width, canvas.height, startPoint, endPoint);
}

function drawPanelCanvas(ctx, width, height, startPoint, endPoint) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#12263f";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(177, 210, 255, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i += 1) {
    const x = (width / 6) * i;
    const y = (height / 6) * i;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#53ceff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();

  drawPoint(ctx, startPoint, "#a3ff7b");
  drawPoint(ctx, endPoint, "#ff9d7b");
}

function drawPoint(ctx, point, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function haversineDistanceKm(start, end) {
  const dLat = degToRad(end.lat - start.lat);
  const dLon = degToRad(end.lon - start.lon);
  const lat1 = degToRad(start.lat);
  const lat2 = degToRad(end.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R_EARTH_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function toggleMaximize(projectionId) {
  state.maximizedPanelId = state.maximizedPanelId === projectionId ? null : projectionId;
  syncMaximizedVisualState();
}

function syncMaximizedVisualState() {
  const hasMaximized = Boolean(state.maximizedPanelId);
  document.body.classList.toggle("maximized", hasMaximized);

  panelControllers.forEach((controller, id) => {
    const isActive = state.maximizedPanelId === id;
    controller.panel.classList.toggle("maximized", isActive);
    controller.toggleButton.textContent = isActive ? "Restore" : "Maximize";
    controller.toggleButton.setAttribute("aria-pressed", String(isActive));
  });
}
