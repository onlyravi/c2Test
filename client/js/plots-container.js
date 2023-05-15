window.customElements.define(
  "plots-container",
  class extends HTMLElement {
    constructor() {
      super();
      this.toggleState = false;
      this.data = null;
      this.cutoffs = null;
      this.chart_data = [];
      this.box_data = [];
      this.maternalHealthTitlePart = "Maternal Mortality";
      this.broadbandTitlePart = "Access";
      this.addEventListener("dataChanged", this.onDataChanged);
      this.addEventListener("toggleSplitMap", this.onToggleSplitMap);
      this.addEventListener("thresholdChanged", this.onThresholdChanged);
      this.addEventListener("variableChanged", this.onVariableChanged);
      this.mapIsSplit = false;
    }

    onThresholdChanged(e) {
      this.cutoffs = [...e.detail];
      // A threshold change is usually followed by a data change. The plot is regenerated on the data change.
    }

    onVariableChanged(e) {
      this.maternalHealthTitlePart = e.detail.maternalHealthSelected;
      this.broadbandTitlePart = e.detail.broadbandSelected;
      // A variable change is usually followed by a data change. The plot is regenerated on the data change.
    }

    onDataChanged(e) {
      this.data = e.detail;
      if (!this.cutoffs) this.cutoffs = [...this.data.cutoffs];
      this.generatePlots();
    }

    onToggleSplitMap(e) {
      this.mapIsSplit = e.detail;
      this.generatePlots();
    }

    togglePlots() {
      this.toggleState = !this.toggleState;

      this.querySelector("#maternalHealthAltPlot").style.display = !this.toggleState ? "none" : "block";
      this.querySelector("#maternalHealthMainPlot").style.display = this.toggleState ? "none" : "block";

      // This will notify Plotly to check if the plot needs to be resized.
      window.dispatchEvent(new Event('resize'));
    }

    generatePlots() {
      // If the identifier is not known, resort to a default value.
      const title = {
        text: `${this.broadbandTitlePart} with ${this.maternalHealthTitlePart}`,
      };
      const scatterLayout = {
        title,
        xaxis: {
          title: {
            text: '% with Broadband Access',
          },
        },
        yaxis: {
          title: {
            text: '% of Adults with Fair/Poor Health',
          }
        },
        shapes: [
          {
            type: 'line',
            x0: this.cutoffs[1],
            y0: 0,
            x1: this.cutoffs[1],
            yref: 'paper',
            y1: 1,
            line: {
              color: 'grey',
              width: 1.5,
              dash: 'dot'
            }
          },
          {
            type: 'line',
            x0: 0,
            y0: this.cutoffs[0],
            x1: 1,
            xref: 'paper',
            y1: this.cutoffs[0],
            line: {
              color: 'grey',
              width: 1.5,
              dash: 'dot'
            }
          },
        ],
        legend: {
          bordercolor: '#B0BBD0',
          borderwidth: 1
        },
      };

      const boxLayout = {
        title,
        hovermode: false,
        xaxis: {
          title: {
            text: '',
          },
        },
        yaxis: {
          title: {
            text: '% of Adults with Fair/Poor Health',
          }
        },
        legend: {
          bordercolor: '#B0BBD0',
          borderwidth: 1
        },
        boxmode: 'group',
      };

      // Initialize data structures for plots.
      this.chart_data = [];
      this.box_data = [];
      for (const [i, cat] of ["Double Burden", "Opportunity", "Single Burden", "Milestone"].entries()) {
        this.chart_data.push({
          x: [],
          y: [],
          mode: 'markers',
          type: 'scatter',
          name: cat,
          text:[],
          hovertemplate: '<i>Broadband</i>: %{x}' + '<br><i>Health</i>: %{y}<br>',
          marker: { color: county_categorization_color_mapping[i], }
        });
        this.box_data.push({
          // https://github.com/plotly/plotly.js/issues/3830
          // Setting offsetgroup fixes issue where boxes become skinny.
          offsetgroup: '1',
          y: [],
          type: 'box',
          name: cat,
          marker: { color: county_categorization_color_mapping[i], }
        });
        if (this.mapIsSplit) {
          this.chart_data.push({
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: cat,
            text:[],
            hovertemplate: '<i>Broadband</i>: %{x}' + '<br><i>Health</i>: %{y}<br>',
            marker: {
              color: county_categorization_color_mapping[i],
              symbol: "circle-open"
            }
          });
          this.box_data.push({
            offsetgroup: '2',
            y: [],
            type: 'box',
            name: cat,
            marker: {
              color: county_categorization_color_mapping[i],
            },
            fillcolor: county_categorization_color_mapping_light[i],
            line: {
              color: county_categorization_color_mapping[i],
            }
          });
        }
      }

      // Load data into the plots.
      for (const el of this.data.data) {
        if (el["county_categorization"] === undefined || el["county_categorization"] === null) continue;
        let category = this.mapIsSplit ? 2 * (el["county_categorization"]-1) : el["county_categorization"]-1;

        this.chart_data[category]["x"].push(Number(el["broadband"]));
        this.chart_data[category]["y"].push(Number(el["health"]));

        this.box_data[category]["y"].push(Number(el["health"]));
        if (this.mapIsSplit) {
          // Populate the data for the second map with the same data as the first map. Eventually, this will change.
          category += 1;
          this.chart_data[category]["x"].push(Number(el["broadband"]));
          this.chart_data[category]["y"].push(Number(el["health"]));

          this.box_data[category]["y"].push(Number(el["health"]));
        }
      }

      Plotly.newPlot("maternalHealthAltPlot", this.chart_data, scatterLayout,
        {displaylogo: false, responsive: true});
      Plotly.newPlot("maternalHealthMainPlot", this.box_data, boxLayout,
        {displaylogo: false, responsive: true});
    }

    connectedCallback() {
      this.innerHTML = `
        <div style="text-align: end">
          <input
            class="form-control"
            checked
            type="checkbox"
            data-toggle="toggle"
          >
          <div
            id="maternalHealthAltPlot"
            style="height: 450px; display: none;"
          ></div>
          <div
            id="maternalHealthMainPlot"
            style="height: 450px;"
          ></div>
        </div>
      `;
      const toggleButton = this.querySelector("input");
      toggleButton.onchange = () => this.togglePlots();
      toggleButton.bootstrapToggle({
        onlabel: '<span class="fas fa-chart-bar"></span>', 
        offlabel: '<span class="fas fa-project-diagram"></span>',
        ontitle: 'Box plot',
        offtitle: 'Scatter plot'
      });
    }
  }
);