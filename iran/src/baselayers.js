const mapboxAccessToken = 'pk.eyJ1IjoibWFobXVkMSIsImEiOiJjbWYxMGN2ZDEwN3J4MnJzaWdpamNydHNlIn0.bnZ4JyGfJWt0yBv_9wr4EQ'

function setupMapboxLayers() {
     const terrainLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
         attribution:   'Basemap: © <a href="https://www.mapbox.com/about/maps" target="_blank">Mapbox</a> | © <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map</a>',
         accessToken: mapboxAccessToken,
         id: 'outdoors-v11'
     });
     const darkLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
         attribution:   'Basemap: © <a href="https://www.mapbox.com/about/maps" target="_blank">Mapbox</a> | © <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map</a>',
         id: 'mapbox/dark-v11',
         accessToken: mapboxAccessToken
     });

     const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
         attribution:   'Basemap: © <a href="https://www.mapbox.com/about/maps" target="_blank">Mapbox</a> | © <a href="https://www.maxar.com/" target="_blank">Maxar</a> | © <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map</a>',
         id: 'satellite-streets-v12',
         accessToken: mapboxAccessToken
     });

     return {
         "Dark Map": darkLayer,
         "Terrain": terrainLayer,
         "Satellite": satelliteLayer
    };
}

function setupBaseLayers() {
    const whiteLayer = L.tileLayer('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wAAAAgAB9DhnJ4AAAAASUVORK5CYII=');
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "Basemap: &copy; <a href='https://openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors"
    });

    return {
        "No Background": whiteLayer,
        "OSM Map": osmLayer,
    }
}
