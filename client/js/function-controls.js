//function-controls.js

// double burden, opportunity, single burden,  milestone
const county_categorization_color_mapping = ["#cc471f", "#4674e8", "#e8a41b", "#52b6b6"];
const county_categorization_color_mapping_light = ["#fefbfb", "#fafcfe", "#fffdfa", "#fbfdfd"];

async function get_category_counties(maternalHealthSelected, broadbandSelected){
  let fetchedData = null;
  await fetch("data/fcc_ahrq_cdc_blended_county.json")
    .then(response => response.json())
    .then(data => {
      const newData = reformatData(data, maternalHealthSelected, broadbandSelected);
      console.log('Success:', newData);
      allChartsBlock(newData);
      fetchedData = newData;
    });
  return fetchedData;
}

/**
 * Reformat the data and limit it to the columns relevant to the variables selected.
 * Also calculate medians.
 * @param {string} maternalHealthSelected 
 * @param {string} broadbandSelected 
 */
function reformatData(data, maternalHealthSelected, broadbandSelected) {
  console.log(maternalHealthSelected, broadbandSelected);
  const health_mappings = {
    "default": "poor_fair_health_pct",
    "alldrug": "alldrugs_age_adj_mortality_rate",
    "opioids": "anyopioids_age_adj_mortality_rate",
    "rx": "opioid_prescribing_rate",
    "Maternal Mortality": "CW_MATERNAL_MORTALITY_RATE"
    // TODO: Get mapping for severe maternal morbidity
  };

  const broadbandMappings = {
    "default": "pctpopwbbacc",
    "Download Speed": "mcds_prop",
    "Upload Speed": "mcus_prop",
    "Rural Access": "bpr_ruralpctwaccess",
    "Access": "pctpopwbbacc",
    "Internet Adoption": "subscription_ratio"
  };

  let health_col = health_mappings["default"];
  let broadband_col = broadbandMappings["default"];
  if (Object.prototype.hasOwnProperty.call(health_mappings, maternalHealthSelected)) {
    health_col = health_mappings[maternalHealthSelected];
  }
  if (Object.prototype.hasOwnProperty.call(broadbandMappings, broadbandSelected)) {
    broadband_col = broadbandMappings[broadbandSelected];
  }

  let newData = {
    data: [],
    cutoffs: [0, 0]
  };

  for (const entry of data.data) {
    newData.data.push({
      "ACS_PCT_ASSOCIATE_DGR": entry["ACS_PCT_ASSOCIATE_DGR"],
			"ACS_PCT_NONWHITE": entry["ACS_PCT_NONWHITE"],
			"ACS_PCT_PRIVATE_ANY": entry["ACS_PCT_PRIVATE_ANY"],
			"age_over_65_pct": entry["age_over_65_pct"],
			"broadband": Number(entry[broadband_col]),
			"county_categorization": 1,
			"fips": entry["fips"],
			"health": Number(entry[health_col]),
			"population": entry["population"]
    });
  }

  newData.cutoffs[0] = data.medians[health_col];
  newData.cutoffs[1] = data.medians[broadband_col];

  newData = recalculate_categories(newData, newData.cutoffs, []);

  return newData;
}

function dispatchDataChanged(data) {
  const dispatchList = [];
  dispatchList.push(document.querySelector("plots-container"));
  dispatchList.push(document.querySelector("stats-table"));
  dispatchList.push(document.querySelector("map-component"));
  [...document.querySelectorAll("variable-dropdown")].forEach((ele) => dispatchList.push(ele));

  dispatchList.forEach((ele) => {
    ele.dispatchEvent(new CustomEvent("dataChanged", { detail: data }));
  });
}


function allChartsBlock(data) {
  //var eB = document.getElementById(pane);
  document.getElementById("maternalHealthAltPlot").innerHTML = '';
  document.getElementById("maternalHealthMainPlot").innerHTML = '';

  const fixed_health_median = parseInt(data["cutoffs"][0]);
  const fixed_broadband_median = parseInt(data["cutoffs"][1]);

  const thresholdInputs = [...document.getElementsByClassName('threshold-input')];

  // When the reset button is clicked, trigger the above input handler.
  document.getElementById("reset_selections").onclick = function(){
    thresholdInputs.forEach((input) => {
      if (input.dataset.variable === 'maternalHealthSelected') {
        input.value = fixed_health_median;
      } else if (input.dataset.variable === 'broadbandSelected') {
        input.value = fixed_broadband_median;
      }
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));
    });
  };

}

function recalculate_categories(data, cutoffs, filters){
  const filter_keys = Object.keys(filters);
  for (const el of data["data"]){
    let in_range = true;
    for (let i = 0; i < filter_keys.length; i++){
      if (el[filter_keys[i]] < parseFloat(filters[filter_keys[i]][1][0]) ||
      el[filter_keys[i]] > parseFloat(filters[filter_keys[i]][1][1])){
        in_range = false;
      }
    }
    if (in_range == false || el["broadband"] == -1 || el["health"] == -1){
      el["county_categorization"] = null;
    }
    else{
      if (el["broadband"] == null || el["health"] == null){
        el["county_categorization"] = null;
      }
      else if (el["health"] >= cutoffs[0] && el["broadband"] < cutoffs[1]){
        el["county_categorization"] = 1;
      }
      else if (el["health"] >= cutoffs[0] && el["broadband"] >= cutoffs[1]){
        el["county_categorization"] = 2;
      }
      else if (el["health"] < cutoffs[0] && el["broadband"] < cutoffs[1]){
        el["county_categorization"] = 3;
      }
      else if (el["health"] < cutoffs[0] && el["broadband"] >= cutoffs[1]){
        el["county_categorization"] = 4;
      }
    }
  }

  return data;
}

window.onload = async () => {
  new bootstrap.Tooltip(document.body, {
    selector: "[data-bs-toggle='tooltip']",
  });

  // When the page loads, fetch data and dispatch it to components that need it.
  const data = await get_category_counties("Maternal Mortality", "Access");
  // Wait half a second to allow the map to initialize, then dispatch the data.
  setTimeout(() => dispatchDataChanged(data), 500);
};
