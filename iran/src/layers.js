const minZoom = 5;
const maxZoom = 14;

// Attribution texts
const sentinelAttribution = 'Contains modified Copernicus Sentinel data 2014-2020, processed by ESA.';
const subsidenceLuhAttribution = "Map: "
const subsidenceLuhPaper = "<a href='https://www.science.org/doi/full/10.1126/sciadv.adk3039' target='_blank'>Original paper</a>"
const subsidenceLuhData = "<a href='https://doi.org/10.5281/zenodo.10815578' target='_blank'>Original data</a>"
const subsidenceLuhAttributionFull = subsidenceLuhAttribution + subsidenceLuhPaper + " | " + subsidenceLuhData + " | " + sentinelAttribution;

const subsidenceCometAttribution = "Map: "
const sentinelAttributionComet = 'Contains modified Copernicus Sentinel data 2014-2022, processed by ESA.';
const subsidenceCometPaper = "<a href='https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2024JB030367' target='_blank'>Original paper</a>"
const subsidenceCometData = ""
const subsidenceCometAttributionFull = subsidenceCometAttribution + subsidenceCometPaper + " | " + sentinelAttributionComet

function setupInclusiveOverlayLayers(){
//    const wmsSubsidence = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
//        VERSION: '1.1.0',
//        LAYERS: 'subsidence:subsidence_rate_2014-2020_desc_mmpr_v1.0.0',
//        STYLES: 'cm_spectral',
//        format: 'image/png',
//        transparent: true,
//        env: "c1:0;c2:50;c3:100;c4:200;c5:250",
//        tms: true,
//        minZoom: minZoom,
//        maxZoom: maxZoom,
//        attribution: subsidenceLuhAttributionFull
//    });
//    return {"Subsidence": wmsSubsidence}
    return {}
}


function setupOverlayLayersLuh() {
    const wmsSubsidence = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'subsidence_rate_2014-2020_desc_mmpr_v1.0.0',
        STYLES: 'cm_spectral',
        format: 'image/png',
        transparent: true,
        env: "c1:0;c2:50;c3:100;c4:200;c5:250",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });
    const wmsSeasonal = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'seasonal_amplitude_2014-2020_desc_mm_v1.0.0',
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
        LAYERS: 'counties_2014-2020_v1.0.0',
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
        LAYERS: 'provinces_2014-2020_v1.0.0',
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
        LAYERS: 'major_catchments_2014-2020_v1.0.0',
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
        LAYERS: 'minor_catchments_2014-2020_v1.0.0',
        STYLES: 'subsidence:counties_subsidence_area_percent_white+reds',
        format: 'image/png',
        transparent: true,
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceLuhAttributionFull
    });

    return {
        "Subsidence (LUH)": wmsSubsidence,
        "Seasonal": wmsSeasonal,
//        "Counties": wmsCountiesSubsidenceArea,
//        "Provinces": wmsProvincesSubsidenceArea,
        // "Major Basin": wmsMajorBasinSubsidenceArea,
        // "Minor Basin": wmsMinorBasinSubsidenceArea,
    };
}


function setupOverlayLayersComet(){
    const wmsSubsidenceComet = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'Iran_subsidence_rate_gt1mmpyr_2014-2022_Sentinel-1_InSAR_decomposed_v1.0.0_tiled',
        STYLES: 'cm_spectral',
        format: 'image/png',
        transparent: true,
        env: "c1:0;c2:50;c3:100;c4:200;c5:250",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceCometAttributionFull
    });
    const wmsUpComet = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'Iran_vertical_rate_2014-2022_s1_decompose_comet_v1.0.0',
        STYLES: 'cm_vik_r',
        format: 'image/png',
        transparent: true,
        env: "c1:-200;c2:-100;c3:0;c4:100;c5:200",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceCometAttributionFull
    });
    const wmsEWComet = L.tileLayer.wms('https://gs2.mapsdev.com/geoserver/subsidence/wms', {
        VERSION: '1.1.0',
        LAYERS: 'Iran_east_rate_2014-2022_s1_decompose_comet_v1.0.0',
        STYLES: 'cm_bam',
        format: 'image/png',
        transparent: true,
        env: "c1:-50;c2:-25;c3:0;c4:25;c5:50",
        tms: true,
        minZoom: minZoom,
        maxZoom: maxZoom,
        attribution: subsidenceCometAttributionFull
    });

    return {
        "Subsidence (COMET)": wmsSubsidenceComet,
        "Up component": wmsUpComet,
        "E-W component": wmsEWComet
        };
}
