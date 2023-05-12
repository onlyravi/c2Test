/*
 _____                             _   _____  _   _            _ _   _       _____ _____ _____ 
/  __ \                           | | / __  \| | | |          | | | | |     |  __ \_   _/  ___|
| /  \/ ___  _ __  _ __   ___  ___| |_`' / /'| |_| | ___  __ _| | |_| |__   | |  \/ | | \ `--. 
| |    / _ \| '_ \| '_ \ / _ \/ __| __| / /  |  _  |/ _ \/ _` | | __| '_ \  | | __  | |  `--. \
| \__/\ (_) | | | | | | |  __/ (__| |_./ /___| | | |  __/ (_| | | |_| | | | | |_\ \_| |_/\__/ /
 \____/\___/|_| |_|_| |_|\___|\___|\__\_____/\_| |_/\___|\__,_|_|\__|_| |_|  \____/\___/\____/ 
  
*/


var geo_request_type = 'json';
var geo_host = 'https://geo.fcc.gov';
var geo_space = 'fcc';
var geo_output = 'application/json';

var wms_method = 'wms';

var geo_type = 'state';

var zoom_type = 'state';
var geo_lat = 40;
var geo_lng = -93;

var geo_id;

var geo_data;
var geo_prop;

var cur_tab = 'insights';
var click_feature;

var click_feature_option = {
	'color': '#ffcc44',
	'fillColor': '#ffffff',
	'weight': 5,
	'fillOpacity': 0.0
};
var click_data = [];

var map_overlays = {	
	in_broadband: [],
	in_health: [],
	in_count: [],
	health_ov: [],
	broadband_ov: [],
	pop_ov: []
};

var zoom_layer_type = 'county';

var zoom_to = false;

var mb_accessToken = 'pk.eyJ1IjoiZmNjIiwiYSI6IlA5cThBQTQifQ.EbifLm_7JkQ1uI_0_qYEAA';
//**************************************************************************
// map functions

function createMap() {  
	 
	 L.mapbox.accessToken = mb_accessToken;
	 
     map = L.map('map', {
             attributionControl: true,
             maxZoom: 19,
             minZoom: 3,
			fullscreenControl: {
				pseudoFullscreen: false, // if true, fullscreen to page width and height
				position: 'topright'
			}
			})
         .setView([40, -95], 4);    

     map.attributionControl.addAttribution('<a href="http://fcc.gov">FCC</a>&nbsp|&nbsp<a href="https://www.fcc.gov/about-fcc/fcc-initiatives/connect2healthfcc">Connect2Health</a>');

     baseStreet = L.mapbox.styleLayer('mapbox://styles/mapbox/light-v10').addTo(map);
     baseSatellite = L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-streets-v11');
     baseTerrain = L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11');
    
     L.control.scale({
         position: 'bottomleft'
     }).addTo(map);

    geocoder = L.mapbox.geocoder('mapbox.places-v1');
	 
	layerControl = new L.Control.Layers(
		{
			'Street': baseStreet.addTo(map),
			'Satellite': baseSatellite,
			'Terrain': baseTerrain
		}, 
		{},
		{
			position: 'topleft'
		})
		.addTo(map);	

	// custom zoom layer control	
	
	var zoomLayerControl = ''+
		'<form class="leaflet-control-layers-list-zoom" style="display: none;"><div class="leaflet-control-layers-zoom">'+
			'<label><input type="radio" class="leaflet-control-layers-selector-zoom zoom-layers-control" name="leaflet-zoom-layers" id="leaflet-zoom-layers-auto" checked="checked"><span> Automatic</span></label>'+
			'<label><input type="radio" class="leaflet-control-layers-selector-zoom zoom-layers-control" name="leaflet-zoom-layers" id="leaflet-zoom-layers-county"><span> County</span></label>'+
			'<label><input type="radio" class="leaflet-control-layers-selector-zoom zoom-layers-control" name="leaflet-zoom-layers" id="leaflet-zoom-layers-state"><span> State</span></label>'+
		'</div></form>'+
	'';
		
	$('.leaflet-control-layers').append(zoomLayerControl);	
	
	$('input[type=radio][name=leaflet-zoom-layers]').on('change', function() {	
        zoom_layer_type = $(this).attr('id').split('-')[3];		

		generateMenu();
		
    });	
	
	$('.leaflet-control-layers-toggle, .leaflet-control-layers').on('mouseover', function() {        
		$('.leaflet-control-layers-separator').css('display', 'block');	
		$('form.leaflet-control-layers-list-zoom').show();	
    });	
	
	$('.leaflet-control-layers-toggle, .leaflet-control-layers').on('mouseout', function() {		
        $('.leaflet-control-layers-separator').css('display', 'none');	
		$('form.leaflet-control-layers-list-zoom').hide();	
    });	
	
	
	L.tileLayer.wms( geo_host + '/' + geo_space + '/' + wms_method +'?', {
		 format: 'image/png',
		 transparent: true,
		 layers: 'state2014',
		 styles: 'state_border'
	 }).setZIndex(55555555555555555555).addTo(map);		
	
	// set hash
	
	map.on('moveend', function() {
		setHash();
	});
	
	map.on('zoomend', function() {
		
		var zoom = map.getZoom();

		if(zoom <= 3) {
			geo_type = 'national';
			new_geo_type = 'national';			
		}		
		else if (zoom > 6 ) {
			new_geo_type = 'county';	
			zoom_type = 'county';			
		}
		else if (zoom <= 6 ) {
			new_geo_type = 'state';
			zoom_type = 'state';
		}

		updateCountLegend();		
			
		geo_type = new_geo_type;			

		setHash();
	});
		
	map.on('click', function(e) {
		
		if(geo_type == 'national'){
			geo_type = 'state';	
		}
		if(zoom_type == 'county'){
			geo_type = 'county';		
		}

		geo_lat = e.latlng.lat;
		geo_lng = e.latlng.lng;
		getData(false);
	});
	
}

function getCurrentLocation(load) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;


            geo_lat = lat;
			geo_lng = lng;
			getData(true);

        }, function(error) { 
            if (load) { 
                setNationwide();
            }
            else {
                window.alert('Current location not found.');
            }
        }, {
            timeout: 4000
        });
    } 
    else {
        if (load) { 
            setNationwide();
        }
        else {
            window.alert('Current location not found.');
        }
    }
    return false;
}

