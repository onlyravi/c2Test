/*
 _____                             _   _____  _   _            _ _   _       _____ _____ _____
/  __ \                           | | / __  \| | | |          | | | | |     |  __ \_   _/  ___|
| /  \/ ___  _ __  _ __   ___  ___| |_`' / /'| |_| | ___  __ _| | |_| |__   | |  \/ | | \ `--.
| |    / _ \| '_ \| '_ \ / _ \/ __| __| / /  |  _  |/ _ \/ _` | | __| '_ \  | | __  | |  `--. \
| \__/\ (_) | | | | | | |  __/ (__| |_./ /___| | | |  __/ (_| | | |_| | | | | |_\ \_| |_/\__/ /
 \____/\___/|_| |_|_| |_|\___|\___|\__\_____/\_| |_/\___|\__,_|_|\__|_| |_|  \____/\___/\____/

*/

var map;
var geo_request_type = 'json';

var geo_host = 'https://geo.fcc.gov';
var geo_space = 'c2h_2020';
var geo_workspace = 'c2h_2020';

var table_name = 'c2hgis_2022_release_ui_';
var table_name_dl = 'Connect2Health_2022_release_';

var zoom_layer_type = 'county';  // selected zoom
var geo_type = 'county';         // calculated geog type based on zoom
var geo_lat = 40;
var geo_lng = -93;
var geo_id;
var national_data;
var geo_data;
var geo_prop;
var cur_tab = 'insights';
var curr_health_measure_type = 'opioid';    // sub menu- opioid or health
var click_feature_option = {
    'color': '#ffcc44',
    'fillColor': '#ffffff',
    'weight': 5,
    'fillOpacity': 0.0
};
var click_data = [];
var mb_accessToken = 'pk.eyJ1IjoiZmNjIiwiYSI6IlA5cThBQTQifQ.EbifLm_7JkQ1uI_0_qYEAA';
var hash_obj = {};
var auto_geo_layers = [geo_space + ':' + table_name + 'state', geo_space + ':' + table_name + 'county'];

//**************************************************************************

$(document).ready(function () {
    // Set initial dataset (national)
    try {
        $.ajax({
            type: 'GET',
            url: geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=' + geo_space + ':' + table_name + 'nation&maxFeatures=1&outputFormat=application/json',
            success: function (resp) {
                national_data = resp;
                geo_prop = national_data.features[0].properties;
            }
        }).done(function () {
            init();
        });
    } catch (err) {
        console.log(err);
    }
});

function createMap() {
    L.mapbox.accessToken = mb_accessToken;

    map = L.map('map', {
        zoomControl: false,
        attributionControl: true,
        maxZoom: 19,
        minZoom: 3
    }).setView([31.5, -96.4], 4);

    map.attributionControl.addAttribution('<a href="http://fcc.gov">FCC</a>&nbsp|&nbsp<a href="https://www.fcc.gov/about-fcc/fcc-initiatives/connect2healthfcc">Connect2Health</a>');

    var baseStreet = L.mapbox.styleLayer('mapbox://styles/mapbox/light-v10').addTo(map);
    var baseSatellite = L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-streets-v11');
    var baseTerrain = L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11');

    L.control.zoom({
        'zoomInText': 'Zoom In',
        'zoomOutText': 'Zoom Out'
    }).addTo(map);

    L.control.scale({
        position: 'bottomleft'
    }).addTo(map);

    L.mapbox.geocoder('mapbox.places-v1');

    new L.Control.Layers({
        'Street': baseStreet,
        'Satellite': baseSatellite,
        'Terrain': baseTerrain
    }, {}, {
        position: 'topleft'
    }).addTo(map);

    // Add custom geolocation control
    L.Control.CustomCtrl = L.Control.extend({
        onAdd: function (map) {
            return document.getElementById('custom-controls');
        },
        onRemove: function (map) {
            // Nothing to do here
        }
    });

    L.control.customCtrl = function (opts) {
        return new L.Control.CustomCtrl(opts);
    };

    L.control.customCtrl({position: 'topleft'}).addTo(map);

    // Add full screen control
    L.control.fullscreen({position: 'topleft'}).addTo(map);

    var zoomLayerControl = '<form class="leaflet-control-layers-list leaflet-control-layers-list-zoom"><div class="leaflet-control-layers-zoom">' +
        '<label><input type="radio" class="leaflet-control-layers-selector-zoom zoom-layers-control" name="leaflet-zoom-layers" id="leaflet-zoom-layers-auto"><span> Automatic</span></label>' +
        '<label><input type="radio" class="leaflet-control-layers-selector-zoom zoom-layers-control" name="leaflet-zoom-layers" id="leaflet-zoom-layers-county" checked="checked"><span> County</span></label>' +
        '<label><input type="radio" class="leaflet-control-layers-selector-zoom zoom-layers-control" name="leaflet-zoom-layers" id="leaflet-zoom-layers-state"><span> State</span></label>' +
        '</div></form>';

    $('.leaflet-control-layers').append(zoomLayerControl);

    $('input[type=radio][name=leaflet-zoom-layers]').on('change', function () {
        zoom_layer_type = $(this).attr('id').split('-')[3];

        if (zoom_layer_type === 'auto') {
            var zoom = map.getZoom();

            if (zoom <= 6) geo_type = 'state';
            else geo_type = 'county';
        } else {
            geo_type = zoom_layer_type;
        }

        generateMenu();
    });

    $('.leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-fullscreen-button, .leaflet-control-layers-toggle').attr('data-placement', 'right').tooltip();

    $('.leaflet-control-layers-toggle').html('<span class="sr-only">Layers</span>');

    $('.leaflet-control-layers-toggle, .leaflet-control-layers').on('mouseover', function () {
        $('.leaflet-control-layers-separator').css('display', 'block');
        $('form.leaflet-control-layers-list-zoom').show();
    }).on('mouseout', function () {
        $('.leaflet-control-layers-separator').css('display', 'none');
        $('form.leaflet-control-layers-list-zoom').hide();
    });

    L.tileLayer.wms(geo_host + '/fcc/gwc/service/wms?', {
        format: 'image/png',
        transparent: true,
        layers: 'fcc:state2014',
        styles: 'state_border'
    }).setZIndex(55555555555555555555).addTo(map);

    map.on('moveend', function () {
        setHash();
    });

    map.on('zoomend', function () {
        if (zoom_layer_type === 'auto') {
            var zoom = map.getZoom();
            var new_geo_type;

            if (zoom <= 6) new_geo_type = 'state';
            else new_geo_type = 'county';

            if (geo_type !== new_geo_type) {
                // geog levels changed, so redraw
                geo_type = new_geo_type;
                if (cur_tab === 'insights' || (cur_tab === 'broadband' )) {
                    generateMenu();
                }
            }
        }
        setHash();
    });

    map.on('click', function (e) {
        if (zoom_layer_type === 'auto') {
            var zoom = map.getZoom();

            if (zoom <= 6) geo_type = 'state';
            else geo_type = 'county';
        }

        geo_lat = e.latlng.lat;
        geo_lng = e.latlng.lng;

        getData(false);
    });
}

function getCurrentLocation(load) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            geo_lat = lat;
            geo_lng = lng;

            getData(true);

        }, function (error) {
            if (load) {
                setNationwide();
            } else {
                window.alert('Current location not found.');
            }
        }, {
            timeout: 4000
        });
    } else {
        if (load) {
            setNationwide();
        } else {
            window.alert('Current location not found.');
        }
    }
    return false;
}

function getGeocode() {
    var search_input = $('#input-location').val();
    if (!/united states/i.test(search_input)) {
        search_input = search_input + ', United States';
    }

    var geocode_url = 'https://api.mapbox.com/v4/geocode/mapbox.places/' + encodeURIComponent(search_input) + '.json?access_token=' + mb_accessToken;

    $.ajax({
        type: 'GET',
        url: geocode_url,
        dataType: 'json',
        success: function (data) {
            if (data.features[0].place_name !== 'United States') {

                var geo_bounds = data.features[0].bbox;

                if (geo_bounds) {
                    map.fitBounds([
                        [geo_bounds[1], geo_bounds[0]],
                        [geo_bounds[3], geo_bounds[2]]
                    ]);
                } else {
                    map.fitBounds([
                        [data.features[0].center[1], data.features[0].center[0]]
                    ]);
                }

                geo_lat = data.features[0].center[1];
                geo_lng = data.features[0].center[0];

                getData();
            } else {
                window.alert('Location not found.');
            }
        },
        error: function (request, status, error) {
            window.alert('Location not found.');
        }
    });
}

