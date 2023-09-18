const { OpenStreetMapProvider } = require("leaflet-geosearch");

const lat = -32.890647;
const lng = -68.839382;
let timeOutId;
let cond = false;
const apiKey =
  "AAPK54ae31fec89b448eb9f24bde0e211c3dJzIRZviKWWgbwzzXtDrkLIrZZWsBhmqu2qWHFTUvO01Z597C802QlbnGS41jNxiQ";

const map = L.map("mapa").setView([lat, lng], 15);

let marker;
let markers = new L.FeatureGroup().addTo(map);

document.addEventListener("DOMContentLoaded", () => {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // buscar la direccion
  const buscador = document.querySelector("#formbuscador");

  buscador.addEventListener("input", buscarDireccion);
});

function buscarDireccion(e) {
  clearTimeout(timeOutId);
  console.log(e.target.value.length);
  timeOutId = setTimeout(() => {
    // console.log("DEJO DE ESCRIBIR");
    cond = true;
  }, 2000);

  if (e.target.value.length > 8) {
    // si existe un pin anterior limpiarlo
    // if (marker) {
    //   map.removeLayer(marker);
    // }
    markers.clearLayers();
    // utilizar el provider y geocoder
    const geocodeService = L.esri.Geocoding.reverseGeocode({ apiKey: apiKey });
    const provider = new OpenStreetMapProvider();
    provider.search({ query: e.target.value }).then((resultado) => {
      // console.log(resultado);
      geocodeService
        .latlng(resultado[0].bounds[0], 15)
        .run(function (error, result) {
          console.log(error);
          console.log(result);
          // mostrar el mapa
          map.setView(resultado[0].bounds[0], 15);

          // agregar el pin
          marker = new L.marker(resultado[0].bounds[0], {
            draggable: true,
            autoPan: true,
          })
            .addTo(map)
            .bindPopup(resultado[0].label)
            .openPopup();

          // asignar al contendor markers
          markers.addLayer(marker);

          // detectar movimiento del marker
          marker.on("moveend", function (e) {
            marker = e.target;
            // console.log(marker.getLatLng());
            const posicion = marker.getLatLng();
            map.panTo(new L.LatLng(posicion.lat, posicion.lng));
            // const posicion = marker.getLatLng();
          });
        });
    });
  }
}
