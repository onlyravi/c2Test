window.customElements.define(
  "map-component",
  class extends HTMLElement {
    constructor() {
      super();
      this.sideview = false;
      this.mainMap = null;
      this.mainMap_sub1 = null;
      this.mainMap_sub2 = null;
      this.secondMap = null;
      this.secondMap_sub1 = null;
      this.secondMap_sub2 = null;
      this.data = null;
      this.addEventListener("dataChanged", this.onDataChange);
    }

    dispatchToggleSplitMap() {
      const dispatchList = [];
      dispatchList.push(document.querySelector("stats-table"));
      dispatchList.push(document.querySelector("plots-container"));
      dispatchList.forEach((ele) => {
        ele.dispatchEvent(new CustomEvent("toggleSplitMap", { detail: this.sideview }));
      });
    }

    onDataChange(e) {
      this.data = e.detail;
      this.generateMap();
    }

    generateMap() {
      // Expressions mapping county ids to colors.
      const matchExpression = ['match', ['get', 'FIPS']];
      const matchExpression2 = ['match', ['get', 'FIPS']]; // lighter color scheme

        
      // Calculate color values for each country based on 'hdi' value
      for (const row of this.data["data"]) {
        // Convert the range of data values to a suitable color

        const category = (row["county_categorization"]);
        // Counties which cannot be categorized will be grey.
        let color = `rgba(200, 200, 200, 0.9)`;
        let color2 = `rgba(200, 200, 200, 0.9)`;
        if (category == 1 || category == 2 || category == 3 || category == 4){
          color = county_categorization_color_mapping[category-1];
          color2 = county_categorization_color_mapping_light[category-1];
        }

        let fips_code = row['fips'] + "";
        if (fips_code.length < 5){
          fips_code = "0" + fips_code;
        }
        matchExpression.push(fips_code, color);
        matchExpression2.push(fips_code, color2);
      }

      // Last value is the default, used where there is no data
      // For some reason, these fallback values bleed through even where there is data. They are set to transparent
      // to prevent this from being visible.
      matchExpression.push('rgba(0.1, 0.1, 0.1, 0.0)');
      matchExpression2.push('rgba(0.1, 0.1, 0.1, 0.0)');

      // Add the layer if it doesn't already exist. Else, just change the colors on the existing layer.
      if (this.mainMap.getLayer('mainFill') === undefined) {
         
        this.mainMap.addLayer(
        {
            'id': 'mainFill',
            'type': 'fill',
            'source': 'composite',
            'source-layer': 'FCC_CATEGORIZED-9skpq0',
            'paint': {
                'fill-color': matchExpression,
                'fill-antialias': true,
                'fill-outline-color': 'white'
            }
        },
        'fcc-categorized-9skpq0'
        );

        this.mainMap_sub1.addLayer(
        {
            'id': 'mainFill',
            'type': 'fill',
            'source': 'composite',
            'source-layer': 'FCC_CATEGORIZED-9skpq0',
            'paint': {
                'fill-color': matchExpression,
                'fill-antialias': true,
                'fill-outline-color': 'white'
            }
        },
        'fcc-categorized-9skpq0'
        );

        this.mainMap_sub2.addLayer(
        {
            'id': 'mainFill',
            'type': 'fill',
            'source': 'composite',
            'source-layer': 'FCC_CATEGORIZED-9skpq0',
            'paint': {
                'fill-color': matchExpression,
                'fill-antialias': true,
                'fill-outline-color': 'white'
            }
        }, 
        'fcc-categorized-9skpq0'
        );
      } else {
        this.mainMap.setPaintProperty('mainFill', 'fill-color', matchExpression);
        this.mainMap_sub1.setPaintProperty('mainFill', 'fill-color', matchExpression);
        this.mainMap_sub2.setPaintProperty('mainFill', 'fill-color', matchExpression);
      }
      
      if (this.secondMap.getLayer('secondFill') === undefined) {
        this.secondMap.addLayer(
        {
            'id': 'secondFill',
            'type': 'fill',
            'source': 'composite',
            'source-layer': 'FCC_CATEGORIZED-9skpq0',
            'paint': {
                'fill-color': matchExpression2,
                'fill-antialias': true,
                'fill-outline-color': matchExpression
            }
        },
        'fcc-categorized-9skpq0'
        );

        this.secondMap_sub1.addLayer(
        {
            'id': 'secondFill',
            'type': 'fill',
            'source': 'composite',
            'source-layer': 'FCC_CATEGORIZED-9skpq0',
            'paint': {
                'fill-color': matchExpression2,
                'fill-antialias': true,
                'fill-outline-color': matchExpression
            }
        },
        'fcc-categorized-9skpq0'
        );

        this.secondMap_sub2.addLayer(
        {
            'id': 'secondFill',
            'type': 'fill',
            'source': 'composite',
            'source-layer': 'FCC_CATEGORIZED-9skpq0',
            'paint': {
                'fill-color': matchExpression2,
                'fill-antialias': true,
                'fill-outline-color': matchExpression
            }
        },
        'fcc-categorized-9skpq0'
        );


      } else {
        this.secondMap.setPaintProperty('secondFill', 'fill-color', matchExpression2);
        this.secondMap.setPaintProperty('secondFill', 'fill-outline-color', matchExpression);

        this.secondMap_sub1.setPaintProperty('secondFill', 'fill-color', matchExpression2);
        this.secondMap_sub1.setPaintProperty('secondFill', 'fill-outline-color', matchExpression);

        this.secondMap_sub2.setPaintProperty('secondFill', 'fill-color', matchExpression2);
        this.secondMap_sub2.setPaintProperty('secondFill', 'fill-outline-color', matchExpression);
      }
    }

    featurePopup(e, mapObject) {
      const { features } = e;
      if (!features) {
        return;
      }

      const selectedFeature = features.find((feature) =>
        //Object.keys(feature["properties"]).includes("county_fips"),
        Object.keys(feature["properties"]).includes("FIPS"),
      );

      //const fips = parseInt(selectedFeature["properties"]["county_fips"]) + "";
      const fips = parseInt(selectedFeature["properties"]["FIPS"]) + "";
      const county_info_temp = this.data["data"].filter(el => el["fips"] == fips);
      const county_info = county_info_temp[0];

      new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <h5>${selectedFeature["properties"].county}, ${selectedFeature["properties"].STATE_NAME}</h5>
        <span>Population: ${county_info["population"]}</span><br>
        <span>Broadband: ${county_info["broadband"]}%</span><br>
        <span>Health: ${county_info["health"]}%</span><br>
        <span>County Categorization: ${county_info["county_categorization"]}</span>`)
      .addTo(mapObject);
    }

    initializeMaps() {
      mapboxgl.accessToken =
            "pk.eyJ1IjoibWFwZHM5IiwiYSI6ImNsOWVlcm52dDRzcWszdm9pN2V3M3c2NmgifQ.PlQ2yE4-5AgdYy7Um76vsA";
      const us_center = [-97.82133, 35.14918];
      const alaska_center = [-155.22557885154885, 65.12623049200317];
      const hawaii_center = [-157.3651512086516, 20.497628738617905];
  
      this.mainMap = new mapboxgl.Map({
          container: 'first',
          style: 'mapbox://styles/mapds9/clgh7hbwo007101lbx680xib2',
          center: us_center,
          maxZoom: 21,
          minZoom: 3,
      });
  
      this.mainMap_sub1 = new mapboxgl.Map({
          container: 'first-sub1',
          style: 'mapbox://styles/mapds9/clgh7hbwo007101lbx680xib2',
          center: alaska_center,
          maxZoom: 21,
          minZoom: 1,
          zoom: 1,
          maxBounds: [[alaska_center[0] - 10, alaska_center[1] - 10], [alaska_center[0] + 10, alaska_center[1] + 10]]
      });
      
      this.mainMap_sub2 = new mapboxgl.Map({
          container: 'first-sub2',
          style: 'mapbox://styles/mapds9/clgh7hbwo007101lbx680xib2',
          center: hawaii_center,
          maxZoom: 21,
          minZoom: 3,
          zoom: 3.5,
          maxBounds: [[hawaii_center[0] - 5, hawaii_center[1] - 5], [hawaii_center[0] + 5, hawaii_center[1] + 5]]
      });
  
      const wheelZoomRate = 1/255;
      this.mainMap.scrollZoom.setWheelZoomRate(wheelZoomRate);
      this.mainMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
      this.mainMap.addControl(new mapboxgl.GeolocateControl());
  
  
      this.mainMap.on("load", () => {
        this.mainMap.resize();
      });
  
      this.mainMap_sub1.on("load", () => {
          this.mainMap_sub1.resize();
      });
  
      this.mainMap_sub2.on("load", () => {
          this.mainMap_sub2.resize();
      });
  
      this.secondMap = new mapboxgl.Map({
          container: 'second',
          style: 'mapbox://styles/mapds9/clgh7hbwo007101lbx680xib2',
          center: us_center,
          maxZoom: 21,
          minZoom: 3,
      });
  
      this.secondMap_sub1 = new mapboxgl.Map({
          container: 'second-sub1',
          style: 'mapbox://styles/mapds9/clgh7hbwo007101lbx680xib2',
          center: alaska_center,
          maxZoom: 21,
          minZoom: 1,
          zoom: 1,
          maxBounds: [[alaska_center[0] - 10, alaska_center[1] - 10], [alaska_center[0] + 10, alaska_center[1] + 10]]
      });
  
      this.secondMap_sub2 = new mapboxgl.Map({
          container: 'second-sub2',
          style: 'mapbox://styles/mapds9/clgh7hbwo007101lbx680xib2',
          center: hawaii_center,
          maxZoom: 21,
          minZoom: 3,
          zoom: 3.5,
          maxBounds: [[hawaii_center[0] - 5, hawaii_center[1] - 5], [hawaii_center[0] + 5, hawaii_center[1] + 5]]
      });
  
      this.secondMap.scrollZoom.setWheelZoomRate(wheelZoomRate);
      this.secondMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
      this.secondMap.addControl(new mapboxgl.GeolocateControl());
  
      this.secondMap.on("load", () => {
        this.secondMap.resize();
      });
  
      this.secondMap_sub1.on("load", () => {
          this.secondMap_sub1.resize();
      });
  
      this.secondMap_sub2.on("load", () => {
          this.secondMap_sub2.resize();
      });
  
      this.mainMap.on('click', 'mainFill', (e) => this.featurePopup(e, this.mainMap));
      this.mainMap_sub1.on('click', 'mainFill', (e) => this.featurePopup(e, this.mainMap_sub1));
      this.mainMap_sub2.on('click', 'mainFill', (e) => this.featurePopup(e, this.mainMap_sub2));
      this.secondMap.on('click', 'secondFill', (e) => this.featurePopup(e, this.secondMap));
      this.secondMap_sub1.on('click', 'secondFill', (e) => this.featurePopup(e, this.secondMap_sub1));
      this.secondMap_sub2.on('click', 'secondFill', (e) => this.featurePopup(e, this.secondMap_sub2));
    }

    showSideview() {
      if (this.sideview == false){
        this.sideview = true;
        this.querySelector("#second").style.display = "block";
        this.secondMap.resize();
        this.querySelector('#show-side-view-button').querySelector('img').className = "selected";
        this.querySelector('#hide-side-view-button').querySelector('img').className = "";
        this.dispatchToggleSplitMap();
      }
    }

    hideSideview() {
      if (this.sideview){
        this.sideview = false;
        this.querySelector("#second").style.display = "none";
        this.querySelector('#show-side-view-button').querySelector('img').className = "";
        this.querySelector('#hide-side-view-button').querySelector('img').className = "selected";
        this.dispatchToggleSplitMap();
      }
    }

    connectedCallback() {
      this.innerHTML = `
        <div>
          <div 
            class="row" 
            style="height: 3vh; padding-right: 20px"
          >
            <div 
              id="whole-split-all"
              class="col"
            >
              <a id="hide-side-view-button"><img
                src="img/icon-map-full.png"
                class="${ !this.sideview ? 'selected' : ''}"
                style="width: 35px; height: 25px"
              ></a>
              <p style="display: inline">
                |
              </p>
              <a id="show-side-view-button"><img
                src="img/icon-map-split.png"
                class="${ this.sideview ? 'selected' : ''}"
                style="width: 35px; height: 25px"
              ></a>
            </div>
          </div>
          <div
            class="row"
            style="height: 60vh; position: sticky; padding-right: 20px"
          >
            <div
              id="maps-container"
            >
              <div
                id="first"
                class="map-container"
              >
                  <div 
                      id="first-sub1"
                  ></div>
                  <div 
                      id="first-sub2"
                  ></div>
              </div>
              <div
                id="second"
                class="map-container"
                style="display: none;"
              >
                <div id="second-sub1"></div>
                <div id="second-sub2"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      this.querySelector('#hide-side-view-button').onclick = () => this.hideSideview();
      this.querySelector('#show-side-view-button').onclick = () => this.showSideview();
      this.initializeMaps();
    }
  }
);