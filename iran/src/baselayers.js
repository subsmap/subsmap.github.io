const mapboxAccessToken = 'pk.eyJ1IjoibWFobXVkMSIsImEiOiJjbWYxMGN2ZDEwN3J4MnJzaWdpamNydHNlIn0.bnZ4JyGfJWt0yBv_9wr4EQ'

function setupMapboxLayers() {

     const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
         attribution:   'Basemap: © <a href="https://www.mapbox.com/about/maps" target="_blank">Mapbox</a> | © <a href="https://www.maxar.com/" target="_blank">Maxar</a> | © <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map</a>',
         id: 'satellite-streets-v12',
         accessToken: mapboxAccessToken
     });

     return {
         "Satellite": satelliteLayer
    };
}

function setupBaseLayers() {
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "Basemap: &copy; <a href='https://openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors"
    });

    const terrainLayer = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/gwc/service/wms', {
        VERSION: '1.1.0',
        LAYERS: 'basemap_iran_en',
        format: 'image/png',
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: ''
    });


    return {
        "OSM Map": osmLayer,
        "Terrain": terrainLayer,
    }
}
