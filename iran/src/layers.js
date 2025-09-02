const minZoom = 5;
const maxZoom = 14;

const mapboxAccessToken = 'pk.eyJ1IjoibWFobXVkMSIsImEiOiJjbWYxMGN2ZDEwN3J4MnJzaWdpamNydHNlIn0.bnZ4JyGfJWt0yBv_9wr4EQ'

// Attribution texts
const sentinelAttribution = 'Contains modified Copernicus Sentinel data 2014-2020, processed by ESA.';
const subsidenceLuhAttribution = "Map: "
const subsidenceLuhPaper = "<a href='https://www.science.org/doi/full/10.1126/sciadv.adk3039' target='_blank'>Original paper</a>"
const subsidenceLuhData = "<a href='https://doi.org/10.5281/zenodo.10815578' target='_blank'>Original data</a>"
const subsidenceLuhAttributionFull = subsidenceLuhAttribution + subsidenceLuhPaper + " | " + subsidenceLuhData + " | " + sentinelAttribution;


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

function setupInclusiveOverlayLayers(){
    const wmsSubsidence = L.tileLayer.wms('https://gs.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:subsidence_rate_2014-2020_desc_mmpr_v1.0.0',
        STYLES: 'cm_spectral',
        format: 'image/png',
        transparent: true,
        env: "c1:0;c2:50;c3:100;c4:200;c5:250",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });
    return {"Subsidence": wmsSubsidence}
}

function setupExclusiveOverlayLayers() {
    const wmsSeasonal = L.tileLayer.wms('https://gs.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:seasonal_amplitude_2014-2020_desc_mm_v1.0.0',
        STYLES: 'cm_viridis',
        format: 'image/png',
        transparent: true,
        env: "c1:0;c2:25;c3:50;c4:75;c5:100",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });
    const wmsCountiesSubsidenceArea = L.tileLayer.wms('https://gs.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:counties_2014-2020_v1.0.0',
        STYLES: 'subsidence:subsidence_area_percent_white_to_red',
        format: 'image/png',
        transparent: true,
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });
    const wmsProvincesSubsidenceArea = L.tileLayer.wms('https://gs.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:provinces_2014-2020_v1.0.0',
        STYLES: 'subsidence:subsidence_area_percent_white_to_red',
        format: 'image/png',
        transparent: true,
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });
    const wmsMajorBasinSubsidenceArea = L.tileLayer.wms('https://gs.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:major_catchments_2014-2020_v1.0.0',
        STYLES: 'subsidence:counties_subsidence_area_percent_white+reds',
        format: 'image/png',
        transparent: true,
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });
    const wmsMinorBasinSubsidenceArea = L.tileLayer.wms('https://www.geo.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:minor_catchments_2014-2020_v1.0.0',
        STYLES: 'subsidence:counties_subsidence_area_percent_white+reds',
        format: 'image/png',
        transparent: true,
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });

    return {
        "Seasonal": wmsSeasonal,
        "Counties": wmsCountiesSubsidenceArea,
        "Provinces": wmsProvincesSubsidenceArea,
        // "Major Basin": wmsMajorBasinSubsidenceArea,
        // "Minor Basin": wmsMinorBasinSubsidenceArea,
    };
}