function getGeocode() {

	var search_input = $('#input-location').val();  
	if (!/united states/i.test(search_input)){
		search_input = search_input + ', United States';
	}

	var geocode_url = 'https://api.mapbox.com/v4/geocode/mapbox.places/'+ encodeURIComponent(search_input) +'.json?access_token='+ mb_accessToken;
    
    $.ajax({
        type: 'GET',
        url: geocode_url,
        dataType: 'json',
        success: function(data) {

            if (data.features[0].place_name !== 'United States') {
                
                var geo_bounds = data.features[0].bbox;
                
                if(geo_bounds){
                	map.fitBounds([
                    	[geo_bounds[1], geo_bounds[0]],
                    	[geo_bounds[3], geo_bounds[2]]
                	]);	
                }
                else {
                	map.fitBounds([
                    	[data.features[0].center[1], data.features[0].center[0]]
                	]);	
                }

                geo_lat = data.features[0].center[1];
				geo_lng = data.features[0].center[0];	
				
				getData();         
            }
            else {
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

	var geocode_url = geo_host +'/'+ geo_space +'/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName='+ geo_space +':c2hgis_county&maxFeatures=1&outputFormat='+ geo_output +'&cql_filter=' + cql_filter_str;
	
	if(geo_request_type == 'jsonp'){
		geocode_url = geocode_url + '&format_options=callback:callbackData';
		jsonpCallbackVal = 'callbackData';
	}	

    
	$.ajax({
        type: 'GET',
        url: geocode_url,
        dataType: geo_request_type,
        jsonpCallback: jsonpCallbackVal,
        success: function(data) {

            if (data.features[0]) {                      
                
                geo_lat = data.features[0].properties.centroid.coordinates[1];
				geo_lng = data.features[0].properties.centroid.coordinates[0];	
				getData(true);
				
				if(geo_type == 'county' || geo_type == 'state'){

					var geo_bounds = data.bbox;                
	                if(geo_bounds){
	                	map.fitBounds([
	                    	[geo_bounds[1], geo_bounds[0]],
	                    	[geo_bounds[3], geo_bounds[2]]
	                	]);	
	                }	
				}       
            }
            else {
                window.alert('County not found.');
            }           
        },
        error: function (request, status, error) {
            
            window.alert('County not found.');
        }
    }); 
    
}   

function searchLocation() {
	getGeocode();
}

function clearMap() {

	for (var layertype in map_overlays) {
		for(var k in map_overlays[layertype]){
			if (map.hasLayer(map_overlays[layertype][k])) {
				map.removeLayer(map_overlays[layertype][k]);
			}		
		}
	}
}

	
function clearClickFeature() {


	for (var i = 0; i < click_data.length; i++){
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

	geo_type = 'national';
	
	clearClickFeature();	
	createCharts();	 
	updateStats();
	setDownloadLinks();
}  


//**************************************************************************
// slider functions

function updateSlider(type, def) {
	
	var dropdown = $( '#select-in-'+ type ).val();

	var min = insight_ly[type][dropdown].min;
	var max = insight_ly[type][dropdown].max;
	var step = insight_ly[type][dropdown].step;
	var values = insight_ly[type][dropdown].values;
	
	if (!def) {
		def = values;
	}

	
	$( '#slider-'+ type ).slider({
		range: true,
		min: min,
		max: max,
		step: step,
		values: def,
		stop: function( event, slider ) {
		
			setSliderMap(type, slider.values[ 0 ], slider.values[ 1 ]);	
			
			setHash();			
		}
	});
	
	setSliderMap(type, def[0], def[1]);	
}
	
function createSlider() {
	
	updateSlider('broadband');
	updateSlider('health');

	$('.select-insight').on('change', function() {
        var cur_type = $(this).attr('id').split('-')[2];

		updateSlider(cur_type);			
		updateStats();	
		
		setHash();
    });	

	
	$('#ov-select-extend').on('change', function() {
		setDemographicFilter();
	});


	
}

function setSliderMap(type, low, high) {	

	
	var filter = '';
	var demo_filter = '';

	var dropdown = $( '#select-in-'+ type ).val();
	var column = insight_ly[type][dropdown].column;
	var zindex = insight_ly[type][dropdown].zindex;
	var unit = insight_ly[type][dropdown].unit;
	var multiple = insight_ly[type][dropdown].multiple;
	var label = insight_ly[type][dropdown].label;
	var tooltip = insight_ly[type][dropdown].tooltip;
	

	var label_text = '';
	
	if (unit == 'st') {		
		if (low != high) {
			label_text = bb_speed_tiers[low].min +' to '+ bb_speed_tiers[high].max +' mbps';
		}
		else {
			label_text = bb_speed_tiers[low].range +' mbps';
		}			
	}
	else {
		label_text = Number(low*multiple).toLocaleString('en') +' - '+ Number(high*multiple).toLocaleString('en') + label;
	}	

	$( '#label-'+ type ).text( label_text );	
	
	$( '#in-tooltip-'+ type ).attr( 'title', tooltip ).tooltip('fixTitle');

	filter = column + '>=' + low + ' AND ' + column + '<=' + high;

	if(column == 'res_concxns_pct') {
		filter = column + '>' + low + ' AND ' + column + '<=' + high;
	}

	demo_filter = getDemoFilter('ov');

	if(demo_filter != ''){
		filter = filter + ' AND ' + demo_filter;
	}

	filter = filter + ';' + filter;


	redoMap(type, filter, zindex); 
	
}

function getDemoFilter(demo_type){

	var demo_filter = '';

	var demo_selection = $('#' + demo_type +'-select-demographics').val();	

	if(demo_selection) {
		
		var selection =  demo_selection.split('$');
		var layer = selection[0];

		var ranges = selection[1].split('_');
		var low = ranges[0];
		var high = ranges[1];

		var column = pop_ly[layer].column;
		demo_filter = column + '>=' + low + ' AND ' + column + '<' + high;		

	}
	return demo_filter;
}

function redoMap(type, filter, zindex) {
		for(k=0;k<map_overlays['in_'+ type].length;k++){
			if (map.hasLayer(map_overlays['in_'+ type][k])) {
				map.removeLayer(map_overlays['in_'+ type][k]);
			}		
		}
	var in_layers = ''+ geo_space +':c2hgis_'+ type;
	var in_styles = '';	

	if (zoom_layer_type != 'auto') {
		in_layers = ''+ geo_space +':c2hgis_'+ zoom_layer_type;
		in_styles = ''+ type +'_auto';
	}
	
	var wms_method = 'wms';

//very long filters are going to hit http limits: http://osgeo-org.1560.x6.nabble.com/Maximum-CQL-filter-length-td5233821.html

applyNewFilter(filter,type,in_layers,in_styles,geo_host,geo_space,wms_method,zindex);

}

//**************************************************************************
// section functions

function removeCount() {
	
	$('#in-count-stat-name').text('Population : ');
	$('#in-count-stat-value').text(formatStat(geo_prop.pop_2014));
	
	for(var k in map_overlays['in_count']){
		if (map.hasLayer(map_overlays['in_count'][k])) {
			map.removeLayer(map_overlays['in_count'][k]);
		}
	}
	$( '.in-cnt-legend-box').css('display', 'none');
	setHash();	
}

function setCount() {

	var type = $('#select-in-count').val();
	if (type == '') {
		return;
	}
	if (insight_ly.count[type]) {
		
		var count_layer = insight_ly.count[type].layer;
		var count_style = insight_ly.count[type].style;	

	for(var k in map_overlays['in_count']){
		if (map.hasLayer(map_overlays['in_count'][k])) {
			map.removeLayer(map_overlays['in_count'][k]);
		}
	}
		
		var count_layers = [''+ geo_space +':c2hgis_state', ''+ geo_space +':c2hgis_county'];
		var count_styles = ['count_'+ count_style +'_state', 'count_'+ count_style +'_county'];
		
		if (zoom_layer_type != 'auto') {
			count_layers = ''+ geo_space +':c2hgis_'+ zoom_layer_type;
			count_styles = 'count_'+ count_style +'_'+ zoom_layer_type +'_all'; 
		} 		
		
		if (count_layer != 'c2hgis') {
			count_layers = ''+ geo_space +':' + count_layer;
			count_styles = 'count_' + count_style;
		}	

		map_overlays['in_count'][map_overlays['in_count'].length] = L.tileLayer.wms(geo_host + '/' + geo_space + '/wms?', {
			format: 'image/png',
			transparent: true,
			layers: count_layers, 
			styles: count_styles
		}).setZIndex('999').addTo(map);		

		updateCountLegend();
	}
	else {
		removeCount();
	}
}
																	
function setupHealthTab() {

	var health_type = $('#health-sec-type').val();
	var adv_selection = $('#adv-select-broadband').val();

	var filter = '';
	var adv_filter = '';
	var demo_filter = getDemoFilter('hh');
	var adv_tooltip = 'Select';
	
	if(adv_selection) {
		var selection =  adv_selection.split('$');
		var layer = selection[0];
		var ranges = selection[1].split('_');
		var low = ranges[0];
		var high = ranges[1];

		var column = insight_ly['broadband'][layer].column;
		if(low == '0'){
			adv_filter = column + '<' + high;
		}
		else if (high == '0'){
			adv_filter = column + '>=' + low;
		}
		else if (low == high){
			adv_filter = column + '=' + low;
		}
		else{
			adv_filter = column + '>=' + low + ' AND ' + column + '<' + high;
		}
		adv_tooltip = $("#adv-select-broadband option[value='"+adv_selection+"']").text();
	}
	else {
		$('#adv-select-broadband').val("");		
	}

	$('.advanced-health').selectpicker('refresh');

	//$('#adv-select-broadband-tooltip' ).attr( 'title', adv_tooltip).tooltip('fixTitle');	

	filter = adv_filter;

	if(demo_filter != ''){
		if(filter != ''){
			filter = filter + ' AND ' + demo_filter;	
		}
		else {
			filter = demo_filter;
		}
	}

	if(filter != '') {
		filter = filter + ';' + filter;
	}


	if (health_ly[health_type]) {
	
		var health_style = health_ly[health_type].style;
		
		for(var k in map_overlays['health_ov']){
			if (map.hasLayer(map_overlays['health_ov'][k])) {
				map.removeLayer(map_overlays['health_ov'][k]);
			}		
		}

		var in_layers = [''+ geo_space +':c2hgis_state', ''+ geo_space +':c2hgis_county'];
		var in_styles = [''+ health_style +'_state', ''+ health_style +'_county'];	

		if (zoom_layer_type != 'auto') {
			in_layers = ''+ geo_space +':c2hgis_'+ zoom_layer_type;
			in_styles = ''+ health_style + '_' + zoom_layer_type + '_all';
		} 

		if(filter != '') {
			map_overlays['health_ov'][map_overlays['health_ov'].length] = L.tileLayer.wms(geo_host + '/' + geo_space + '/wms?', {
				format: 'image/png',
				transparent: true,
				cql_filter: filter,				
				layers: in_layers,				
				styles: in_styles 
			}).setZIndex('999').addTo(map);
		}
		else {
			map_overlays['health_ov'][map_overlays['health_ov'].length] = L.tileLayer.wms(geo_host + '/' + geo_space + '/wms?', {
				format: 'image/png',
				transparent: true,
				layers: in_layers,
				styles: in_styles
			}).setZIndex('999').addTo(map);
		}
		updateHealthLegend();
		
		setHash();
	}
}

function setupBroadbandTab() {

	var type =  $('.broadband-type:checked').val();
	var adv_selection = $('#adv-select-health').val();

	var demo_filter = getDemoFilter('bb');

	var filter = '';
	var adv_filter = '';
	var adv_tooltip = 'Select';

	if(adv_selection) {
		var selection =  adv_selection.split('$');
		var layer = selection[0];
		var ranges = selection[1].split('_');
		var low = ranges[0];
		var high = ranges[1];

		var column = insight_ly['health'][layer].column;
		adv_filter = column + '>=' + low + ' AND ' + column + '<' + high;
		adv_tooltip = $("#adv-select-health option[value='"+adv_selection+"']").text();
	}
	else {
		$('#adv-select-health').val("");		
	}

	$('.advanced-broadband').selectpicker('refresh')			

	filter = adv_filter;

	if(demo_filter != ''){
		if(filter != ''){
			filter = filter + ' AND ' + demo_filter;	
		}
		else {
			filter = demo_filter;
		}
	}

	if(filter != '') {
		filter = filter + ';' + filter;
	}

	for (var k in map_overlays['broadband_ov']){
		if (map.hasLayer(map_overlays['broadband_ov'][k])) {
			map.removeLayer(map_overlays['broadband_ov'][k]);
		}
	}
	
	var in_layers = [''+ geo_space +':c2hgis_state', ''+ geo_space +':c2hgis_county'];
	var in_styles = ['bb_combo_' + type + '_state', 'bb_combo_' + type + '_county'];	

	if (zoom_layer_type != 'auto') {
		in_layers = ''+ geo_space +':c2hgis_'+ zoom_layer_type;
		in_styles = ''+ 'bb_combo_'+ type + '_' + zoom_layer_type + '_all';
	} 
	if(filter != '') {
		map_overlays['broadband_ov'][map_overlays['broadband_ov'].length] = L.tileLayer.wms( geo_host + '/' + geo_space + '/wms?', {
			format: 'image/png',
			transparent: true,
			cql_filter: filter,
			layers: in_layers, 
			styles: in_styles 
		}).setZIndex('999').addTo(map);	
	}
	else {
		map_overlays['broadband_ov'][map_overlays['broadband_ov'].length] = L.tileLayer.wms( geo_host + '/' + geo_space + '/wms?', {
			format: 'image/png',
			transparent: true,
			layers: in_layers, 
			styles: in_styles
		}).setZIndex('999').addTo(map);	
	}	
	
	var broadband_tooltip = broadband_ly[type].tooltip;
	
	$( '#bb-tooltip-broadband' ).attr( 'title', broadband_tooltip ).tooltip('fixTitle');	
	
	setHash();
	
}

//setVetPopFilter
//RESOURCES: http://docs.geoserver.org/stable/en/user/tutorials/cql/cql_tutorial.html
function setDemographicFilter() {

	var demo_filter = getDemoFilter('ov');

	var type = 'broadband';
	var low = $('#slider-' + type).slider("values", 0);
	var high = $('#slider-' + type).slider("values", 1);

	var dropdown = $( '#select-in-'+ type ).val();
	var column = insight_ly[type][dropdown].column;
	var zindex = insight_ly[type][dropdown].zindex;

	var filter = column + '>=' + low + ' AND ' + column + '<=' + high;
	if(column == 'res_concxns_pct') {
		filter = column + '>' + low + ' AND ' + column + '<=' + high;
	}

	if(demo_filter != ''){
		filter = filter + ' AND ' + demo_filter;
	}

	filter = filter + ';' + filter;

	redoMap(type, filter, zindex); 

	type = 'health';
	low = $('#slider-' + type).slider("values", 0);
	high = $('#slider-' + type).slider("values", 1);

	dropdown = $( '#select-in-'+ type ).val();
	column = insight_ly[type][dropdown].column;
	zindex = insight_ly[type][dropdown].zindex;

	filter = column + '>=' + low + ' AND ' + column + '<=' + high;
	
	if(demo_filter != ''){
		filter = filter + ' AND ' + demo_filter;
	}

	filter = filter + ';' + filter;

	redoMap(type, filter, zindex); 

	setHash();	
}


function setupPopTab() {

	var pop_type = $('#pop-sec-type').val();

	if (pop_ly[pop_type]) {
	
		var pop_style = pop_ly[pop_type].style;
		
		for(var k in map_overlays['pop_ov']){
			if (map.hasLayer(map_overlays['pop_ov'][k])) {
				map.removeLayer(map_overlays['pop_ov'][k]);
			}		
		}

		var in_layers = [''+ geo_space +':c2hgis_state', ''+ geo_space +':c2hgis_county'];
		var in_styles = [ pop_style +'_state', pop_style +'_county'];	

		if (zoom_layer_type != 'auto') {
			in_layers = ''+ geo_space +':c2hgis_'+ zoom_layer_type;
			in_styles = ''+ pop_style +'_' + zoom_layer_type + '_all';
		} 
		
		map_overlays['pop_ov'][map_overlays['pop_ov'].length] = L.tileLayer.wms(geo_host + '/' + geo_space + '/wms?', {
			format: 'image/png',
			transparent: true,
			layers: in_layers, 
			styles: in_styles
		}).setZIndex('999').addTo(map);
		
		updatePopLegend();
		
		setHash();
	}
}


//**************************************************************************
// legend functions

function updateCountLegend() {
	
	var count_type = $('#select-in-count').val();	

	if ((count_type != '') && (count_type != 'none') && (insight_ly.count[count_type][zoom_type])) {		

		var count_min = insight_ly.count[count_type][zoom_type].min;
		var count_max = insight_ly.count[count_type][zoom_type].max;
		var count_color = insight_ly.count[count_type].color;
		
		$( '.circle-label-min' ).html( '<'+ count_min );
		$( '.circle-label-max' ).html( '>'+ count_max );
		$( '.circle-sym' ).css('background-color', count_color);		
		
		$( '.in-cnt-legend-box').css('display', 'inline-block');	
	}
	else {
		$( '.in-cnt-legend-box').css('display', 'none');	
	}
}

function updateHealthLegend() {	

	var health_type = $('#health-sec-type').val();
	
	if (health_ly[health_type]) {

		var health_min = health_ly[health_type].min;
		var health_max = health_ly[health_type].max;
		var health_ranges = health_ly[health_type].ranges;
		var health_ranges_array = health_ranges.split(',');
		var health_label = health_ly[health_type].label;
		var health_tooltip = health_ly[health_type].tooltip;
		
		$( '.health-label-min' ).html( health_min );
		$( '.health-label-max' ).html( health_max );

		$('#health-sym-1').tooltip('hide').attr('data-original-title', health_ranges_array[0]);
		$('#health-sym-2').tooltip('hide').attr('data-original-title', health_ranges_array[1]);
		$('#health-sym-3').tooltip('hide').attr('data-original-title', health_ranges_array[2]);
		$('#health-sym-4').tooltip('hide').attr('data-original-title', health_ranges_array[3]);
		$('#health-sym-5').tooltip('hide').attr('data-original-title', health_ranges_array[4]);
		$( '.in-cnt-legend-box').css('display', 'inline-block');	
		
		$( '#hh-tooltip-health' ).attr( 'title', health_tooltip ).tooltip('fixTitle');		
		
		$( '.health-table-label' ).html( health_label );			
	}
}

function updatePopLegend() {	
	
	var pop_type = $('#pop-sec-type').val();
	
	if (pop_ly[pop_type]) {

		var pop_min = pop_ly[pop_type].min;
		var pop_max = pop_ly[pop_type].max;
		var pop_ranges = pop_ly[pop_type].ranges;
		var pop_ranges_array = pop_ranges.split(',');
		var pop_label = pop_ly[pop_type].label;
		var pop_tooltip = pop_ly[pop_type].tooltip;
		
		$( '.pop-label-min' ).html( pop_min );
		$( '.pop-label-max' ).html( pop_max );
		$('#pop-sym-1').tooltip('hide').attr('data-original-title', pop_ranges_array[0]);
		$('#pop-sym-2').tooltip('hide').attr('data-original-title', pop_ranges_array[1]);
		$('#pop-sym-3').tooltip('hide').attr('data-original-title', pop_ranges_array[2]);
		$('#pop-sym-4').tooltip('hide').attr('data-original-title', pop_ranges_array[3]);
		$('#pop-sym-5').tooltip('hide').attr('data-original-title', pop_ranges_array[4]);
		
		$( '.in-cnt-legend-box').css('display', 'inline-block');	
		
		$( '#hh-tooltip-pop' ).attr( 'title', pop_tooltip ).tooltip('fixTitle');		
		
		$( '.pop-table-label' ).html( pop_label );			
	}
}
	

//**************************************************************************
// data functions

function getData(zoomCenter) {	

	var data_type = geo_type;
	var jsonpCallbackVal = false;
	if (zoom_layer_type != 'auto') {
		data_type = zoom_layer_type;
	} 

	var data_url = geo_host +'/'+ geo_space +'/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName='+ geo_space +':c2hgis_'+ data_type +'&maxFeatures=1&outputFormat='+ geo_output +'&cql_filter=contains(geom,%20POINT(' + geo_lng + ' ' + geo_lat + '))';
	
	if(geo_request_type == 'jsonp'){
		data_url = data_url + '&format_options=callback:callbackData';
		jsonpCallbackVal = 'callbackData';
	}

	$.ajax({
		type: 'GET',
		url: data_url,
		dataType: geo_request_type,			
		jsonpCallback: jsonpCallbackVal,
		success: function(data) {
			processData(data, zoomCenter);
		}
	});
}

function processData(data, zoomCenter) {

	if (data.features){

		if (data.features.length == 1){
		
			var geography_id = data.features[0].properties.geography_id;

			if (geo_id !== geography_id) {
			
				geo_id = geography_id;				
				geo_data = data;				
				geo_prop = geo_data.features[0].properties;
				

				// ***********************************	
				
				setDownloadLinks();
				updateStats();	
				createCharts();				
				clearClickFeature();
				
				// ***********************************		
				if (geo_type != 'national') {
					if(zoomCenter){
						if(geo_type == 'county' || geo_type == 'state'){

							var geo_bounds = data.bbox;                
			                if(geo_bounds){
			                	map.fitBounds([
			                    	[geo_bounds[1], geo_bounds[0]],
			                    	[geo_bounds[3], geo_bounds[2]]
			                	]);	
			                }
			                	
						}	
					}
				
					var click_feature = L.mapbox.featureLayer(geo_data).setStyle(click_feature_option).addTo(map);				
					
					click_feature.on('click', function(e) {

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
	
	var data_type = geo_prop.geography_type;	
	var download_layer = 'c2hgis_'+ data_type;
	
	var download_filter = '';	
	if (data_type != 'national') {	
		download_filter = '&cql_filter=geography_id=\''+ geo_prop.geography_id + '\'';
	}
	
	$('#download-data-json').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=json&typeName='+ geo_space +':'+ download_layer + download_filter );
	$('#download-data-xml').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=GML3&typeName='+ geo_space +':'+ download_layer + download_filter );
	$('#download-data-shp').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=shape-zip&typeName='+ geo_space +':'+ download_layer + download_filter );
	$('#download-data-kml').attr('href', geo_host + '/' + geo_space + '/wms/kml?mode=download&layers='+ geo_space +':'+ download_layer + download_filter );
	$('#download-data-csv').attr('href', geo_host + '/' + geo_space + '/wfs?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1&outputFormat=csv&typeName='+ geo_space +':'+ download_layer + download_filter );
}

function setHash() {
	
	var hash = '';
	
	var lat = map.getCenter().lat;
	var lng = map.getCenter().lng;	
	
	lat = Math.round(lat * 1000000) / 1000000;
	lng = Math.round(lng * 1000000) / 1000000;
	
	var zoom = map.getZoom();	
	
	if ((lat) && (lng) && (zoom)) {
		hash += '&ll='+ lat +','+ lng;
		hash += '&z='+ zoom;
	}
			
	if (cur_tab) {
		hash += '&t='+ cur_tab;
	}	
	
	if (cur_tab === 'insights') {
		var inb = $('#select-in-broadband').val();
		var inh = $('#select-in-health').val();
		var inc = $('#select-in-count').val();
		var dmf = $('#ov-select-demographics').val();

		var slb = $('#slider-broadband').slider("values", 0) +','+ $('#slider-broadband').slider("values", 1);
		var slh = $('#slider-health').slider("values", 0) +','+ $('#slider-health').slider("values", 1);

		if (inb) { hash += '&inb='+ inb; }
		if (inh) { hash += '&inh='+ inh; }	
		
		if (dmf) { 
			hash += '&dmf='+ dmf; 
		}
		else {
			hash += '&dmf=none'; 
		}
		if (inc) { 
			hash += '&inc='+ inc; 
		}
		else {
			hash += '&inc=none'; 
		}		
		
		if (slb) { hash += '&slb='+ slb; }
		if (slh) { hash += '&slh='+ slh; }

	}
	else if (cur_tab === 'health') {
		var hhm = $('#health-sec-type').val();
		var advbb = $('#adv-select-broadband').val();
		var dmf = $('#hh-select-demographics').val();

		if (hhm) { hash += '&hhm='+ hhm; }
		if (advbb) { hash += '&advbb=' + advbb; }		
		if (dmf) { 
			hash += '&dmf='+ dmf; 
		}
		else {
			hash += '&dmf=none'; 
		}
	}
	else if (cur_tab === 'broadband') {	
		var bb_type =  $('.broadband-type:checked').val();
		var advhl = $('#adv-select-health').val();
		var dmf = $('#bb-select-demographics').val();
		
		if (bb_type) { hash += '&bbm='+ bb_type}
		if (advhl) { hash += '&advhl=' +advhl; }
		if (dmf) { 
			hash += '&dmf='+ dmf; 
		}
		else {
			hash += '&dmf=none'; 
		}
	}
	else if (cur_tab === 'population') {
		var ppm = $('#pop-sec-type').val();
		
		if (ppm) { hash += '&ppm='+ ppm; }
	}
	
	if (zoom_layer_type != 'auto') { 
		hash += '&zlt='+ zoom_layer_type;
	}
	
	hash = hash.substring(1);
	
	window.location.hash = hash;
	
}

function loadHash() {
	
	var init_hash = (window.location.href.split('#')[1] || '');

	if (init_hash) {
		
		var hash_vars = init_hash.split('&');		
		
		var hash_obj = {};
		
		for (i=0; i < hash_vars.length; i++) {
			var vars_arr = hash_vars[i].split('=');
			hash_obj[vars_arr[0]] = vars_arr[1];
		}		

		if ((hash_obj.ll) && (hash_obj.z)) {
			
			var hash_lat = hash_obj.ll.split(',')[0];
			var hash_lng = hash_obj.ll.split(',')[1];
			var hash_zoom = hash_obj.z;
		
			map.setView([hash_lat, hash_lng], hash_zoom); 
		}
		
		if (hash_obj.zlt) {			
			zoom_layer_type = hash_obj.zlt;		
			
			$('#leaflet-zoom-layers-'+ zoom_layer_type ).prop('checked', true);				
		}
		
		if (hash_obj.t) {
		
			cur_tab = hash_obj.t;			
			generateMenu();
		}		
		
		if (hash_obj.t === 'insights') {
			
			if (hash_obj.inb) { $('#select-in-broadband').val(hash_obj.inb); }
			if (hash_obj.inh) { $('#select-in-health').val(hash_obj.inh); }	
			
			
			if (hash_obj.dmf) { $('#ov-select-demographics').val(hash_obj.dmf); }
			if (hash_obj.dmf == 'none') { 
				$('#ov-select-demographics').val(''); 
			}
			
			if (hash_obj.inc) { $('#select-in-count').val(hash_obj.inc); }
			if (hash_obj.inc == 'none') { 
				$('#select-in-count').val(''); 
				$('.in-cnt-legend-box').css('display', 'none'); 
			}
			
			if (hash_obj.slb) {  
				updateSlider('broadband', [hash_obj.slb.split(',')[0], hash_obj.slb.split(',')[1]]);
			}
			if (hash_obj.slh) {  				
				updateSlider('health', [hash_obj.slh.split(',')[0], hash_obj.slh.split(',')[1]]);
			}		
			
			setCount();			
		}
		else if (hash_obj.t === 'health') {				
			if (hash_obj.hhm) { 				
				$('#health-sec-type').val(hash_obj.hhm); 	
				if(hash_obj.advbb){
					$('#adv-select-broadband').val(hash_obj.advbb);			
				}	
				if (hash_obj.dmf) { $('#hh-select-demographics').val(hash_obj.dmf); }
				if (hash_obj.dmf == 'none') { 
					$('#hh-select-demographics').val(''); 
				}	
				setupHealthTab();
			}	

		}
		else if (hash_obj.t === 'broadband') {	

			if (hash_obj.bbm) { 				
				
				var hash_type = hash_obj.bbm;
				
				$('#broadband-type-'+ hash_type ).prop('checked', true);
				$('.broadband-type' ).parent().removeClass("active");
				
				$('#broadband-type-'+ hash_type ).parent().addClass("active");				
				if(hash_obj.advhl){
					$('#adv-select-health').val(hash_obj.advhl);	
				}	
				
				if (hash_obj.dmf) { $('#bb-select-demographics').val(hash_obj.dmf); }
				if (hash_obj.dmf == 'none') { 
					$('#bb-select-demographics').val(''); 
				}	
				setupBroadbandTab();
			}			
		}
		else if (hash_obj.t === 'population') {
			if (hash_obj.ppm) { 				
				
				$('#pop-sec-type').val(hash_obj.ppm); 
				
				setupPopTab();
			}				
		}					
	}		
}

function updateStats() {

	setHash();
	
	var geography_type = geo_prop.geography_type;
	var geography_id = geo_prop.geography_id;
	var geography_desc = geo_prop.geography_desc;	


	if (geography_type == 'county'){
		var abbr = states_data[geography_id.substring(0,2)].abbr;

		geography_desc += ', '+ abbr; 
	}
	else if (geography_type == 'national'){
		geography_desc = 'Nationwide';
	}
	
	geography_desc += ' Statistics:';
	
	$('.geog-name').text(geography_desc);
	$('.geog-pop').text(formatStat(geo_prop.pop_2014));
	$('.geog-prov').text(formatStat(geo_prop.provcount_c));	
		
	// Insight Stats		
	var broadband_sel = $('#select-in-broadband').val();
	var health_sel = $('#select-in-health').val();
	var count_sel = $('#select-in-count').val();

	var broadband_stat_value, health_stat_value, count_stat_value;
	
	if ((broadband_sel == 'in_bb_dl_speed') || (broadband_sel == 'in_bb_ul_speed')) {
		broadband_stat_value = bb_speed_tiers[geo_prop[insight_ly.broadband[broadband_sel].column]].range + ' ' + insight_ly.broadband[broadband_sel].suffix;
	}else if (broadband_sel == 'in_bb_in_adoption'){
		broadband_stat_value = bb_adoption_tiers[geo_prop[insight_ly.broadband[broadband_sel].column]].range + insight_ly.broadband[broadband_sel].suffix;
	}else {
		broadband_stat_value = formatStat(geo_prop[insight_ly.broadband[broadband_sel].column]) + insight_ly.broadband[broadband_sel].suffix;
	}		
	
	health_stat_value = formatStat((geo_prop[insight_ly.health[health_sel].column] * insight_ly.health[health_sel].multiple), 1);
	if(insight_ly.health[health_sel].suffix != '%'){
		health_stat_value = health_stat_value + ' ' + insight_ly.health[health_sel].suffix;
	} 
	else {
		health_stat_value = health_stat_value + insight_ly.health[health_sel].suffix;	
	}
	
	if ((count_sel != '') && (count_sel != 'none')) {
		count_stat_value = formatStat(geo_prop[insight_ly.count[count_sel].column]) + insight_ly.count[count_sel].suffix;
	}
	else {
		$( '.in-cnt-legend-box').css('display', 'none'); 
		count_stat_value = '';
	}		
	
	$('#in-broadband-stat-name').text(insight_ly.broadband[broadband_sel].name +' : ');
	$('#in-broadband-stat-value').text(broadband_stat_value);
	
	$('#in-health-stat-name').text(insight_ly.health[health_sel].name +' : ');
	$('#in-health-stat-value').text(health_stat_value);
	
	if ((count_sel != '') && (count_sel != 'none')) {
		$('#in-count-stat-name').text(insight_ly.count[count_sel].name +' : ');
		$('#in-count-stat-value').text(count_stat_value);
	}
	else {
		$('#in-count-stat-name').text('Population : ');
		$('#in-count-stat-value').text(formatStat(geo_prop.pop_2014));
	}
	
	// Health Stats

	$('.geog-pcp').text(formatStat(geo_prop.pcp_total));
	$('.geog-dentists').text(formatStat(geo_prop.dentist_total));
	$('.geog-mental').text(formatStat(geo_prop.mhp_total));
	$('.geog-poorfair').text(formatStat(geo_prop.poor_fair_health_total));

	$('.geog-prematured').text(formatStatAppend(geo_prop.years_lost_per_100000, 1, ' per 100,000'));
	$('.geog-prevhosp').text(formatStatAppend(geo_prop.preventable_hospital_stays_per_1000, 1, ' per 1,000'));	
	$('.geog-injuryd').text(formatStatAppend(geo_prop.injury_deaths_per_100000, 1, ' per 100,000'));
	$('.geog-sickdays').text(formatStatAppend(geo_prop.poor_physical_health_days_within_last_30_days, 1, ' days per month'));	
	
	$('.geog-longcommute').text(formatStatAppend(geo_prop.long_commute_driving_alone, 1, '%'));
	$('.geog-drivealone').text(formatStatAppend(geo_prop.driving_alone_to_work, 1, '%'));
	
	$('.geog-obes').text(formatStatAppend(geo_prop.adult_obesity_pct, 1, '%'));
	$('.geog-diab').text(formatStatAppend(geo_prop.diabetes_pct, 1, '%'));
	$('.geog-smok').text(formatStatAppend(geo_prop.smoking_pct, 1, '%'));
	$('.geog-drin').text(formatStatAppend(geo_prop.drinking_pct, 1, '%'));
	$('.geog-inac').text(formatStatAppend(geo_prop.physical_inactivity, 1, '%'));
	$('.geog-severehousing').text(formatStatAppend(geo_prop.severe_housing_problems, 1, '%'));
	
	// Broadband Stats
	$('.geog-provcount').text(formatStat(geo_prop.provcount_c) );
	$('.geog-intaccess').text(formatStatAppend(geo_prop.pctpopwbbacc, 1, '%'));

	$('.geog-wldl').text(formatStatAppend(geo_prop.dsgteq25, 1, '%'));
	$('.geog-wlul').text(formatStatAppend(geo_prop.usgteq3, 1, '%'));
	
	$('.geog-commondl').text((bb_speed_tiers[geo_prop.dl_tiers].range) + ' mbps');
	$('.geog-commonul').text((bb_speed_tiers[geo_prop.ul_tiers].range) + ' mbps');
	$('.geog-adoptpct').text((bb_adoption_tiers[geo_prop.res_concxns_pct].range) + '%');

	
	// Population Stats
	$('.geog-pop-total').text(formatStat(geo_prop.pop_2014) );	
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
	
	if ($.isNumeric( input )) {
		
		if (decimal) {
			output = Number(input.toFixed(decimal)).toLocaleString('en');
		}
		else {
			output = input.toLocaleString('en');
		}		
	}
	else {
		output = 'N/A';
	}
	
	return output;	
}

function formatStatAppend(input, decimal, append){
	var stat = formatStat(input, decimal);
	return (stat == 'N/A') ? stat : (stat + append);
}


//**************************************************************************
// menu functions

function generateMenu(){
	
	clearMap();

	if (cur_tab === 'insights') {
		$('.list-health-panel').addClass('hide');
		$('.list-broadband-panel').addClass('hide'); 
		$('.list-population-panel').addClass('hide'); 
		$('.list-insight-panel').removeClass('hide'); 
		
		createSlider();
		
		var count_sel = $('#select-in-count').val();
		if ((count_sel != '') && (count_sel != 'none')) {
			setCount();
		}
		else {
			$('.in-cnt-legend-box').css('display', 'none'); 
		}
	}
	else if (cur_tab === 'health') {
		$('.list-insight-panel').addClass('hide');
		$('.list-broadband-panel').addClass('hide');  
		$('.list-population-panel').addClass('hide'); 
		$('.list-health-panel').removeClass('hide'); 
		
		setupHealthTab();
	}
	else if (cur_tab === 'broadband') {
		$('.list-health-panel').addClass('hide');
		$('.list-insight-panel').addClass('hide');  
		$('.list-population-panel').addClass('hide'); 
		$('.list-broadband-panel').removeClass('hide');  			
		
		setupBroadbandTab();			
	}
	else if (cur_tab === 'population') {
		$('.list-health-panel').addClass('hide');
		$('.list-insight-panel').addClass('hide');   
		$('.list-broadband-panel').addClass('hide'); 
		$('.list-population-panel').removeClass('hide');  	
		
		setupPopTab();
	}
	
	createCharts();
	
	setHash();

	$('.layer-switch').find('li').removeClass('active');
	$('#'+ cur_tab).parent('li').addClass('active');    
 }

 function extLinks(e) {

    var alertText = 'You are about to leave the FCC website and visit a third-party, non-governmental website that the FCC does not maintain or control. The FCC does not endorse any product or service, and is not responsible for, nor can it guarantee the validity or timeliness of the content on the page you are about to visit. Additionally, the privacy policies of this third-party page may differ from those of the FCC.',
        confirm = window.confirm(alertText);

    if (!confirm) {
        e.preventDefault();
    }

}
     
 //**************************************************************************
// load functions

 $(document).ready(function() { 

	geo_prop = national_data.features[0].properties;	 

	createMap();
	createSlider();		
	setCount();	

	loadHash();

	// external links
	$('.link-ext').on('click', extLinks);
	
	// menu
	$('.layer-switch').on('click', 'a', function(e) {	
		e.preventDefault();
		cur_tab = $(this).attr('id');	
		generateMenu();			
	});
	 
	// current location
	$('#btn-geo-current').click(function(e) {
		getCurrentLocation(false);
		return false;
	});
    
    $('#input-loc-search').on('click', function(e) {
        e.preventDefault();
        getGeocode();
    });

    $('#input-county-search').on('click', function(e) {
        var search_input = $('#input-county').val();

        e.preventDefault();
		
		if (search_input.split(',')[1] !== undefined) {
			getGeocodeCounty();
		} else {
			window.alert('Please enter a valid county and state abbreviation.');
		}
    }); 
     
    // nationwide
    $('#btn-geo-nation').on('click', function() {
        setNationwide();
    });  

	// select count
    $('#select-in-count').on('change', function() {
	
        var count_sel = $('#select-in-count').val();		

		if ((count_sel != '') && (count_sel != 'none')) {
			setCount();
			updateStats();
		}
		else {
			removeCount();
		}
    }); 

    $('#ov-select-demographics').on('change', function() {
		setDemographicFilter();		
    }); 
	
	// select health
	$('#health-sec-type').on('change', function() {
		setupHealthTab();						
    }); 

    $('#hh-select-demographics').on('change', function() {
		setupHealthTab();		
    });

    // advanced broadband select
	$('#adv-select-broadband').on('change', function() {
		setupHealthTab();		
    }); 

    // advanced broadband select
	$('#adv-select-health').on('change', function() {
		setupBroadbandTab();
    }); 

    $('#bb-select-demographics').on('change', function() {
		setupBroadbandTab();		
    });
			
	// select broadband
	$('.broadband-type').on('change', function() {
	
        bb_combo_type = $(this).val();		
		setupBroadbandTab();
    }); 
	
	// select population
	$('#pop-sec-type').on('change', function() {
		
		setupPopTab();			
    }); 	 
	 
	updateStats();		 
	setDownloadLinks();
	 
	$(".selectpicker").selectpicker({});

	$('.in-tooltip, .hh-tooltip, .bb-tooltip').tooltip();
	
	$('#carousel-bb').bind('slid.bs.carousel', function (e) {
		createCharts();
	});
	$('#carousel-pop').bind('slid.bs.carousel', function (e) {
		createCharts();
	});

	$("#input-search-switch").on('click', 'a', function(e) {
		var search = $(e.currentTarget).data('value');
		e.preventDefault();

        $("#input-location").val('');
		$("#input-county").val('');

		if (search == 'county') {
			$("#input-location").css('display', 'none');
			$("#input-county").css('display', 'block');
			$("#span-location-search").css('display', 'none');
			$("#span-county-search").css('display', 'table-cell');
			$("#btn-label").text('County');
        }
		else if (search == 'address') {
			$("#input-county").css('display', 'none');
			$("#input-location").css('display', 'block');
			$("#span-county-search").css('display', 'none');
			$("#span-location-search").css('display', 'table-cell');
			$("#btn-label").text('Address');
        }
    });

    $('#input-location').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-loc-search').click();
	    return false;  
	  }
	}); 
	
	$('#input-county').keypress(function (e) {
	 var key = e.which;
	 if(key == 13)  // the enter key code
	  {
	    $('#input-county-search').click();
	    return false;  
	  }
	});
		
	$( "#input-location" ).autocomplete({
        source: function( request, response ) {
			var search_input = request.term;

			var data_url = 'https://api.mapbox.com/v4/geocode/mapbox.places/'+ encodeURIComponent(search_input) +'.json?access_token='+ mb_accessToken;

			$.ajax({
				type: 'GET',
				url: data_url,
				dataType: 'json',
				success: function(data) {
					var ft = data.features;
					var autoresults = [];
					for (var i = 0; i < ft.length; i++) {			
						if(ft[i].place_name.match(/United States$/)){
							var type = 'county';
							if(ft[i].id.startsWith("region")){
								type = 'state';
							}
							autoresults.push({
								'label' : ''+ ft[i].place_name,
								'value' : new Array (ft[i].geometry.coordinates[0], ft[i].geometry.coordinates[1],type)
							});
						}
					}					
					response(autoresults);
				}
			});
        },
        minLength: 3,
		focus: function(event, ui) {
			event.preventDefault();
			$("#input-location").val(ui.item.label);
			
			geo_type = 'county';
			zoom_type = 'county';	

			if(ui.item.value[2] == 'state'){
				geo_type = 'state';
				zoom_type = 'state';			
			}

			geo_lng = ui.item.value[0];
			geo_lat = ui.item.value[1];

			getData(true);

		},
        select: function( event, ui ) {
			event.preventDefault();
			$("#input-location").val(ui.item.label);
			
            setTimeout(function() {

				geo_type = 'county';
				zoom_type = 'county';

				if(ui.item.value[2] == 'state'){
					geo_type = 'state';
					zoom_type = 'state';			
				}
				
				geo_lng = ui.item.value[0];
				geo_lat = ui.item.value[1];

				getData(true);
				
			}, 200);
        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
	});
	
	
	$( "#input-county" ).autocomplete({
        source: function( request, response ) {
			var county = request.term;
			var jsonpCallbackVal = false;

			var data_url = geo_host +'/'+ geo_space +'/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName='+ geo_space +':c2hgis_county&maxFeatures=35&outputFormat='+ geo_output +'&cql_filter=geography_desc+ILIKE+%27' + county + '%25%27';
			
			if(geo_request_type == 'jsonp'){
				data_url = data_url + '&format_options=callback:callbackData';
				jsonpCallbackVal = 'callbackData';
			}

			$.ajax({
				type: 'GET',
				url: data_url,
				dataType: geo_request_type,
				jsonpCallback: jsonpCallbackVal,
				success: function(data) {
					var ft = data.features;
					var autoresults = [];
					for (var i = 0; i < ft.length; i++) {
						var abbr = states_data[ft[i].properties.geography_id.substring(0,2)].abbr;
						autoresults.push({
							'label' : ''+ ft[i].properties.geography_desc +', '+ abbr,
							'value' : ft[i].properties.centroid.coordinates
						});
					}					
					response(autoresults);
				}
			});
        },
        minLength: 3,
		focus: function(event, ui) {
			event.preventDefault();
			$("#input-county").val(ui.item.label);
			
			geo_type = 'county';
			zoom_type = 'county';
			
			
			geo_lng = ui.item.value[0];
			geo_lat = ui.item.value[1];

			getData(true);
			
			
		},
        select: function( event, ui ) {
			event.preventDefault();
			$("#input-county").val(ui.item.label);
			
            setTimeout(function() {

				geo_type = 'county';
				zoom_type = 'county';
				
				
				geo_lng = ui.item.value[0];
				geo_lat = ui.item.value[1];
	
				getData(true);

			}, 200);
        },
        open: function() {
			$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
			$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
	});
	
});      




  