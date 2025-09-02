let currentLanguage = 'en';
let opacity = 1;
const mapboxAccessToken = 'none'

// base and overlay layers
const baseLayers = setupBaseLayers(mapboxAccessToken);
const overlayExclusiveLayers = setupExclusiveOverlayLayers();
const overlayInclusiveLayers = setupInclusiveOverlayLayers();

const overlayLayers = {...overlayExclusiveLayers, ...overlayInclusiveLayers}
const groupedOverlays = {
    "Subsidence map": overlayInclusiveLayers,
    "Information": overlayExclusiveLayers 
};

// map
const map = L.map('map', {
    center: [32, 50],
    zoom: 6,
    minZoom: 5,
    maxZoom: 14,
    maxBounds: [[21, 41], [42, 66]],
    maxBoundsViscosity: 0.5,
    fullscreenControl: true
});

map.attributionControl.addAttribution('©<a href="https://www.ipi.uni-hannover.de/en/haghighi/"> Mahmud Haghighi</a>, 2023');
baseLayers['OSM Map'].addTo(map);

let controlPanel;

// Setup
initializeControlPanel();
setupLayerChangeListeners();
setupLonLatDisplay();
setupOpacityControl();
setupMapHover();
setupMapLayerChange();
overlayInclusiveLayers['Subsidence'].addTo(map);
document.addEventListener('DOMContentLoaded', setupMapClick);
document.addEventListener('DOMContentLoaded', setupColorBarControls);
document.addEventListener('DOMContentLoaded', setupPopup);
disableRightClick();

function initializeControlPanel() {
    // initialize control panel
    if (controlPanel) {
        map.removeControl(controlPanel);
    }

    const baseLayersWithNames = {};
    const groupedOverlaysWithNames = {};

    for (const [key, value] of Object.entries(baseLayers)) {
        const translatedKey = getTranslation(currentLanguage, key);
        baseLayersWithNames[translatedKey] = value;
    }

    for (const [key, value] of Object.entries(groupedOverlays)) {
        const translatedKey = getTranslation(currentLanguage, key);
        groupedOverlaysWithNames[translatedKey] = {};
        for (const [key2, value2] of Object.entries(value)) {
            const translatedKey2 = getTranslation(currentLanguage, key2);
            groupedOverlaysWithNames[translatedKey][translatedKey2] = value2;
        }
    }

    controlPanel = L.control.groupedLayers(baseLayersWithNames, groupedOverlaysWithNames, { collapsed: false }).addTo(map);

}

function setupMapLayerChange(){
    // Bring overlay layers to front and background layers to back when called
    function bringLayerToFront(e) {
        e.layer.bringToFront();
        e.layer.setOpacity(opacity);
    }

    function bringLayerToBack(e) {
        e.layer.bringToBack();
    }

    map.on('overlayadd', bringLayerToFront);
    map.on('baselayerchange', bringLayerToBack);
}

function setupLayerChangeListeners() {
    for (const layerName in overlayLayers) {
        setupColorbarShow(layerName, 'colorBarPanel'+layerName)
        setupLayerExclusiveEvents(layerName)
    }

    function setupColorbarShow(layerName, infoElementId) {
        overlayLayers[layerName].on('add', function() {
            const element = document.getElementById(infoElementId);
            if (element){
                element.style.display = 'block';
            }
        });

        overlayLayers[layerName].on('remove', function() {
            const element = document.getElementById(infoElementId);
            if (element){
                element.style.display = 'none';
            }
        });
    }
    function setupLayerExclusiveEvents(layerName) {
        if (overlayExclusiveLayers[layerName]) {
            overlayExclusiveLayers[layerName].on('add', function() {
                setTimeout(function() {
                    for (const otherLayerName in overlayExclusiveLayers) {
                        if (otherLayerName !== layerName) {
                           overlayExclusiveLayers[otherLayerName].remove()
                        }
                    }
                }, 10);
            });
        }
    }
}

function setupLonLatDisplay() {
    map.on('mousemove', function (event) {
        const latLng = event.latlng;
        document.getElementById('Lon').textContent = latLng.lng.toFixed(3);
        document.getElementById('Lat').textContent = latLng.lat.toFixed(3);
    });
}

function setupOpacityControl() {
    document.getElementById('slider').addEventListener('input', (event) => {
        opacity = event.target.value / 100;
        for (const value of Object.values(overlayLayers)) {
            if (map.hasLayer(value)) {
                value.setOpacity(opacity);
            }
        }
    });
}

