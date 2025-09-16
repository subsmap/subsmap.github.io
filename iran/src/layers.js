const minZoom = 5;
const maxZoom = 14;

function setupBaseLayers(accessToken) {
    const whiteLayer = L.tileLayer('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wAAAAgAB9DhnJ4AAAAASUVORK5CYII=');
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "Basemap data: &copy; <a href='https://openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });
    const osmTopoLayer = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: "Basemap data: &copy; <a href='https://openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://viewfinderpanoramas.org'>SRTM</a> | map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)"
    });
    const osmCycleLayer = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap contributors"
    });

    // const PositronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    //     attribution: '©OpenStreetMap, ©CartoDB',
    //     subdomains: 'abcd',
    // })
    // const terrainLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.mapbox.com/">Mapbox</a>',
    //     accessToken: accessToken,
    //     id: 'outdoors-v11'
    // });
    // const darkLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //     attribution: 'Map data © Mapbox',
    //     id: 'mapbox/dark-v11',
    //     accessToken: accessToken
    // });
    // const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token=' + accessToken, {
    //     attribution: '© Mapbox contributors',
    //     id: 'satellite-streets-v12'
    // });

    const layers = {
        "No Background": whiteLayer,
        "OSM Map": osmLayer,
        "OSM Topo": osmTopoLayer,
        "OSM Cycle": osmCycleLayer,
        // "Light Map": PositronLayer,
        // "Dark Map": darkLayer,
        // "Terrain": terrainLayer,
        // "Satellite": satelliteLayer
    };

    return layers
}

function setupInclusiveOverlayLayers(){
    const wmsSubsidence = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:subsidence_rate_2014-2020_desc_mmpr_v1.0.0',
        STYLES: 'cm_spectral',
        format: 'image/png',
        transparent: true,
        env: "c1:0;c2:50;c3:100;c4:200;c5:250",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: "Contains modified Copernicus Sentinel data 2022, processed by ESA."
    });
    return {"Subsidence": wmsSubsidence}
}

function setupExclusiveOverlayLayers() {
    const wmsSeasonal = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence:seasonal_amplitude_2014-2020_desc_mm_v1.0.0',
        STYLES: 'cm_viridis',
        format: 'image/png',
        transparent: true,
        env: "c1:0;c2:25;c3:50;c4:75;c5:100",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: "Contains modified Copernicus Sentinel data 2022, processed by ESA."
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
        attribution: "Contains modified Copernicus Sentinel data 2022, processed by ESA."
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
        attribution: "Contains modified Copernicus Sentinel data 2022, processed by ESA."
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
        attribution: "Contains modified Copernicus Sentinel data 2022, processed by ESA."
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
        attribution: "Contains modified Copernicus Sentinel data 2022, processed by ESA."
    });

    return {
        "Seasonal": wmsSeasonal,
//        "Counties": wmsCountiesSubsidenceArea,
//        "Provinces": wmsProvincesSubsidenceArea,
        // "Major Basin": wmsMajorBasinSubsidenceArea,
        // "Minor Basin": wmsMinorBasinSubsidenceArea,
    };
}







