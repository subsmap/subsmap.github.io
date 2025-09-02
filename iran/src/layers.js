const minZoom = 5;
const maxZoom = 14;

// Attribution texts
const sentinelAttribution = 'Contains modified Copernicus Sentinel data 2014-2020, processed by ESA.';
const subsidenceLuhAttribution = "Map: "
const subsidenceLuhPaper = "<a href='https://www.science.org/doi/full/10.1126/sciadv.adk3039' target='_blank'>Original paper</a>"
const subsidenceLuhData = "<a href='https://doi.org/10.5281/zenodo.10815578' target='_blank'>Original data</a>"
const subsidenceLuhAttributionFull = subsidenceLuhAttribution + subsidenceLuhPaper + " | " + subsidenceLuhData + " | " + sentinelAttribution;


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
        attribution: subsidenceLuhAttributionFull
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
        attribution: subsidenceLuhAttributionFull
    });
    const wmsCountiesSubsidenceArea = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
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
    const wmsProvincesSubsidenceArea = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
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
    const wmsMajorBasinSubsidenceArea = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
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