function setupMapHover() {
    // setup map hover
    let lastLatLng = null;
    let debounceTimer;

    map.on('mousemove', function (e) {
        const latlng = e.latlng;
        
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            handleMapHover(latlng);
        }, 10); // Debounce delay
    });

    function handleMapHover(latlng) {
        // Handle mouse hover
        if (latlng.equals(lastLatLng)) return;
        lastLatLng = latlng;

        if (map.hasLayer(overlayLayers['Subsidence'])) {
            getWMSInfo(latlng, 'subsidence_rate', overlayLayers['Subsidence'], 'subsidenceVal');
        }
        if (map.hasLayer(overlayLayers['Seasonal'])) {
            getWMSInfo(latlng, 'amplitude', overlayLayers['Seasonal'], 'seasonalVal');
        }
    }

    // Fetches WMS info and update display
    async function getWMSInfo(latlng, property, layer, containerId) {
        try {
            const url = getFeatureInfoUrl(map, layer, latlng, { 'info_format': 'application/json' });
            const response = await fetch(url);
            const data = await response.json();
            if (data.features.length > 0) {
                const properties = data.features[0].properties;
                updateValueDisplay(properties[property], containerId);
            }
        } catch (error) {
            console.error('Error fetching WMS info:', error);
        }
    }

    function updateValueDisplay(value, containerId) {
        // Update display
        let displayText = ": " + Math.round(value / 10);
        if (value === 65535) { // typically a nodata value
            displayText = ': -';
        }
        document.getElementById(containerId).textContent = displayText;
    }
}

function getFeatureInfoUrl(map, layer, latlng, params) {
    const point = map.latLngToContainerPoint(latlng, map.getZoom());
    const size = map.getSize();
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const baseParams = {
        request: 'GetFeatureInfo',
        version: '1.1.1',
        format: 'image/jpeg',
        service: 'WMS',
        srs: 'EPSG:4326',
        styles: '',
        transparent: layer.options.transparent,
        version: layer.options.VERSION,
        bbox: `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`,
        height: size.y,
        width: size.x,
        layers: layer.options.LAYERS,
        query_layers: layer.options.LAYERS,
        info_format: params.info_format,
        exceptions: 'application/vnd.ogc.se_inimage'
    };

    const paramString = L.Util.getParamString(baseParams);
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    return `${layer._url}${paramString}&x=${x}&y=${y}`;
}

function formatNumberIntl(num) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
}

function setupMapClick() {
    const fieldsToShow = {
        'Subsidence': ['subsidence_rate'],
        'Seasonal': ['amplitude'],
        'Counties': ['name_en', 'subs_area_sqkm', 'area_sqkm','subs_area_percent', 'subs_max', 'Population'],
        'Provinces': ['name_en', 'subs_area_sqkm', 'area_sqkm','subs_area_percent', 'subs_max'],
        'Major Basin': ['name_en', 'subs_area_sqkm', 'area_sqkm','subs_area_percent', 'subs_max'],
        'Minor Basin': ['name_en', 'subs_area_sqkm', 'area_sqkm','subs_area_percent', 'subs_max']
    };

    const fieldConfig = {
        pro_nam_en: {
            label: 'Province:',
            format: value => value,
            unit: ''
        },
        name_en: {
            label: '',
            format: value => value,
            unit: ''
        },
        subs_area_sqkm: {
            label: 'Subs. Area:',
            format: value => formatNumberIntl(Math.round(value)),
            unit: '(km²)'
        },
        subs_max: {
            label: 'Max. Subs.:',
            format: value => formatNumberIntl(Math.round(value)),
            unit: '(cm/yr)'
        },
        area_sqkm: {
            label: 'Total Area:',
            format: value => formatNumberIntl(Math.round(value)),
            unit: ' (km²)'
        },
        amplitude: {
            label: 'Seasonal Amplitude:',
            format: value => formatNumberIntl(Math.round(value/10)),
            unit: '(cm)',
            nodata: 65535
        },
        Population: {
            label: 'Population:',
            format: value => formatNumberIntl((parseFloat(value)/1000).toFixed(0)),
            unit: '(x1000)'
        },
        subsidence_rate: {
            label: '',
            format: value => formatNumberIntl((Math.round(value)/10).toFixed(0)),
            unit: '(cm/yr)',
            nodata: 65535
        },
        subs_area_percent:{
            label: 'Subs. Area',
            format: value => formatNumberIntl((Math.round(value)).toFixed(0)),
            unit: '(%)'
        }
    };

    let lastLatLng = null;
    let debounceTimer;

    map.on('click', function (e) {
        const latlng = e.latlng;

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            if (latlng.equals(lastLatLng)) return;
            lastLatLng = latlng;
            handleMapClick(latlng);
        }, 10); // debounce delay
    });

    function handleMapClick(latlng) {
        for (const layerName in overlayExclusiveLayers) {
            if (map.hasLayer(overlayExclusiveLayers[layerName])) {
                getWMSInfo(latlng, fieldsToShow[layerName], overlayExclusiveLayers[layerName]);
            }
        }
    }

    async function getWMSInfo(latlng, fieldsList, layer) {
        try {
            const url = getFeatureInfoUrl(map, layer, latlng, { 'info_format': 'application/json' });
            const response = await fetch(url);
            const data = await response.json();

            if (data.features.length > 0) {
                const properties = data.features[0].properties;
                const content = fieldsList.map(field => {
                    if (properties[field] !== undefined && fieldConfig[field]) {
                        if (properties[field] === fieldConfig[field].nodata) {
                            return `No data`;
                        }
                        return `${fieldConfig[field].label} <strong>${fieldConfig[field].format(properties[field])}</strong> ${fieldConfig[field].unit}`;
                    }
                    return `No data`;
                }).join('<br>');

                L.popup()
                    .setLatLng(latlng)
                    .setContent(content)
                    .openOn(map);
            } else {
                L.popup()
                    .setLatLng(latlng)
                    .setContent("No data")
                    .openOn(map);
            }
        } catch (error) {
            console.error('Error fetching WMS info:', error);
            L.popup()
                .setLatLng(latlng)
                .setContent("Error fetching data")
                .openOn(map);
        }
    }
}

