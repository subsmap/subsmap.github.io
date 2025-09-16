let currentLanguage = 'en';
let opacity = 1;

// base and overlay layers
const baseLayers = setupBaseLayers(currentLanguage);
const mapboxLayers = setupMapboxLayers();
Object.assign(baseLayers, mapboxLayers);

const overlayLayersLuh = setupOverlayLayersLuh();
const overlayLayerComet = setupOverlayLayersComet()
const overlayInclusiveLayers = setupInclusiveOverlayLayers();

const overlayLayers = {...overlayLayersLuh, ...overlayLayerComet, ...overlayInclusiveLayers}
const layersColorbars = {
    "Subsidence (LUH)":     "colorBarPanelSubsidence",
    "Seasonal":             "colorBarPanelSeasonal",
    "Subsidence (COMET)":   "colorBarPanelSubsidence",
    "Up component":         "colorBarPanelUp",
    "E-W component":        "colorBarPanelEW",
}

const overlayExclusiveLayers = { ...overlayLayersLuh, ...overlayLayerComet };

const groupedOverlays = {
    "LUH": overlayLayersLuh,
    "COMET": overlayLayerComet
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

map.attributionControl.addAttribution('©<a href="https://www.ipi.uni-hannover.de/en/haghighi/" target="_blank"> <strong>Mahmud Haghighi</strong></a> 2023-2025');
baseLayers['Terrain'].addTo(map);

let controlPanel;

// Setup
initializeControlPanel();
overlayLayers['Subsidence (LUH)'].addTo(map);
disableLayerInControlPanel('Satellite');
setupLayerChangeListeners();
setupMapboxLayerChangeListeners();
setupLonLatDisplay();
setupOpacityControl();
setupMapHover();
setupMapLayerChange();
document.addEventListener('DOMContentLoaded', setupMapClick);
document.addEventListener('DOMContentLoaded', setupColorBarControls);
document.addEventListener('DOMContentLoaded', setupPopup);
disableRightClick();
setupCollapsibleSettingsPanel()

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
    disableLayerInControlPanel('Satellite');
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

function setupMapboxLayerChangeListeners() {
    for (const layerName in mapboxLayers) {
        setupLogoShow(mapboxLayers[layerName]);
    }
    function setupLogoShow(layer) {
        layer.on('add', function() {
            setMapboxLogoVisible(true);
        });
        layer.on('remove', function() {
            const anyMapboxLayerActive = Object.values(mapboxLayers).some(l => map.hasLayer(l));
            setMapboxLogoVisible(anyMapboxLayerActive);
        });
    }
    function setMapboxLogoVisible(visible) {
        document.querySelector('.mapbox-logo').style.display = visible ? 'block' : 'none';
    }
}

function setupLayerChangeListeners() {
    for (const layerName in overlayLayers) {
        setupLayerExclusiveEvents(layerName)
        setupColorbarShow(layerName);
    }

    function setupColorbarShow(layerName) {
        const infoElementId = layersColorbars[layerName]
        const layer = overlayLayers[layerName];
        layer.on('add', () => {
            const el = document.getElementById(infoElementId);
            if (el) el.style.display = 'block';
        });
        layer.on('remove', () => {
            const el = document.getElementById(infoElementId);
            if (el) el.style.display = 'none';
        });
    }
    function setupLayerExclusiveEvents(layerName) {
        const layer = overlayExclusiveLayers[layerName];
        if (!layer) return;
        if (overlayExclusiveLayers[layerName]) {
            layer.on('add', () => {
            setTimeout(() => {
            for (const other of Object.values(overlayExclusiveLayers)) {
                if (other !== layer && map.hasLayer(other)) {
                    map.removeLayer(other);
                }
            }
            const cbar = layersColorbars[layerName]
            const el = document.getElementById(cbar);
            if (el) el.style.display = 'block';

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

        setTimeout(() => {
            document.getElementById('slider-value').textContent = (opacity*100).toFixed(0) + '%'
        }, 100);
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

        if (map.hasLayer(overlayLayers['Subsidence (LUH)'])) {
            getWMSInfo(latlng, 'subsidence_rate', overlayLayers['Subsidence (LUH)'], 'subsidenceVal');
        }
        if (map.hasLayer(overlayLayers['Subsidence (COMET)'])) {
            getWMSInfo(latlng, 'subsidence_rate', overlayLayers['Subsidence (COMET)'], 'subsidenceVal');
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
        if (value === 65535 || value === -9999) { // typically a nodata value
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
        'Subsidence (LUH)': ['subsidence_rate'],
        'Subsidence (COMET)': ['subsidence_rate'],
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
    const adjustmentConfigurations = [
        // subsidence
        { buttonId: 'subsidenceIncreaseRight', change: 5, centerId: 'colorbarSubsidenceCenter', minId: 'colorbarSubsidenceLeft', maxId: 'colorbarSubsidenceRight', minValue: -40, maxValue: 40, layers: [overlayLayers['Subsidence (LUH)'], overlayLayers['Subsidence (COMET)']], direction: 'right' },
        { buttonId: 'subsidenceDecreaseRight', change: -5, centerId: 'colorbarSubsidenceCenter', minId: 'colorbarSubsidenceLeft', maxId: 'colorbarSubsidenceRight', minValue: -40, maxValue: 40, layers: [overlayLayers['Subsidence (LUH)'], overlayLayers['Subsidence (COMET)']], direction: 'right' },

        { buttonId: 'subsidenceIncreaseLeft', change: 5, centerId: 'colorbarSubsidenceCenter', minId: 'colorbarSubsidenceLeft', maxId: 'colorbarSubsidenceRight', minValue: -40, maxValue: 40, layers: [overlayLayers['Subsidence (LUH)'], overlayLayers['Subsidence (COMET)']], direction: 'left' },
        { buttonId: 'subsidenceDecreaseLeft', change: -5, centerId: 'colorbarSubsidenceCenter', minId: 'colorbarSubsidenceLeft', maxId: 'colorbarSubsidenceRight', minValue: -40, maxValue: 40, layers: [overlayLayers['Subsidence (LUH)'], overlayLayers['Subsidence (COMET)']], direction: 'left' },
        // seasonal
        { buttonId: 'seosonalIncreaseRight', change: 5, centerId: 'colorbarSeosonalCenter', minId: 'colorbarSeosonalLeft', maxId: 'colorbarSeosonalRight', minValue: 0, maxValue: 10, layers: [overlayLayers['Seasonal']], direction: 'right' },
        { buttonId: 'seosonalDecreaseRight', change: -5, centerId: 'colorbarSeosonalCenter', minId: 'colorbarSeosonalLeft', maxId: 'colorbarSeosonalRight', minValue: 0, maxValue: 10, layers: [overlayLayers['Seasonal']], direction: 'right' },

        { buttonId: 'seosonalIncreaseLeft', change: 5, centerId: 'colorbarSeosonalCenter', minId: 'colorbarSeosonalLeft', maxId: 'colorbarSeosonalRight', minValue: 0, maxValue: 10, layers: [overlayLayers['Seasonal']], direction: 'left' },
        { buttonId: 'seosonalDecreaseLeft', change: -5, centerId: 'colorbarSeosonalCenter', minId: 'colorbarSeosonalLeft', maxId: 'colorbarSeosonalRight', minValue: 0, maxValue: 10, layers: [overlayLayers['Seasonal']], direction: 'left' },

        // up
        { buttonId: 'upIncreaseRight', change: 5, centerId: 'colorbarUpCenter', minId: 'colorbarUpLeft', maxId: 'colorbarUpRight', minValue: -30, maxValue: 30, layers: [overlayLayers['Up component']], direction: 'right' },
        { buttonId: 'upDecreaseRight', change: -5, centerId: 'colorbarUpCenter', minId: 'colorbarUpLeft', maxId: 'colorbarUpRight', minValue: -30, maxValue: 30, layers: [overlayLayers['Up component']], direction: 'right' },

        { buttonId: 'upIncreaseLeft', change: 5, centerId: 'colorbarUpCenter', minId: 'colorbarUpLeft', maxId: 'colorbarUpRight', minValue: -30, maxValue: 30, layers: [overlayLayers['Up component']], direction: 'left' },
        { buttonId: 'upDecreaseLeft', change: -5, centerId: 'colorbarUpCenter', minId: 'colorbarUpLeft', maxId: 'colorbarUpRight', minValue: -30, maxValue: 30, layers: [overlayLayers['Up component']], direction: 'left' },

        // ew
        { buttonId: 'ewIncreaseRight', change: 5, centerId: 'colorbarEWCenter', minId: 'colorbarEWLeft', maxId: 'colorbarEWRight', minValue: -30, maxValue: 30, layers: [overlayLayers['E-W component']], direction: 'right' },
        { buttonId: 'ewDecreaseRight', change: -5, centerId: 'colorbarEWCenter', minId: 'colorbarEWLeft', maxId: 'colorbarEWRight', minValue: -30, maxValue: 30, layers: [overlayLayers['E-W component']], direction: 'right' },

        { buttonId: 'ewIncreaseLeft', change: 5, centerId: 'colorbarEWCenter', minId: 'colorbarEWLeft', maxId: 'colorbarEWRight', minValue: -30, maxValue: 30, layers: [overlayLayers['E-W component']], direction: 'left' },
        { buttonId: 'ewDecreaseLeft', change: -5, centerId: 'colorbarEWCenter', minId: 'colorbarEWLeft', maxId: 'colorbarEWRight', minValue: -30, maxValue: 30, layers: [overlayLayers['E-W component']], direction: 'left' },

    ];

    adjustmentConfigurations.forEach(config => {
        setupAdjustmentListener(config);
    });

    function setupAdjustmentListener({ buttonId, change, centerId, minId, maxId, minValue, maxValue, layers, direction }) {
        document.getElementById(buttonId).addEventListener('click', function(event) {
            event.preventDefault();
            adjustColorBarValue(change, centerId, minId, maxId, minValue, maxValue, layers, direction);
        });
    }

    function adjustColorBarValue(change, centerId, minId, maxId, minValue, maxValue, layers, direction) {
        const minLabel = document.getElementById(minId);
        const maxLabel = document.getElementById(maxId);
        const centerLabel = document.getElementById(centerId);
        let minVal = parseInt(minLabel.innerText, 10);
        let maxVal = parseInt(maxLabel.innerText, 10);

        if (direction === 'right') {
            if (change < 0 && maxVal > -5 && maxVal <= 5) change = -1;
            if (change > 0 && maxVal >= -5 && maxVal < 5) change = 1;

            let newMax = Math.max(minValue, Math.min(maxValue, maxVal + change));
            if (newMax <= minVal) return;
            maxLabel.innerText = newMax;
            centerLabel.innerText = minVal + (newMax - minVal) / 2;
            layers.forEach(layer => updateEnvironmentVariableAndLayer(minVal * 10, newMax * 10, layer));
        } else {
            if (change < 0 && minVal <= 5 && minVal > -5) change = -1;
            if (change > 0 && minVal < 5 && minVal >=-5) change = 1;

            let newMin = Math.max(minValue, Math.min(maxValue, minVal + change));
            if (newMin >= maxVal) return;
            minLabel.innerText = newMin;
            centerLabel.innerText = maxVal - (maxVal - newMin) / 2;
            layers.forEach(layer => updateEnvironmentVariableAndLayer(newMin * 10, maxVal * 10, layer));
        }
    }

    function updateEnvironmentVariableAndLayer(minValue, maxValue, layer) {
        const c1 = Math.round(minValue);
        const c2 = Math.round(minValue + (maxValue - minValue) / 4);
        const c3 = Math.round(minValue + (maxValue - minValue) / 2);
        const c4 = Math.round(minValue + (maxValue - minValue) * 3 / 4);
        const c5 = Math.round(maxValue);
        const envString = `c1:${c1};c2:${c2};c3:${c3};c4:${c4};c5:${c5}`;
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

function setupCollapsibleSettingsPanel() {
    const settingPanel = document.getElementById('settingPannel');
    const toggleBar = document.getElementById('settingToggleBar');
    const toggleSymbol = document.getElementById('toggleSymbol');

    toggleBar.addEventListener('click', function() {
        if (settingPanel.classList.contains('collapsed')) {
            settingPanel.classList.remove('collapsed');
            toggleSymbol.innerHTML = '&#10134;';
        } else {
            settingPanel.classList.add('collapsed');
            toggleSymbol.innerHTML = '&#10133;';
        }
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
        updateBaseLayersForLanguage(lang);
        initializeControlPanel();
        translatePage();
        updateDocumentLanguageAttributes(lang);
        updateAboutFrame(lang);
    }
}

function updateBaseLayersForLanguage(lang) {
    let activeBaseLayerKey = null;
    for (const [key, layer] of Object.entries(baseLayers)) {
        if (map.hasLayer(layer)) {
            activeBaseLayerKey = key;
            map.removeLayer(layer);
        }
    }

    Object.assign(baseLayers, setupBaseLayers(lang));

    const layerToAdd = baseLayers[activeBaseLayerKey] || baseLayers['Terrain'];
    layerToAdd.addTo(map);
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

function disableLayerInControlPanel(layerName) {
    document.querySelectorAll('.leaflet-control-layers-base label').forEach(label => {
        if (label.textContent.trim() === getTranslation(currentLanguage, layerName)) {
            const input = label.querySelector('input[type="radio"], input[type="checkbox"]');
            if (input) {
                input.disabled = true;
                label.style.opacity = 0.5;
            }
        }
    });
}