function getGeocodeCounty() {
    geo_type = 'county';

    var search_input = $('#input-county').val();
    var county_name = search_input.split(',')[0];
    var state_abbr = search_input.split(',')[1].toUpperCase();
    var state_fips = states_abbr[state_abbr.trim()].fips;
    var jsonpCallbackVal = false;

    var cql_filter_str = 'geography_desc+ILIKE+%27' + county_name.replace(/'/g, "%27%27") + '%27+AND+geography_id+LIKE+%27' + state_fips + '%25%27';

    var geocode_url = geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=' + geo_space + ':' + table_name + 'county&maxFeatures=1&outputFormat=application/json&cql_filter=' + cql_filter_str;

    if (geo_request_type === 'jsonp') {
        geocode_url = geocode_url + '&format_options=callback:callbackData';
        jsonpCallbackVal = 'callbackData';
    }

    $.ajax({
        type: 'GET',
        url: geocode_url,
        dataType: geo_request_type,
        jsonpCallback: jsonpCallbackVal,
        success: function (data) {
            if (data.features[0]) {
                geo_lat = data.features[0].properties.centroid.coordinates[1];
                geo_lng = data.features[0].properties.centroid.coordinates[0];
                getData(true);

                if (geo_type === 'county' || geo_type === 'state') {
                    var geo_bounds = data.bbox;
                    if (geo_bounds) {
                        map.fitBounds([
                            [geo_bounds[1], geo_bounds[0]],
                            [geo_bounds[3], geo_bounds[2]]
                        ]);
                    }
                }
            } else {
                window.alert('County not found.');
            }
        },
        error: function (request, status, error) {
            window.alert('County not found.');
        }
    });
}

function defineOpioidNull(measure, value) {
    if (measure.includes('pct')) {
        if (value === null) return 'Unavailable';
        else return formatStatAppend(value, null, '%');
    } else {
        if (value === null) return 'Not reported';
        else return formatStatAppend(value, null, measure === 'opioid_prescribing_rate' ? ' per 100' : ' per 100,000');
    }
}

function getData(zoomCenter) {
    var data_type = geo_type;
    var jsonpCallbackVal = false;

    var encryptedLng = CryptoJS.AES.encrypt(geo_lng);
    var encryptedLat = CryptoJS.AES.encrypt(geo_lat);


    if (zoom_layer_type !== 'auto') {
        data_type = zoom_layer_type;
    }

    var data_url = geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=' + geo_space + ':' + table_name + data_type + '&maxFeatures=1&outputFormat=application/json&cql_filter=contains(geom,%20POINT(' + CryptoJS.AES.decrypt(encryptedLng) + ' ' + CryptoJS.AES.decrypt(encryptedLat) + '))';

    if (geo_request_type === 'jsonp') {
        data_url = data_url + '&format_options=callback:callbackData';
        jsonpCallbackVal = 'callbackData';
    }

    $.ajax({
        type: 'GET',
        url: data_url,
        dataType: geo_request_type,
        jsonpCallback: jsonpCallbackVal,
        success: function (data) {
            processData(data, zoomCenter);
        }
    });
}

function processData(data, zoomCenter) {
    if (data.features) {
        if (data.features.length === 1) {
            var geography_id = data.features[0].properties.geography_id;

            if (geo_id !== geography_id) {
                geo_id = geography_id;
                geo_data = data;
                geo_prop = geo_data.features[0].properties;

                setDownloadLinks();
                updateStats();
                createCharts();
                clearClickFeature();

                if (geo_type !== 'national') {
                    if (zoomCenter) {
                        if (geo_type === 'county' || geo_type === 'state') {
                            var geo_bounds = data.bbox;
                            if (geo_bounds) {
                                map.fitBounds([
                                    [geo_bounds[1], geo_bounds[0]],
                                    [geo_bounds[3], geo_bounds[2]]
                                ]);
                            }
                        }
                    }

                    var click_feature = L.mapbox.featureLayer(geo_data).setStyle(click_feature_option).addTo(map);

                    click_feature.on('click', function (e) {
                        geo_lat = e.latlng.lat;
                        geo_lng = e.latlng.lng;
                        var zoom = map.getZoom();

                        getData(false);
                    });
                }
            }

            click_data.push(click_feature);
        }
    }
}

function setDownloadLinks() {
    var data_type = geo_prop.geography_type === 'national' ? 'nation' : geo_prop.geography_type;
    var download_layer = table_name_dl + data_type;

    var download_filter = '';
    if (data_type !== 'nation') {
        $('#dl1-geom').show();
        download_filter = '&cql_filter=geography_id=\'' + geo_prop.geography_id + '\'';
    } else {
        $('#dl1-geom').hide();
    }

    $('#download-data-json').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=json&typeName=' + geo_space + ':' + download_layer + '_geo' + download_filter);
    $('#download-data-xml').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=GML3&typeName=' + geo_space + ':' + download_layer + '_geo' + download_filter);
    $('#download-data-shp').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=shape-zip&typeName=' + geo_space + ':' + download_layer + '_geo' + download_filter);
    $('#download-data-kml').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=KML&typeName=' + geo_space + ':' + download_layer + '_geo' + download_filter);
    $('#download-data-csv').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=csv&typeName=' + geo_space + ':' + download_layer + download_filter);
}

function init() {
    createMap();

    // initialize sliders
    $('#slider-bbOpioid').slider();
    $('#slider-broadband').slider();
    $('#slider-opioid').slider();
    $('#slider-health').slider();

    // initialize bootstrap-select
    $('.selectpicker').selectpicker({});

    // If hash exists then load hash variables; otherwise set the hash in the URL then load it.
    if (window.location.hash) {
        loadHash();
    } else {
        // default view- overview tab
        setupOverviewTab();
    }

    // external links
    $('.link-ext').on('click', extLinks);

    // main tab switch
    $('.layer-switch').on('click', 'a', function (e) {
        e.preventDefault();
        cur_tab = $(this).attr('id');

        generateMenu();
    });

    // opioid/chronic disease tab switch
    $('.health-measure-type').on('change', function () {
        curr_health_measure_type = $(this).val();

        if (cur_tab === 'broadband') {
            setupBroadbandTab();
        } else if (cur_tab === 'insights') {
            setupOverviewTab();
        } else if (cur_tab === 'health') {
            setupHealthTab();
        }
    });

    // dropdown selections
    $('.select-insight').on('change', function () {
        if ($(this).attr('id')) {
            var cur_type = $(this).attr('id').split('-')[2];

            if (cur_type === 'bbOpioid' && $('#select-in-bbOpioid').val() === 'none') {
                // hide sliders
                $('#bbOpioidTrendsFilter').hide();
                $('.bbOpioid-slider').parent('div').hide();
                $('#slider-bbOpioid').parent('div').parent('div').hide();

                setupBroadbandTab();
            } else {
                // show bb sliders
                $('#bbOpioidTrendsFilter').show();
                $('.bbOpioid-slider').parent('div').show();
                $('#slider-bbOpioid').parent('div').parent('div').show();

                setSlider(cur_type);
            }
            updateStats();
            setHash();
        }
    });

    // Overview tab "data overlays" dropdown
    $('#select-in-count').on('change', function () {
        setCount();
        setHash();
    });

    // Overview tab "rural filter" dropdown
    $('#ov-select-demographics').on('change', function () {
        setSlider(curr_health_measure_type);
        setSlider('broadband');
    });

    // Health tab -> chronic disease tab -> "health measures" dropdown
    $('#health-sec-type').on('change', function () {
        setupHealthTab();
    });

    // Health tab -> opioid tab -> "opioid measures" dropdown
    $('#opioid-sec-type').on('change', function () {
        setupHealthTab();
    });

    // Health tab "rural filter" dropdown
    $('#hh-select-demographics').on('change', function () {
        setupHealthTab();
    });

    // Health tab "broadband filter" dropdown
    $('#adv-select-broadband').on('change', function () {
        setupHealthTab();
    });

    // Broadband tab -> chronic disease tab -> "health measures" dropdown
    $('#adv-select-health').on('change', function () {
        setupBroadbandTab();
    });

    // Broadband tab "rural filter" dropdown
    $('#bb-select-demographics').on('change', function () {
        if (curr_health_measure_type === 'opioid' && $('#select-in-bbOpioid').val() !== 'none') {
            setSlider('bbOpioid');
        } else {
            setupBroadbandTab();
        }
    });

    // Broadband tab "fixed broadband availability" tabs
    $('.broadband-type').on('change', function () {
        setupBroadbandTab();
    });

    // Broadband tab trends tabs (increasing / decreasing / all)
    $('[name="bbOpioidTrendsFilter"]').on('change', function () {
        setSlider('bbOpioid');
    });

    // Demographics tab dropdown
    $('#pop-sec-type').on('change', function () {
        setupPopTab();
    });

    // current location
    $('#btn-currentLoc').click(function (e) {
        getCurrentLocation(false);
        return false;
    });

    $('#input-loc-search').on('click', function (e) {
        e.preventDefault();
        getGeocode();
    });

    $('#input-county-search').on('click', function (e) {
        var search_input = $('#input-county').val();

        e.preventDefault();

        if (search_input.split(',')[1] !== undefined) {
            getGeocodeCounty();
        } else {
            window.alert('Please enter a valid county and state abbreviation.');
        }
    });

    // nationwide
    $('#btn-nation').on('click', function (e) {
        e.stopPropagation();
        setNationwide();
    });

    // Download links
    setDownloadLinks();

    $('.data-download-link').each(function () {
        var dlId = $(this).text();
        var geoTypeId = $(this).parent('fieldset').attr('id');
        var dlType = dlId === 'XML' ? 'GML3' : dlId === 'SHP' ? 'shape-zip' : dlId;
        var geoType = geoTypeId === 'dl-data-states' ? 'state' : 'county';

        var maxFeatures = geoType === 'state' ? '55' : geoType === 'county' ? '3300' : '1';

        var url = geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=' + maxFeatures + '&outputFormat=' + dlType + '&typeName=' + geo_space + ':' + table_name_dl + geoType;
        if (dlId !== 'CSV') url += '_geo';

        $(this).attr('href', url);
    });

    $('.in-tooltip, .hh-tooltip, .bb-tooltip').tooltip();

    $('#in-tooltip-opioid').tooltip({
        html: true,
        template: '<div class="tooltip long-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    });

    $('#carousel-bb').bind('slid.bs.carousel', function (e) {
        createCharts();
    });

    $('#carousel-pop').bind('slid.bs.carousel', function (e) {
        createCharts();
    });

    $('#input-search-switch').on('click', 'a', function (e) {
        var search = $(e.currentTarget).data('value');
        e.preventDefault();

        $('#input-location').val('');
        $('#input-county').val('');

        if (search === 'county') {
            $("#input-location").css('display', 'none');
            $("#input-county").css('display', 'block');
            $("#span-location-search").css('display', 'none');
            $("#span-county-search").css('display', 'table-cell');
            $("#btn-label").text('County');
        } else if (search === 'address') {
            $("#input-county").css('display', 'none');
            $("#input-location").css('display', 'block');
            $("#span-county-search").css('display', 'none');
            $("#span-location-search").css('display', 'table-cell');
            $("#btn-label").text('Address');
        }
    });

    $('#input-location').keypress(function (e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-loc-search').click();
            return false;
        }
    });

    $('#input-county').keypress(function (e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#input-county-search').click();
            return false;
        }
    });

    $('#input-location').autocomplete({
        source: function (request, response) {
            var search_input = request.term;

            var data_url = 'https://api.mapbox.com/v4/geocode/mapbox.places/' + encodeURIComponent(search_input) + '.json?access_token=' + mb_accessToken;

            $.ajax({
                type: 'GET',
                url: data_url,
                dataType: 'json',
                success: function (data) {
                    var ft = data.features;
                    var autoresults = [];
                    for (var i = 0; i < ft.length; i++) {
                        if (ft[i].place_name.match(/United States$/)) {
                            var type = 'county';
                            if (ft[i].id.startsWith("region")) {
                                type = 'state';
                            }
                            autoresults.push({
                                'label': '' + ft[i].place_name,
                                'value': [ft[i].geometry.coordinates[0], ft[i].geometry.coordinates[1], type]
                            });
                        }
                    }
                    response(autoresults);
                }
            });
        },
        minLength: 3,
        focus: function (event, ui) {
            event.preventDefault();
            $('#input-location').val(ui.item.label);

            geo_type = 'county';

            if (ui.item.value[2] === 'state') {
                geo_type = 'state';
            }

            geo_lng = ui.item.value[0];
            geo_lat = ui.item.value[1];

            getData(true);

        },
        select: function (event, ui) {
            event.preventDefault();
            $("#input-location").val(ui.item.label);

            setTimeout(function () {
                geo_type = 'county';

                if (ui.item.value[2] === 'state') {
                    geo_type = 'state';
                }

                geo_lng = ui.item.value[0];
                geo_lat = ui.item.value[1];

                getData(true);

            }, 200);
        },
        open: function () {
            $(this).removeClass('ui-corner-all').addClass('ui-corner-top');
        },
        close: function () {
            $(this).removeClass('ui-corner-top').addClass('ui-corner-all');
        }
    });

    $('#input-county').autocomplete({
        source: function (request, response) {
            var county = request.term;
            var jsonpCallbackVal = false;

            var data_url = geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=' + geo_space + ':' + table_name + 'county&maxFeatures=35&outputFormat=application/json&cql_filter=geography_desc+ILIKE+%27' + county + '%25%27';

            if (geo_request_type === 'jsonp') {
                data_url = data_url + '&format_options=callback:callbackData';
                jsonpCallbackVal = 'callbackData';
            }

            $.ajax({
                type: 'GET',
                url: data_url,
                dataType: geo_request_type,
                jsonpCallback: jsonpCallbackVal,
                success: function (data) {
                    var ft = data.features;
                    var autoresults = [];
                    for (var i = 0; i < ft.length; i++) {
                        var abbr = states_data[ft[i].properties.geography_id.substring(0, 2)].abbr;
                        autoresults.push({
                            'label': '' + ft[i].properties.geography_desc + ', ' + abbr,
                            'value': ft[i].properties.centroid.coordinates
                        });
                    }
                    response(autoresults);
                }
            });
        },
        minLength: 3,
        focus: function (event, ui) {
            event.preventDefault();
            $('#input-county').val(ui.item.label);

            geo_type = 'county';

            geo_lng = ui.item.value[0];
            geo_lat = ui.item.value[1];

            getData(true);
        },
        select: function (event, ui) {
            event.preventDefault();
            $('#input-county').val(ui.item.label);

            setTimeout(function () {
                geo_type = 'county';

                geo_lng = ui.item.value[0];
                geo_lat = ui.item.value[1];

                getData(true);

            }, 200);
        },
        open: function () {
            $(this).removeClass('ui-corner-all').addClass('ui-corner-top');
        },
        close: function () {
            $(this).removeClass('ui-corner-top').addClass('ui-corner-all');
        }
    });

    // Prevent click event on disabled radio buttons
    $('.btn-group').on('click', '.disabled', function (event) {
        event.preventDefault();
        return false;
    });

    // Keyboard accessible legend scales
    $('.legend-table-square').find('tr:first td').on('focusin', function () {
        $(this).find('span').tooltip('show');
        var titleTxt = $(this).find('span').attr('data-original-title');
        $(this).find('span').html('<span class="sr-only">' + titleTxt + '</span>');
    }).on('focusout', function () {
        $(this).find('span').tooltip('hide');
        $(this).find('.sr-only').remove();
    });

    // Tooltip is screenreader
    $('.fa-info-circle').on('focusin', function () {
        var titleTxt = $(this).attr('data-original-title');
        $(this).html('<span class="sr-only">' + titleTxt + '</span>');
    }).on('focusout', function () {
        $(this).html('');
    });
}

function clearMap(type) {
    // remove data overlays
    if (type === 'dataOverlays') {
        map.eachLayer(function (layer) {
            if (layer.options.styles === geo_workspace + ':count_ip_county_all' ||
                layer.options.styles === geo_workspace + ':count_ip_state_all' ||

                layer.options.styles === geo_workspace + ':count_pop_county_all' ||
                layer.options.styles === geo_workspace + ':count_pop_state_all' ||

                layer.options.styles === geo_workspace + ':count_pcp_county_all' ||
                layer.options.styles === geo_workspace + ':count_pcp_state_all'
            ) {
                map.removeLayer(layer);
            }
        });
    } else {
        // remove all non base layers
        map.eachLayer(function (layer) {
            if (layer.options.styles && layer.options.styles !== 'state_border') map.removeLayer(layer);
        });
    }
}

function clearClickFeature() {
    for (var i = 0; i < click_data.length; i++) {
        if (map.hasLayer(click_data[i])) {
            map.removeLayer(click_data[i]);
        }
    }
    click_data.length = 0;
}


function setNationwide() {
    map.setView([40, -95], 3);
    geo_id = null;

    geo_prop = national_data.features[0].properties;

    clearClickFeature();
    createCharts();
    updateStats();
    setHash();
    setDownloadLinks();
}

function setSlider(slider, values) {
    var min, max, step, currentVals;
    var dropdown = $('#select-in-' + slider).val();

    var ref = slider === 'opioid' || slider === 'bbOpioid' ? 'opioid' : slider;
    var column = insight_ly[ref][dropdown].column;

    var nationAvg = national_data.features[0].properties[column];
    nationAvg = nationAvg ? Math.round(nationAvg * 10) / 10 : null;

    var tooltip = insight_ly[ref][dropdown].tooltip;

    // Add to tooltip
    if (ref === 'opioid' || slider === 'health') tooltip += ' National Average: ' + nationAvg;

    if (slider === 'broadband') {
        if (column === 'dl_tiers') tooltip += ' Current speed benchmark: 25';
        else if (column === 'ul_tiers') tooltip += ' Current speed benchmark: 3'
        else tooltip += ' National Average: ' + nationAvg;
    }

    $('#in-tooltip-' + slider).attr('title', tooltip).tooltip('fixTitle');

    // get stored values/ past selections from user
    if (ref !== 'opioid') {
        currentVals = insight_ly[slider][dropdown]['slider'];
    } else {
        if (slider === 'bbOpioid' && column.includes('pct')) {
            var trendType = $('[name=bbOpioidTrendsFilter]:checked').val();
            currentVals = insight_ly[slider][dropdown]['slider_' + trendType][geo_type];
        } else {
            currentVals = insight_ly[slider][dropdown]['slider'][geo_type];
        }
    }

    if (slider === 'broadband' || slider === 'health') {
        min = insight_ly[slider][dropdown]['min'];
        max = insight_ly[slider][dropdown]['max'];
        step = insight_ly[slider][dropdown]['step'];

        if (currentVals.length) values = currentVals;
        else values = values ? values : insight_ly[slider][dropdown]['values'];

    } else if (slider === 'opioid') {
        step = 0.09999999999999;
        min = insight_ly['opioid'][dropdown][geo_type + 'Min'];
        max = insight_ly['opioid'][dropdown][geo_type + 'Max'];

        if (currentVals.length) values = currentVals;
        else values = values ? values : [nationAvg, max];

        if (!dropdown.includes('pct') && !dropdown.includes('prescribing')) {
            $('.label-opioid-sub-yr').show();
        } else {
            $('.label-opioid-sub-yr').hide();
        }
        $('.national-avg').text(nationAvg);
    } else if (slider === 'bbOpioid') {
        var bbValues;

        // TREND =====================================
        if (column.includes('pct')) {
            $('#bbOpioidTrendsFilter').show();
            $('.bbOpioid-slider').find('p').hide();
            $('.bbOpioid-slider').find('.slider-label').show();

            step = 50;

            var trendType = $('[name=bbOpioidTrendsFilter]:checked').val(); // increasing decreasing all

            max = insight_ly['opioid'][dropdown][geo_type + 'Max'];
            min = insight_ly['opioid'][dropdown][geo_type + 'Min'];

            // If max value < 0, hide the slider and disable 'Increasing' button
            if (max <= 0) {
                $('#bbOpioid-increasing').prop('disabled', true);
                $('#bbOpioid-increasing').parent('label').removeClass('active').addClass('disabled');

                if (trendType === 'increasing') {
                    // user currently on increasing, switch to decreasing
                    $('[name=bbOpioidTrendsFilter][value=decreasing]').prop('checked', true);
                    trendType = 'decreasing';
                }
            } else {
                $('#bbOpioid-increasing').parent('label').removeClass('disabled');
                $('#bbOpioid-increasing').prop('disabled', false);
            }

            // If min > 0, disable 'decreasing'
            if (min >= 0) {
                $('#bbOpioid-decreasing').prop('disabled', true);
                $('#bbOpioid-decreasing').parent('label').removeClass('active').addClass('disabled');

                if (trendType === 'decreasing') {
                    // user currently on decreasing; switch to increasing
                    $('[name=bbOpioidTrendsFilter][value=increasing]').prop('checked', true);
                    trendType = 'increasing';
                }
            } else {
                $('#bbOpioid-decreasing').parent('label').removeClass('disabled');
                $('#bbOpioid-decreasing').prop('disabled', false);
            }

            max = Math.ceil(max / 50) * 50;

            var maxLabel = Math.ceil((insight_ly['opioid'][dropdown][geo_type + 'Max'] / 50) * 50);

            // increasing
            if (trendType === 'increasing') {
                min = 0;
                bbValues = [Math.ceil(nationAvg / 50) * 50, max];
            } else { // decreasing and all
                min = Math.floor(min / 50) * 50;

                if (trendType === 'decreasing') {
                    max = 0;
                    bbValues = [min, max];
                } else {
                    bbValues = [0, max];
                }
            }

            var minLabel = '';
            var category = $('#select-in-bbOpioid').val();
            var opTrendsFilterType = $('[name=bbOpioidTrendsFilter]:checked').val();

            $('#bbOpioid-' + opTrendsFilterType).parent('label').addClass('active');

            if (opTrendsFilterType === 'increasing') {
                minLabel = 0;
                $('#slider-bbOpioid').closest('.row').show();
                $('#label-bbOpTrendsRange').show();
            } else if (opTrendsFilterType === 'allTrends') {
                minLabel = formatStat(insight_ly['opioid'][category][geo_type + 'Min'], 0);
                $('#slider-bbOpioid').closest('.row').show();
                $('#label-bbOpTrendsRange').text(minLabel + '% - 50%');
            } else {
                minLabel = '';
                $('#slider-bbOpioid').closest('.row').hide();
                $('#label-bbOpTrendsRange').text('<= 0%');
            }

            $('.slider-bbOpiod-label.min').text(minLabel + '%');

            var minLabel = trendType === 'increasing' ? 0 : trendType === 'allTrends' ? formatStat(insight_ly['opioid'][dropdown][geo_type + 'Min'], 0) : '';
            $('.slider-bbOpiod-label.max').text(maxLabel + '%');
            $('.slider-bbOpiod-label.min').text(minLabel + '%');

            if (currentVals.length) values = currentVals;
            else values = values ? values : bbValues; //[min, min + 50];

        } else {
            // NON TREND =================================
            $('#bbOpioidTrendsFilter').hide();

            min = 0;
            max = Math.ceil((insight_ly['opioid'][dropdown][geo_type + 'Max'] / nationAvg) * 2) / 2;
            step = 0.5;

            if (currentVals.length) values = currentVals;
            else values = values ? values : [1, max];

            $('.slider-bbOpiod-label.max').text(max + 'x');
            $('.slider-bbOpiod-label.min').text('0x');

            var label = dropdown.slice(3) !== 'opioid_prescribing_rate' ? ' overdose deaths' : ' prescription rates';

            var ntlAvgTxt = '/100k pop. (Natl. Avg.)';
            if (!dropdown.includes('pct') && !dropdown.includes('prescribing')) ntlAvgTxt = '/100k pop. (5-yr. Natl. Avg.)';
            if (dropdown === 'in_opioid_prescribing_rate') ntlAvgTxt = '/100 pop. (5-yr. Natl. Avg.)';
            $('#label-nationalAverage').text('NOTE: 1x = ' + nationAvg + label + ntlAvgTxt);

            $('#slider-bbOpioid').closest('.row').show();
            $('.bbOpioid-slider').find('p').show();
            $('.bbOpioid-slider').find('.slider-label').hide();
        }
    }

    $('#slider-' + slider).slider({
        range: true,
        min: min,
        max: max,
        step: step,
        values: values,
        slide: function (event, ui) {
            var sliderMin = Math.floor(ui.values[0] * 10) / 10;
            var sliderMax = Math.ceil(ui.values[1] * 10) / 10;

            updateSlider(slider, sliderMin, sliderMax, false);
        },
        stop: function (event, ui) {
            var sliderMin = Math.floor(ui.values[0] * 10) / 10;
            var sliderMax = Math.ceil(ui.values[1] * 10) / 10;

            updateSlider(slider, sliderMin, sliderMax, true);
        }
    });

    updateSlider(slider, values[0], values[1], true);
}

function updateSlider(slider, min, max, applyFilter) {
    var dropdown = $('#select-in-' + slider).val();
    var ref = slider === 'opioid' || slider === 'bbOpioid' ? 'opioid' : slider;
    var labelMin;
    var labelMax;
    var trendType;

    var column = insight_ly[ref][dropdown].column;
    var zindex = insight_ly[ref][dropdown].zindex;
    var label = insight_ly[ref][dropdown].label;

    // store user slider values
    if (ref !== 'opioid') {
        // same slider for county/state
        insight_ly[slider][dropdown]['slider'] = [min, max];
    } else {
        // different slider for county/state
        if (slider === 'bbOpioid' && column.includes('pct')) {
            // different slider for bbopioid trend - increasing/ all
            trendType = $('[name=bbOpioidTrendsFilter]:checked').val();
            insight_ly[slider][dropdown]['slider_' + trendType][geo_type] = [min, max];
        } else {
            insight_ly[slider][dropdown]['slider'][geo_type] = [min, max];
        }
    }

    if (slider === 'broadband' || slider === 'health') {
        var labelText;
        labelMin = min;
        labelMax = max;

        if (column === 'dl_tiers' || column === 'ul_tiers') {
            if (min !== max) labelText = bb_speed_tiers[min]['min'] + ' to ' + bb_speed_tiers[max]['max'] + ' mbps';
            else labelText = bb_speed_tiers[min]['range'] + ' mbps';
        } else {
            labelText = labelMin + '&nbsp;&nbsp;&mdash;&nbsp;&nbsp;' + labelMax + label;
        }
        $('#label-' + slider).html(labelText);

    } else if (slider === 'opioid') {
        labelMin = min;
        labelMax = max;

        if (column.includes('pct')) {
            if (labelMin < 0) labelMin = labelMin + '% (Decrease)';
            else if (labelMin > 0) labelMin = labelMin + '% (Increase)';
            else labelMin = labelMin + '%';

            if (labelMax < 0) labelMax = labelMax + '% (Decrease)';
            else if (labelMax > 0) labelMax = labelMax + '% (Increase)';
            else labelMax = labelMax + '%';
        }

        $('#label-opioid').html(labelMin + '&nbsp;&nbsp;&mdash;&nbsp;&nbsp;' + labelMax + label);

    } else if (slider === 'bbOpioid') {
        // TREND
        if (column.includes('pct')) {
            trendType = $('[name=bbOpioidTrendsFilter]:checked').val(); //decreasing, increasing, all

            if (trendType === 'increasing') {
                $('#label-bbOpTrendsRange').text(min + '% to ' + max + '% Increase' + label);
            } else if (trendType === 'decreasing') {
                $('#label-bbOpTrendsRange').text('Less than or equal to 0% Change ' + label);
            } else {
                $('#label-bbOpTrendsRange').text(min + '% to ' + max + '% Change ' + label);
            }
        } else {
            // NON TREND
            var nationAvg = national_data.features[0].properties[column];
            var calcMin = (min * nationAvg).toFixed(1);
            var calcMax = (max * nationAvg).toFixed(1);
            var endLabel = column !== 'opioid_prescribing_rate' ? ' overdose deaths/100k pop.)' : ' prescription rates/100 pop.)';
            $('#label-bbOpRange').html(min + 'x' + '&nbsp;&nbsp;&mdash;&nbsp;&nbsp;' + max + 'x (' + calcMin + '&nbsp;&nbsp;&mdash;&nbsp;&nbsp;' + calcMax + endLabel);
            min = calcMin;
            max = calcMax;
        }
    }

    if (applyFilter) {
        var demoFilter = slider === 'opioid' || slider === 'broadband' || slider === 'health' ? getDemoFilter('ov') : getDemoFilter('bb');
        var filter = column + '>=' + min + ' AND ' + column + '<=' + max;
        if (demoFilter !== '') filter = filter + ' AND ' + demoFilter;
        redoMap(slider, filter, zindex);
    }
}

function getDemoFilter(demo_type) {
    var demo_filter = '';
    var demo_selection = $('#' + demo_type + '-select-demographics').val();

    if (demo_selection && demo_selection !== 'none') {
        var selection = demo_selection.split('$');
        var layer = selection[0];

        var ranges = selection[1].split('_');
        var low = ranges[0];
        var high = ranges[1];

        var column = pop_ly[layer].column;

        if (low === 'm') demo_filter = column + '<' + high;
        else if (high === 'm') demo_filter = column + '>=' + low;
        else if (low === high) demo_filter = column + '=' + low;
        else demo_filter = column + '>=' + low + ' AND ' + column + '<' + high;
    }
    return demo_filter;
}

function redoMap(type, filter, zindex) {
    var in_layers = '' + geo_space + ':' + table_name + geo_type;
    var in_styles = '';

    if (cur_tab === 'insights') {
        map.eachLayer(function (layer) {
            // Remove opioid health layers
            if (curr_health_measure_type === 'opioid' && type === 'opioid') {
                if (layer.options.styles && (layer.options.styles === geo_workspace + ':opioid_health_auto')) {
                    map.removeLayer(layer);
                }
            }

            // Remove health layer
            if (curr_health_measure_type === 'health' && type === 'health') {
                if (layer.options.styles && (layer.options.styles === geo_workspace + ':health_auto')) {
                    map.removeLayer(layer);
                }
            }

            // Remove health broadband layer
            if (type === 'broadband') {
                if (layer.options.styles && layer.options.styles === geo_workspace + ':broadband_auto') {
                    map.removeLayer(layer);
                }
            }
        });

        // Add opioid health measure layer
        if (curr_health_measure_type === 'opioid' && type === 'opioid') {
            in_styles = geo_workspace + ':opioid_health_auto'
        }

        // Add health layer
        if (curr_health_measure_type === 'health' && type === 'health') {
            in_styles = geo_workspace + ':health_auto';
        }

        // Add broadband layer
        if (type === 'broadband') {
            in_styles = geo_workspace + ':broadband_auto';
        }

        if (in_styles !== '') {
            L.tileLayer.wms(geo_host + '/wms?', {
                format: 'image/png',
                transparent: true,
                cql_filter: filter,
                layers: in_layers,
                styles: in_styles,
            }).setZIndex(zindex).addTo(map);
        }

    } else {
        clearMap();

        var bbType = $('.broadband-type:checked').val();
        in_styles = geo_workspace + ':bb_combo_' + bbType + '_all';

        L.tileLayer.wms(geo_host + '/wms?', {
            format: 'image/png',
            transparent: true,
            cql_filter: filter,
            layers: in_layers,
            styles: in_styles,
        }).setZIndex(zindex).addTo(map);
    }
    setHash();
}

function setCount() {
    var type = $('#select-in-count').val();
    clearMap('dataOverlays');

    if (type !== 'none') {
        var count_layers = geo_space + ':' + table_name + geo_type;
        var count_styles = geo_workspace + ':count_' + insight_ly['count'][type]['style'] + '_' + geo_type + '_all';

        L.tileLayer.wms(geo_host + '/wms?', {
            format: 'image/png',
            transparent: true,
            layers: count_layers,
            styles: count_styles
        }).setZIndex('999').addTo(map);

        var count_min = insight_ly.count[type][geo_type].min;
        var count_max = insight_ly.count[type][geo_type].max;
        var count_color = insight_ly.count[type].color;

        $('.circle-label-min').html('<' + count_min);
        $('.circle-label-max').html('>' + count_max);
        $('.circle-sym').css('background-color', count_color);

        $('.in-cnt-legend-box').css('display', 'inline-block');
    } else {
        // hide data overlay legend
        $('#in-count-stat-name').text('Population : ');
        $('#in-count-stat-value').text(formatStat(geo_prop.population));

        $('.in-cnt-legend-box').css('display', 'none');
    }
    updateStats();
}

function setupHealthTab() {
    clearMap();
    updateHealthMeasures();

    var health_type = $('#health-sec-type').val();
    var opioid_type = $('#opioid-sec-type').val();
    var adv_selection = $('#adv-select-broadband').val();

    var filter = '';
    var adv_filter = '';
    var demo_filter = getDemoFilter('hh');

    if (adv_selection !== 'none') {
        var selection = adv_selection.split('$');
        var layer = selection[0];
        var ranges = selection[1].split('_');
        var low = ranges[0];
        var high = ranges[1];

        var column = insight_ly['broadband'][layer].column;

        if (low === 'm') adv_filter = column + '<' + high;
        else if (high === 'm') adv_filter = column + '>' + low;
        else if (low === high) adv_filter = column + '=' + low;
        else adv_filter = column + '>=' + low + ' AND ' + column + '<=' + high;

    } else {
        $('#adv-select-broadband').val('none');
    }

    $('.advanced-health').selectpicker('refresh');
    $('.advanced-opioid').selectpicker('refresh');

    filter = adv_filter;

    if (demo_filter != '') {
        if (filter != '') {
            filter = filter + ' AND ' + demo_filter;
        } else {
            filter = demo_filter;
        }
    }

    filter = zoom_layer_type === 'auto' && filter !== '' ? filter + ';' + filter : filter;

    var in_layers = zoom_layer_type === 'auto' ? auto_geo_layers : geo_space + ':' + table_name + geo_type;
    var in_styles;

    if (curr_health_measure_type === 'health') {
        $('#label-health-opioid').parent('div').hide();

        if (health_ly[health_type]) {
            var health_style = health_ly[health_type].style;
            in_styles = zoom_layer_type === 'auto' ? [geo_workspace + ':' + health_style + '_state', geo_workspace + ':' + health_style + '_county'] : geo_workspace + ':' + health_style + '_all';

            if (filter !== '') {
                L.tileLayer.wms(geo_host + '/wms?', {
                    format: 'image/png',
                    transparent: true,
                    cql_filter: filter,
                    layers: in_layers,
                    styles: in_styles
                }).setZIndex('999').addTo(map);
            } else {
                L.tileLayer.wms(geo_host + '/wms?', {
                    format: 'image/png',
                    transparent: true,
                    layers: in_layers,
                    styles: in_styles
                }).setZIndex('999').addTo(map);
            }
            updateHealthLegend();

            createCharts();

            setHash();
        }
    } else if (curr_health_measure_type === 'opioid') {
        $('#label-health-opioid').parent('div').show();

        if (opioid_ly[opioid_type]) {
            var opioid_style = opioid_ly[opioid_type].style;
            in_styles = zoom_layer_type === 'auto' ? [geo_workspace + ':' + opioid_style + '_state', geo_workspace + ':' + opioid_style + '_county'] : geo_workspace + ':' + opioid_style + '_all';

            if (filter != '') {
                L.tileLayer.wms(geo_host + '/wms?', {
                    format: 'image/png',
                    transparent: true,
                    cql_filter: filter,
                    layers: in_layers,
                    styles: in_styles
                }).setZIndex('999').addTo(map);
            } else {
                L.tileLayer.wms(geo_host + '/wms?', {
                    format: 'image/png',
                    transparent: true,
                    layers: in_layers,
                    styles: in_styles
                }).setZIndex('999').addTo(map);
            }
            updateOpioidLegend();

            createCharts();

            setHash();
        }
    }
}

function setupBroadbandTab() {
    clearMap();
    updateHealthMeasures();

    var type = $('.broadband-type:checked').val();

    $('.advanced-broadband').selectpicker('refresh');

    var broadband_tooltip = broadband_ly[type].tooltip;
    var column;
    if (type === 'fixed_access') column = 'pctpopwbbacc';
    else if (type === 'wn_dl') column = 'dsgteq25';
    else if (type === 'wn_ul') column = 'usgteq3';
    else if (type === 'in_adoption') column = 'subscription_ratio';
    broadband_tooltip += ' National Average: ' + national_data.features[0].properties[column];
    $('#bb-tooltip-broadband').attr('title', broadband_tooltip).tooltip('fixTitle');

    if (type === 'in_adoption') {
        $('.square-label-min').text('0');
        $('.square-label-max').text('100');
    } else {
        $('.square-label-min').text('0%');
        $('.square-label-max').text('100%');
    }

    if (curr_health_measure_type === 'opioid' && $('#select-in-bbOpioid').val() !== 'none') {
        // show bb sliders
        $('#bbOpioidTrendsFilter').show();
        $('.bbOpioid-slider').parent('div').show();
        $('#slider-bbOpioid').parent('div').parent('div').show();
        setSlider('bbOpioid');
    } else {
        // hide sliders
        $('#bbOpioidTrendsFilter').hide();
        $('.bbOpioid-slider').parent('div').hide();
        $('#slider-bbOpioid').parent('div').parent('div').hide();
        $('#in-tooltip-bbOpioid').attr('title', 'No filter selected.').tooltip('fixTitle');

        var demoFilter = getDemoFilter('bb');  // rural dropdown
        var health_dropdown = $('#adv-select-health').val();  // health dropdown
        var filter = '';

        if (curr_health_measure_type === 'health') {
            if (health_dropdown !== 'none') {
                var selection = health_dropdown.split('$');
                var layer = selection[0];
                var ranges = selection[1].split('_');
                var low = ranges[0];
                var high = ranges[1];
                var column = insight_ly['health'][layer].column;
                if (low === 'm') filter = column + '<' + high;
                else if (high === 'm') filter = column + '>' + low;
                else if (low === high) filter = column + '=' + low;
                else filter = column + '>=' + low + ' AND ' + column + '<=' + high;
            }
        }

        if (demoFilter !== '') {
            if (filter !== '') {
                filter = filter + ' AND ' + demoFilter;
            } else {
                filter = demoFilter;
            }
        }

        var in_layers = geo_space + ':' + table_name + geo_type;
        var in_styles = geo_workspace + ':bb_combo_' + type + '_all';

        if (filter !== '') {
            L.tileLayer.wms(geo_host + '/wms?', {
                format: 'image/png',
                transparent: true,
                cql_filter: filter,
                layers: in_layers,
                styles: in_styles
            }).setZIndex('999').addTo(map);
        } else {
            L.tileLayer.wms(geo_host + '/wms?', {
                format: 'image/png',
                transparent: true,
                layers: in_layers,
                styles: in_styles
            }).setZIndex('999').addTo(map);
        }
    }
    setHash();
}

function setupPopTab() {
    clearMap();

    var pop_type = $('#pop-sec-type').val();

    if (pop_ly[pop_type]) {
        var pop_style = pop_ly[pop_type].style;

        var in_layers = auto_geo_layers;
        var in_styles = zoom_layer_type === 'auto' ? [geo_workspace + ':' + pop_style + '_state', geo_workspace + ':' + pop_style + '_county'] : geo_workspace + ':' + pop_style + '_all';

        if (zoom_layer_type !== 'auto') {
            in_layers = geo_space + ':' + table_name + geo_type;
        }

        L.tileLayer.wms(geo_host + '/wms?', {
            format: 'image/png',
            transparent: true,
            layers: in_layers,
            styles: in_styles
        }).setZIndex('999').addTo(map);

        updatePopLegend();

        setHash();
    }

    $('#pop-sec-type').selectpicker('refresh');
}

function updateHealthLegend() {
    var health_type = $('#health-sec-type').val();

    if (health_ly[health_type]) {
        var health_ranges = health_ly[health_type].ranges;
        var health_ranges_array = health_ranges.split(',');
        var health_label = health_ly[health_type].label;
        var health_tooltip = insight_ly.health[health_ly[health_type].tooltip].tooltip;
        health_tooltip += ' National Average: ' + national_data.features[0].properties[health_ly[health_type].column]

        $('.health-label-min').html(health_ranges_array[0]);
        $('.health-label-max').html(health_ranges_array[4]);

        $('#health-sym-1').tooltip('hide').attr('data-original-title', health_ranges_array[0]);
        $('#health-sym-2').tooltip('hide').attr('data-original-title', health_ranges_array[1]);
        $('#health-sym-3').tooltip('hide').attr('data-original-title', health_ranges_array[2]);
        $('#health-sym-4').tooltip('hide').attr('data-original-title', health_ranges_array[3]);
        $('#health-sym-5').tooltip('hide').attr('data-original-title', health_ranges_array[4]);
        $('.in-cnt-legend-box').css('display', 'inline-block');

        $('#hh-tooltip-health').attr('title', health_tooltip).tooltip('fixTitle');

        $('.health-table-label').html(health_label);
    }
}

function updateOpioidLegend() {
    var opioid_type = $('#opioid-sec-type').val();

    if (opioid_ly[opioid_type]) {
        var opioid_ranges = opioid_ly[opioid_type].ranges;
        var opioid_ranges_array = opioid_ranges.split(',');
        var opioid_min = opioid_ranges_array[0];
        var opioid_max = opioid_ranges_array.slice(-1)[0];
        var opioid_label = opioid_type.includes('pct') ? '%' : '';
        var column = opioid_type.slice(3);
        var nationAvg = national_data['features'][0]['properties'][column];
        var opioid_tooltip = insight_ly['opioid'][opioid_type].tooltip + ' National Average: ' + nationAvg;

        $('.opioid-label-min').html(opioid_min);
        $('.opioid-label-max').html(opioid_max);

        $('#opioid-sym-1').tooltip('hide').attr('data-original-title', opioid_ranges_array[0] + opioid_label);
        $('#opioid-sym-2').tooltip('hide').attr('data-original-title', opioid_ranges_array[1] + opioid_label);
        $('#opioid-sym-3').tooltip('hide').attr('data-original-title', opioid_ranges_array[2] + opioid_label);
        $('#opioid-sym-4').tooltip('hide').attr('data-original-title', opioid_ranges_array[3] + opioid_label);
        $('#opioid-sym-5').tooltip('hide').attr('data-original-title', opioid_ranges_array[4] + opioid_label);
        $('.in-cnt-legend-box').css('display', 'inline-block');

        $('#hh-tooltip-opioid').attr('title', opioid_tooltip).tooltip('fixTitle');

        if (!column.includes('pct') && !column.includes('prescribing')) $('.label-opioid-sub-yr').show();
        else $('.label-opioid-sub-yr').hide();

        $('#health-national-avg').text(nationAvg);

        $('.opioid-table-label').html(opioid_label);
    }
}

function updatePopLegend() {
    var pop_type = $('#pop-sec-type').val();

    if (pop_ly[pop_type]) {
        var pop_ranges = pop_ly[pop_type].ranges;
        var pop_ranges_array = pop_ranges.split(',');
        var pop_label = pop_ly[pop_type].label;
        var pop_tooltip = pop_ly[pop_type].tooltip;

        $('.pop-label-min').html(pop_ranges_array[0]);
        $('.pop-label-max').html(pop_ranges_array[4]);
        $('#pop-sym-1').tooltip('hide').attr('data-original-title', pop_ranges_array[0]);
        $('#pop-sym-2').tooltip('hide').attr('data-original-title', pop_ranges_array[1]);
        $('#pop-sym-3').tooltip('hide').attr('data-original-title', pop_ranges_array[2]);
        $('#pop-sym-4').tooltip('hide').attr('data-original-title', pop_ranges_array[3]);
        $('#pop-sym-5').tooltip('hide').attr('data-original-title', pop_ranges_array[4]);

        $('.in-cnt-legend-box').css('display', 'inline-block');

        $('#hh-tooltip-pop').attr('title', pop_tooltip).tooltip('fixTitle');

        $('.pop-table-label').html(pop_label);
    }
}

function updateHealthMeasures() {
    //opioid and health measure menu showings
    if (curr_health_measure_type === 'health') {
        $('.healthMetrics').show();
        $('.opioidMetrics').hide();

        $('.geog-opioid-stat').hide();
        $('.geog-opioid-stat-none').hide();
        $('.geog-opioid-stat-title').hide();
    } else if (curr_health_measure_type === 'opioid') {
        $('.opioidMetrics').show();
        $('.healthMetrics').hide();

        $('.geog-opioid-stat-title').show();

        if ($('#select-in-bbOpioid').val() === 'none') {
            $('.geog-opioid-stat-none').show();
            $('.geog-opioid-stat').hide();
        } else {
            $('.geog-opioid-stat-none').hide();
            $('.geog-opioid-stat').show();
        }
    }
}

function setHash() {
    var hash = '';

    var lat = map.getCenter().lat;
    var lng = map.getCenter().lng;

    lat = Math.round(lat * 1000000) / 1000000;
    lng = Math.round(lng * 1000000) / 1000000;

    var zoom = map.getZoom();

    if (lat && lng && zoom) {
        hash += '&ll=' + lat + ',' + lng;
        hash += '&z=' + zoom;
    }

    if (cur_tab) hash += '&t=' + cur_tab;

    if (cur_tab !== 'population') hash += '&hmt=' + curr_health_measure_type;

    // Overview tab
    if (cur_tab === 'insights') {
        // broadband
        var inb = $('#select-in-broadband').val();
        var slb = $('#slider-broadband').slider("values", 0) + ',' + $('#slider-broadband').slider("values", 1);
        hash += '&inb=' + inb;
        hash += '&slb=' + slb;

        // rural, data overlay selection
        var inc = $('#select-in-count').val();
        var dmf = $('#ov-select-demographics').val();
        hash += '&inc=' + inc;
        hash += '&dmf=' + dmf;

        // opioid
        if (curr_health_measure_type === 'opioid') {
            var ino = $('#select-in-opioid').val();
            var min = $('#slider-opioid').slider("values", 0);
            var max = $('#slider-opioid').slider("values", 1);

            min = Math.floor(min * 10) / 10;
            max = Math.ceil(max * 10) / 10;
            var slo = min + ',' + max;

            hash += '&ino=' + ino;
            hash += '&slo=' + slo;

        // health
        } else if (curr_health_measure_type === 'health') {
            var inh = $('#select-in-health').val();
            var slh = $('#slider-health').slider("values", 0) + ',' + $('#slider-health').slider("values", 1);
            hash += '&inh=' + inh;
            hash += '&slh=' + slh;
        }

    // Broadband tab
    } else if (cur_tab === 'broadband') {
        // fixed bb availability
        var bb_type = $('.broadband-type:checked').val();
        if (bb_type) hash += '&bbm=' + bb_type;

        // rural
        hash += '&dmf=' + $('#bb-select-demographics').val();

        // opioid
        if (curr_health_measure_type === 'opioid') {
            var ino = $('#select-in-bbOpioid').val();
            hash += '&ino=' + ino;

            if (ino !== 'none') {
                var slo = $('#slider-bbOpioid').slider('values', 0) + ',' + $('#slider-bbOpioid').slider('values', 1);

                if (ino.includes('pct')) {
                    var trendType = $('[name=bbOpioidTrendsFilter]:checked').val();
                    hash += '&tt=' + trendType;
                }

                hash += '&slo=' + slo;
            }
        // health
        } else if (curr_health_measure_type === 'health') {
            hash += '&hhm=' + $('#adv-select-health').val();
        }

    // Health tab
    } else if (cur_tab === 'health') {
        // broadband, rural
        hash += '&advbb=' + $('#adv-select-broadband').val();
        hash += '&dmf=' + $('#hh-select-demographics').val();

        if (curr_health_measure_type === 'opioid') hash += '&ino=' + $('#opioid-sec-type').val();
        else if (curr_health_measure_type === 'health') hash += '&hhm=' + $('#health-sec-type').val();

    // Demographics tab
    } else if (cur_tab === 'population') {
        var ppm = $('#pop-sec-type').val();
        if (ppm) hash += '&ppm=' + ppm;
    }

    if (zoom_layer_type !== 'auto') hash += '&zlt=' + geo_type;

    hash = hash.substring(1);

    window.location.hash = hash;
}

function loadHash() {
    var init_hash = (window.location.href.split('#')[1] || '');

    if (init_hash) {
        var hash_vars = init_hash.split('&');

        for (i = 0; i < hash_vars.length; i++) {
            var vars_arr = hash_vars[i].split('=');
            hash_obj[vars_arr[0]] = vars_arr[1];
        }

        if (hash_obj['zlt']) {
            zoom_layer_type = hash_obj['zlt'];
            geo_type = hash_obj['zlt'];
        } else {
            if (hash_obj['z'] <= 6) {
                geo_type = 'state';
                zoom_layer_type = 'state';
            } else {
                geo_type = 'county';
                zoom_layer_type = 'county';
            }
        }

        cur_tab = hash_obj['t'];
        if (cur_tab !== 'population') curr_health_measure_type = hash_obj['hmt'];

        // remove active class
        $('.layer-switch').find('li').removeClass('active');
        $('#health-measure-type-group').find('label').removeClass('active');

        $('#' + cur_tab).parent('li').addClass('active');
        $('#health-measure-type-' + curr_health_measure_type).parent('label').addClass('active');
        $('#health-measure-type-' + curr_health_measure_type).prop('checked', true);

        $('#leaflet-zoom-layers-' + zoom_layer_type).prop('checked', true);

        if (hash_obj.ll && hash_obj.z) {
            var hash_lat = hash_obj.ll.split(',')[0];
            var hash_lng = hash_obj.ll.split(',')[1];
            var hash_zoom = hash_obj.z;
            map.setView([hash_lat, hash_lng], hash_zoom);
        }

        // Overview tab
        if (cur_tab === 'insights') {
            updateHealthMeasures();

            // data overlay
            $('#select-in-count').selectpicker('val', hash_obj['inc']);
            setCount();

            // rural
            $('#ov-select-demographics').selectpicker('val', hash_obj['dmf']);

            // broadband
            $('#select-in-broadband').selectpicker('val', hash_obj['inb']);
            var slb = hash_obj['slb'].split(',');
            setSlider('broadband', slb);

            // opioid
            if (curr_health_measure_type === 'opioid') {
                $('#select-in-opioid').selectpicker('val', hash_obj['ino']);
                var slo = hash_obj['slo'].split(',');
                setSlider('opioid', slo);

            // health
            } else if (curr_health_measure_type === 'health') {
                $('#select-in-health').selectpicker('val', hash_obj['inh']);
                var slh = hash_obj['slh'].split(',');
                setSlider('health', slh);
            }

        // Broadband tab
        } else if (cur_tab === 'broadband') {
            $('#broadband-type-group').find('label').removeClass('active');
            $('#bbOpioidTrendsFilter').find('label').removeClass('active');
            $('.list-health-panel').addClass('hide');
            $('.list-insight-panel').addClass('hide');
            $('.list-population-panel').addClass('hide');
            $('.list-broadband-panel').removeClass('hide');
            updateHealthMeasures();

            $('[name=broadband-type][value=' + hash_obj['bbm'] + ']').prop('checked', true);
            $('[name=broadband-type][value=' + hash_obj['bbm'] + ']').parent('label').addClass('active');

            if (hash_obj['bbm'] === 'in_adoption') {
                $('.square-label-min').text('0');
                $('.square-label-max').text('100');
            }

            // tooltip
            $('#bb-tooltip-broadband').attr('title', broadband_ly[hash_obj['bbm']].tooltip).tooltip('fixTitle');

            // rural
            $('#bb-select-demographics').selectpicker('val', hash_obj['dmf']);

            // opioid
            if (curr_health_measure_type === 'opioid') {
                $('#select-in-bbOpioid').selectpicker('val', hash_obj['ino']);

                if (hash_obj['ino'] !== 'none') {
                    $('[name=bbOpioidTrendsFilter][value=' + hash_obj['tt'] + ']').prop('checked', true);
                    $('[name=bbOpioidTrendsFilter][value=' + hash_obj['tt'] + ']').parent('label').addClass('active');

                    var slo = hash_obj['slo'].split(',');
                    setSlider('bbOpioid', slo);
                } else {
                    setupBroadbandTab();
                }
            // health
            } else if (curr_health_measure_type === 'health') {
                $('#adv-select-health').selectpicker('val', hash_obj['hhm']);
                setupBroadbandTab();
            }

        // Health tab
        } else if (cur_tab === 'health') {
            $('.list-insight-panel').addClass('hide');
            $('.list-broadband-panel').addClass('hide');
            $('.list-population-panel').addClass('hide');
            $('.list-health-panel').removeClass('hide');
            $('#health-measure-type-group').show();

            $('#hh-select-demographics').selectpicker('val', hash_obj['dmf']);
            $('#adv-select-broadband').selectpicker('val', hash_obj['advbb']);

            if (curr_health_measure_type === 'opioid') {
                $('#opioid-sec-type').selectpicker('val', hash_obj['ino']);
            } else if (curr_health_measure_type === 'health') {
                $('#health-sec-type').selectpicker('val', hash_obj['hhm']);
            }

            setupHealthTab();

        // Demographics tab
        } else if (cur_tab === 'population') {
            $('.list-health-panel').addClass('hide');
            $('.list-insight-panel').addClass('hide');
            $('.list-broadband-panel').addClass('hide');
            $('.list-population-panel').removeClass('hide');
            $('#health-measure-type-group').hide();

            $('#pop-sec-type').selectpicker('val', hash_obj['ppm']);
            setupPopTab();
        }

        createCharts();
        updateStats();
    }
}

function updateStats() {
    var geography_type = geo_prop.geography_type;
    var geography_id = geo_prop.geography_id;
    var geography_desc = geo_prop.geography_desc;
    var dsgteq25 = geo_prop.dsgteq25;
    var usgteq3 = geo_prop.usgteq3;

    // $('#tooltip-overview-na').hide();
    // $('#tooltip-bb-na').hide();

    if (geography_type === 'county') {
        var abbr = states_data[geography_id.substring(0, 2)].abbr;
        geography_desc += ', ' + abbr;
    } else if (geography_type === 'nation') {
        geography_desc = 'Nationwide';
    }

    $('.geog-nameData').text(geography_desc);
    geography_desc += ' Statistics:';

    $('.geog-name').text(geography_desc);
    $('.geog-pop').text(formatStat(geo_prop.population));
    $('.geog-prov').text(formatStat(geo_prop.provcount_c));

    var broadband_sel = $('#select-in-broadband').val();
    var health_sel = $('#select-in-health').val();
    var count_sel = $('#select-in-count').val();
    var opioid_sel = $('#select-in-opioid').val();

    var broadband_stat_value, health_stat_value, opioid_stat_value, count_stat_value;

    // Overview tab ====================================================================================================
    if (geo_prop[insight_ly.broadband[broadband_sel].column] !== null) {
        if ((broadband_sel === 'in_bb_dl_speed') || (broadband_sel === 'in_bb_ul_speed')) {
            broadband_stat_value = bb_speed_tiers[geo_prop[insight_ly.broadband[broadband_sel].column]].range + ' mbps';
        } else if (broadband_sel === 'in_bb_in_adoption') {
            if (geo_prop[insight_ly.broadband[broadband_sel].column] === -9999) broadband_stat_value = '<em>Data withheld to maintain firm confidentiality</em>';
            else broadband_stat_value = geo_prop[insight_ly.broadband[broadband_sel].column] + ' connections per 100 households'
        } else {
            broadband_stat_value = formatStat(geo_prop[insight_ly.broadband[broadband_sel].column]) + '%';
        }
    } else {
        broadband_stat_value = 'N/A';
    }
    
    $('#in-broadband-stat-name').text(insight_ly.broadband[broadband_sel].name + ': ');
    $('#in-broadband-stat-value').html(encodeURIComponent(broadband_stat_value));

    if (geo_prop[insight_ly.health[health_sel].column] !== null) {
        if (insight_ly.health[health_sel].column === 'pcp_rate_per_100000') health_stat_value = formatStat(geo_prop[insight_ly.health[health_sel].column], 1) + ' per 100,000';
        else if (insight_ly.health[health_sel].column === 'poor_physical_health_days_within_last_30_days') health_stat_value = formatStat(geo_prop[insight_ly.health[health_sel].column], 1) + ' days';
        else if (insight_ly.health[health_sel].column === 'preventable_hospital_stays_per_100000') health_stat_value = formatStat(geo_prop[insight_ly.health[health_sel].column], 1) + ' per 100,000';
        else health_stat_value = formatStat(geo_prop[insight_ly.health[health_sel].column], 1) + '%';
    } else {
        health_stat_value = 'N/A';
    }
    $('#in-health-stat-name').text(insight_ly.health[health_sel].name + ': ');
    $('#in-health-stat-value').text(health_stat_value);

    opioid_stat_value = defineOpioidNull(insight_ly.opioid[opioid_sel].column, geo_prop[insight_ly.opioid[opioid_sel].column]);

    if (geo_prop[insight_ly.opioid[opioid_sel].column] !== null) {
        $('#tooltip-overview-na').hide();
    } else {
        if (curr_health_measure_type === 'opioid') {
            $('#tooltip-overview-na').show();
        }
    }

    var opioid_label = $('#select-in-opioid').find(':selected').text();
    $('#in-opioid-stat-name').text(opioid_label + ': ');
    $('#in-opioid-stat-value').text(opioid_stat_value);

    // Data overlays
    if (count_sel !== '' && count_sel !== 'none') {
        count_stat_value = formatStat(geo_prop[insight_ly.count[count_sel].column]);
    } else {
        $('.in-cnt-legend-box').css('display', 'none');
        count_stat_value = '';
    }
    if (count_sel !== '' && count_sel !== 'none') {
        $('#in-count-stat-name').text(insight_ly.count[count_sel].name + ': ');
        $('#in-count-stat-value').text(count_stat_value);
    } else {
        $('#in-count-stat-name').text('Population: ');
        $('#in-count-stat-value').text(formatStat(geo_prop.population));
    }

    // Broadband tab ===================================================================================================
    if (curr_health_measure_type === 'opioid') {
        var opioidStatName, opioidStatVal;
        var opioidSel = $('#select-in-bbOpioid').val();
        if (opioidSel !== 'none') {
            opioidStatName = insight_ly['opioid'][opioidSel]['name'] + ': ';
            opioidStatVal = defineOpioidNull(insight_ly.opioid[opioidSel].column, geo_prop[insight_ly.opioid[opioidSel].column]);

            if (geo_prop[insight_ly.opioid[opioidSel].column] !== null) {
                $('#tooltip-bb-na').hide();
            } else {
                $('#tooltip-bb-na').show();
            }
            $('.geog-opioid-stat').show();
            $('.geog-opioid-stat-none').hide();
        } else {
            $('.geog-opioid-stat').hide();
            $('.geog-opioid-stat-none').show();
        }

        $('.geog-opioid-stat-name').text(opioidStatName);
        $('.geog-opioid-stat-val').text(opioidStatVal);

        $('#opioid-stat').show();
        $('#health-stat').hide();
    } else {
        $('#opioid-stat').hide();
        $('#health-stat').show();
    }

    $('.geog-provcount').text(formatStat(geo_prop.provcount_c));
    $('.geog-intaccess').text(formatStatAppend(geo_prop.pctpopwbbacc, 1, '%'));
    $('.geog-wldl').text(formatStatAppend(dsgteq25, 1, '%'));
    $('.geog-wlul').text(formatStatAppend(usgteq3, 1, '%'));
    if (geo_prop.dl_tiers in bb_speed_tiers) $('.geog-commondl').text((bb_speed_tiers[geo_prop.dl_tiers].range) + ' mbps');
    else $('.geog-commondl').text('N/A');
    if (geo_prop.ul_tiers in bb_speed_tiers) $('.geog-commonul').text((bb_speed_tiers[geo_prop.ul_tiers].range) + ' mbps');
    else $('.geog-commonul').text('N/A');
    $('.geog-adoptpct').html(geo_prop.subscription_ratio === -9999 ? '<em>Data withheld to maintain firm confidentiality</em>' : encodeURIComponent(geo_prop.subscription_ratio) + ' connections per 100 households');

    // Health tab ======================================================================================================
    $('.geog-all-drugs-deaths').text(defineOpioidNull('alldrugs_age_adj_mortality_rate', geo_prop.alldrugs_age_adj_mortality_rate));
    $('.geog-all-drugs-death-trends').text(defineOpioidNull('alldrugs_age_adj_mortality_rate_pct_change',  geo_prop.alldrugs_age_adj_mortality_rate_pct_change));
    $('.geog-all-opioid-deaths').text(defineOpioidNull('anyopioids_age_adj_mortality_rate', geo_prop.anyopioids_age_adj_mortality_rate));
    $('.geog-all-opioid-death-trends').text(defineOpioidNull('anyopioids_age_adj_mortality_rate_pct_change', geo_prop.anyopioids_age_adj_mortality_rate_pct_change));
    $('.geog-rx-opioid-deaths').text(defineOpioidNull('prescriptionopioids_age_adj_mortality_rate', geo_prop.prescriptionopioids_age_adj_mortality_rate));
    $('.geog-rx-opioid-death-trends').text(defineOpioidNull('prescriptionopioids_age_adj_mortality_rate_pct_change', geo_prop.prescriptionopioids_age_adj_mortality_rate_pct_change));
    $('.geog-synthetic-opioid-deaths').text(defineOpioidNull('syntheticopioids_age_adj_mortality_rate', geo_prop.syntheticopioids_age_adj_mortality_rate));
    $('.geog-synthetic-opioid-death-trends').text(defineOpioidNull('syntheticopioids_age_adj_mortality_rate_pct_change', geo_prop.syntheticopioids_age_adj_mortality_rate_pct_change));
    $('.geog-heroin-deaths').text(defineOpioidNull('heroin_age_adj_mortality_rate', geo_prop.heroin_age_adj_mortality_rate));
    $('.geog-heroin-death-trends').text(defineOpioidNull('heroin_age_adj_mortality_rate_pct_change', geo_prop.heroin_age_adj_mortality_rate_pct_change));
    $('.geog-rx-rates').text(defineOpioidNull('opioid_prescribing_rate',  geo_prop.opioid_prescribing_rate));
    $('.geog-rx-trends').text(defineOpioidNull('opioid_prescribing_rate_pct_change', geo_prop.opioid_prescribing_rate_pct_change));

    $('.geog-mental').text(formatStat(geo_prop.mhp_total));
    $('.geog-poorfair').text(formatStat(geo_prop.poor_fair_health_total));
    $('.geog-prematured').text(formatStatAppend(geo_prop.years_lost_per_100000, 1, ' per 100,000'));
    $('.geog-prevhosp').text(formatStatAppend(geo_prop.preventable_hospital_stays_per_100000, 1, ' per 100,000'));
    $('.geog-injuryd').text(formatStatAppend(geo_prop.injury_deaths_per_100000, 1, ' per 100,000'));
    $('.geog-sickdays').text(formatStatAppend(geo_prop.poor_physical_health_days_within_last_30_days, 1, ' days per month'));
    $('.geog-mental-health-providers').text(formatStatAppend(geo_prop.mhp_total, 1, ''));
    $('.geog-pcp').text(formatStat(geo_prop.pcp_total));
    $('.geog-smok').text(formatStatAppend(geo_prop.smoking_pct, 1, '%'));
    $('.geog-drin').text(formatStatAppend(geo_prop.drinking_pct, 1, '%'));

    // Demographics tab ================================================================================================
    $('.geog-pop-total').text(formatStat(geo_prop.population));
    $('.geog-pop-density').text(formatStatAppend(geo_prop.pop_density, 2, ' per sq. mile'));
    $('.geog-pop-urban').text(formatStat(geo_prop.urban_total, 0));
    $('.geog-pop-rural').text(formatStat(geo_prop.rural_total, 0));
    $('.geog-pop-male').text(formatStat(geo_prop.male_total, 0));
    $('.geog-pop-female').text(formatStat(geo_prop.female_total, 0));
    $('.geog-pop-over65').text(formatStatAppend(geo_prop.age_over_65_pct, 2, '%'));
    $('.geog-pop-somecollege').text(formatStatAppend(geo_prop.some_college, 2, '%'));
    $('.geog-pop-unemploy').text(formatStatAppend(geo_prop.unemployment, 2, '%'));
    $('.geog-pop-medianhhinc').text('$' + formatStat(geo_prop.medianhhinc, 0));
}

function formatStat(input, decimal) {
    var output = '';

    if ($.isNumeric(input)) {
        if (decimal || decimal == 0) {
            output = Number(input.toFixed(decimal)).toLocaleString('en');
        } else {
            output = input.toLocaleString('en');
        }
    } else {
        output = 'N/A';
    }
    return output;
}

function formatStatAppend(input, decimal, append) {
    var stat = formatStat(input, decimal);
    return (stat == 'N/A') ? stat : (stat + append);
}

function setupOverviewTab() {
    updateHealthMeasures();
    clearMap();

    setSlider('broadband');

    if (curr_health_measure_type === 'opioid') setSlider('opioid');
    else setSlider('health');

    setCount();
    setHash();
}

function generateMenu() {
    $('.layer-switch').find('li').removeClass('active');
    $('#' + cur_tab).parent('li').addClass('active');

    if (cur_tab === 'insights') {
        $('.list-health-panel').addClass('hide');
        $('.list-broadband-panel').addClass('hide');
        $('.list-population-panel').addClass('hide');
        $('.list-insight-panel').removeClass('hide');

        $('#health-measure-type-group').show();

        setupOverviewTab();

    } else if (cur_tab === 'health') {
        $('.list-insight-panel').addClass('hide');
        $('.list-broadband-panel').addClass('hide');
        $('.list-population-panel').addClass('hide');
        $('.list-health-panel').removeClass('hide');

        $('#health-measure-type-group').show();

        setupHealthTab();

    } else if (cur_tab === 'broadband') {
        $('.list-health-panel').addClass('hide');
        $('.list-insight-panel').addClass('hide');
        $('.list-population-panel').addClass('hide');
        $('.list-broadband-panel').removeClass('hide');

        $('#health-measure-type-group').show();

        setupBroadbandTab();

    } else if (cur_tab === 'population') {
        $('.list-health-panel').addClass('hide');
        $('.list-insight-panel').addClass('hide');
        $('.list-broadband-panel').addClass('hide');
        $('.list-population-panel').removeClass('hide');

        $('#health-measure-type-group').hide();

        setupPopTab();
    }

    createCharts();
}

function extLinks(e) {
    var alertText = 'You are about to leave the FCC website and visit a third-party, non-governmental website that the FCC does not maintain or control. The FCC does not endorse any product or service, and is not responsible for, nor can it guarantee the validity or timeliness of the content on the page you are about to visit. Additionally, the privacy policies of this third-party page may differ from those of the FCC.',
        confirm = window.confirm(alertText);

    if (!confirm) {
        e.preventDefault();
    }
}