function setupColorBarControls() {
    // setup controls for colorbar adjustments
    // buttonId and settings for colorbar adjustments
    const adjustmentConfigurations = [
        { buttonId: 'subsidenceIncrease', change: 5, centerId: 'colorbarSubsidenceCenter', rightId: 'colorbarSubsidenceRight', minValue: 5, maxValue: 40, layer: overlayLayers['Subsidence'] },
        { buttonId: 'subsidenceDecrease', change: -5, centerId: 'colorbarSubsidenceCenter', rightId: 'colorbarSubsidenceRight', minValue: 5, maxValue: 40, layer: overlayLayers['Subsidence'] },
        { buttonId: 'seosonalIncrease', change: 5, centerId: 'colorbarSeosonalCenter', rightId: 'colorbarSeosonalRight', minValue: 5, maxValue: 15, layer: overlayLayers['Seasonal'] },
        { buttonId: 'seosonalDecrease', change: -5, centerId: 'colorbarSeosonalCenter', rightId: 'colorbarSeosonalRight', minValue: 5, maxValue: 15, layer: overlayLayers['Seasonal'] }
    ];
    setupListeners(adjustmentConfigurations);

    function setupListeners(configurations) {
        // Setup listeners for each item in configurations
        configurations.forEach(config => {
            setupAdjustmentListener(config);
        });
    }

    function setupAdjustmentListener({ buttonId, change, centerId, rightId, minValue, maxValue, layer }) {
        document.getElementById(buttonId).addEventListener('click', function(event) {
            event.preventDefault();
            adjustColorBarValue(change, centerId, rightId, minValue, maxValue, layer);
        });
    }

    function adjustColorBarValue(change, centerId, rightId, minValue, maxValue, layer) {
        // set new value
        const maxLabel = document.getElementById(rightId);
        const centerLabel = document.getElementById(centerId);
        const currentValue = parseInt(maxLabel.innerText, 10);
        let newValue = currentValue + change;

        newValue = Math.max(minValue, Math.min(maxValue, newValue));

        maxLabel.innerText = newValue;
        centerLabel.innerText = newValue / 2;
        updateEnvironmentVariableAndLayer(newValue * 10, layer);
    }

    function updateEnvironmentVariableAndLayer(maxValue, layer) {
        const envString = `c1:0;c2:${maxValue / 4};c3:${maxValue / 2};c4:${(maxValue * 3) / 4};c5:${maxValue}`;
        layer.setParams({ env: envString });
    }
}

function setupPopup() {
    // Setup more information popup
    const popup = document.getElementById('moreInfoPopup');
    const openPopupLink = document.getElementById('moreInfo');
    const closePopupLink = document.getElementById('closeInfo');

    function togglePopup(displayState) {
        popup.style.display = displayState;
    }

    function handleDocumentClick(event) {
        if (!popup.contains(event.target) && event.target !== popup) {
            togglePopup('none');
            document.removeEventListener('click', handleDocumentClick);
        }
    }

    // Show the popup when the page loads
    window.addEventListener('load', function () {
        togglePopup('none');
        document.addEventListener('click', handleDocumentClick);
    });

    openPopupLink.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePopup('block');
        document.addEventListener('click', handleDocumentClick);
    });

    closePopupLink.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePopup('none');
        document.removeEventListener('click', handleDocumentClick);
    });
}

/// translation
function translatePage() {
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.dataset.translate;
        el.textContent = translations[currentLanguage][key] || key;
    });
}

function changeLanguage(lang) {
    if (currentLanguage !== lang) {
        currentLanguage = lang;
        initializeControlPanel();
        translatePage();
        updateDocumentLanguageAttributes(lang);
        updateAboutFrame(lang);
    }
}

function updateDocumentLanguageAttributes(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.classList.toggle('rtl', lang === 'fa');
}

function updateAboutFrame(lang) {
    const aboutFrame = document.getElementById('aboutFrame');
    if (aboutFrame) {
        aboutFrame.src = lang === 'fa' ? 'about_fa.html' : 'about.html';
    }
}

function getTranslation(language, key) {
    return translations[language][key] || key;
}


// right click
function disableRightClick(){
    // disable right click
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
}