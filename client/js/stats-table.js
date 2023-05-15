window.customElements.define(
  "stats-table",
  class extends HTMLElement {
    constructor() {
      super();
      this.mapIsSplit = false;
      this.data = { data: [] };
      this.addEventListener("toggleSplitMap", this.onToggleSplitMap);
      this.addEventListener("dataChanged", this.onDataChanged);
    }

    onToggleSplitMap(e) {
      this.mapIsSplit = e.detail;
      this.generateTable()
    }

    onDataChanged(e) {
      this.data = e.detail;
      this.generateTable();
    }

    generateTable() {
      // Initialize rows.
      const rows = [];
      const table_descriptions = [
        "Double Burden: Lower connectivity, Higher health need",
        "Opportunity: Higher connectivity, Higher health need",
        "Single Burden: Lower connectivity, Lower health need",
        "Milestone: Higher connectivity, Lower health need"
      ];
      for (const [i, description] of table_descriptions.entries()) {
        const row = {
          description,
          color: county_categorization_color_mapping[i],
          pop_count: 0,
          pop_count2: 0,
          county_count: 0,
          county_count2: 0
        };
        rows.push(row);
      }

      // Populate rows with actual data.
      for (const el of this.data["data"]) {
        if (el["county_categorization"] === undefined || el["county_categorization"] === null) continue;
        const category = el["county_categorization"] - 1;
        rows[category].pop_count += el["population"];
        rows[category].county_count++;

        // Temporarily use the same data for both maps.
        rows[category].pop_count2 += el["population"];
        rows[category].county_count2++;
      }

      // Render rows.
      this.querySelector("#stats-table-rows-container").innerHTML = "";
      for (const row of rows) {
        this.querySelector("#stats-table-rows-container").innerHTML += `
          <div class="row">
            <div class="col-5">
              ${row.description}
            </div>
            <div class="col-1">
              <div
                class="table-bubble"
                style="background-color: ${row.color}"
              ></div>
              ${ this.mapIsSplit ? '<div ' +
                'class="table-bubble" ' +
                'style="border: 2px solid ' + row.color + '"' +
              '></div>' : ''}
            </div>
            <div class="col-3 population_metric">
              <div>${ row.pop_count.toLocaleString() }</div>
              ${this.mapIsSplit ? '<div>' + row.pop_count2.toLocaleString() + '</div>' : ''}
            </div>
            <div class="col-3 county_count_metric">
              <div>${ row.county_count.toLocaleString() }</div>
              ${this.mapIsSplit ? '<div>' + row.county_count2.toLocaleString() + '</div>' : ''}
            </div>
          </div>
          <hr>
        `;
      }
    }

    connectedCallback() {
      this.innerHTML = `
        <div>
          <div class="container">
            <div
              id="categorization_metrics_header"
              class="row"
            >
              <div class="col-5">
                <b>County Categorization</b>
              </div>
              <div class="col-1"></div>
              <div class="col-3">
                <b>Population count</b>
              </div>
              <div class="col-3">
                <b>County count</b>
              </div>
            </div>
          </div>
          <div id="stats-table-rows-container"></div>
        </div> 
      `;
      this.generateTable();
    }
  }
);