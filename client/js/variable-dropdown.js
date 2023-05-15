window.customElements.define(
  "variable-dropdown",
  class extends HTMLElement {
    constructor() {
      super();
      this.name = this.getAttribute('name');
      this.tooltip = this.getAttribute('tooltip');
      this.variable = this.getAttribute('variable'); // either "maternalHealthSelected" or "broadbandSelected"
      this.subtext = this.getAttribute('subtext') || "";
      this.data = null;
      this.cutoffs = null;
    
      this.maternalHealthSelected = "Maternal Mortality";
      this.broadbandSelected = "Access";
      this.addEventListener("variableChanged", this.onVariableChanged);
      this.addEventListener("dataChanged", this.onDataChanged);
      this.addEventListener("thresholdChanged", this.onThresholdChanged);
    }

    onDataChanged(e) {
      this.data = e.detail;
      if (!this.cutoffs) this.cutoffs = [...this.data.cutoffs]
    }

    onThresholdChanged(e) {
      this.cutoffs = [...e.detail];
    }

    onVariableChanged(e) {
      // When a variableChanged event is received, update which variables are currently selected.
      this.maternalHealthSelected = e.detail.maternalHealthSelected;
      this.broadbandSelected = e.detail.broadbandSelected;
      this.render();
    }

    onSliderUpdate(sliderVal) {
      this.querySelector(".threshold-input").value = Math.floor(sliderVal);
    }

    onTextInput(e) {
      this.querySelector(".threshold-slider-container").noUiSlider.set(e.target.value);
    }

    changeThreshold(newThreshold) {
      if (this.variable === "maternalHealthSelected") {
        this.cutoffs[0] = Number(newThreshold);
      } else if (this.variable === "broadbandSelected") {
        this.cutoffs[1] = Number(newThreshold);
      }
      this.dispatchThresholdChanged();

      const newData = recalculate_categories(this.data, this.cutoffs, []);
      dispatchDataChanged(newData);
    }

    dispatchThresholdChanged() {
      const dispatchList = [];
      [...document.querySelectorAll("variable-dropdown")].forEach((ele) => dispatchList.push(ele));
      dispatchList.push(document.querySelector("plots-container"));
      dispatchList.forEach((ele) => {
        ele.dispatchEvent(new CustomEvent("thresholdChanged", { detail: [...this.cutoffs] }));
      })
    }

    onVariableClick() {
      // Track which variable is selected.
      this[this.variable] = this.name;

      // When the variable changes, notify all elements in this list so they know which variables are selected.
      const dispatchList = [];
      [...document.querySelectorAll("variable-dropdown")].forEach((ele) => dispatchList.push(ele));
      dispatchList.push(document.querySelector("plots-container"));
      dispatchList.forEach((ele) => ele.dispatchEvent(new CustomEvent(
        "variableChanged",
        { detail: {
            maternalHealthSelected: this.maternalHealthSelected,
            broadbandSelected: this.broadbandSelected,
          }
        })));

      get_category_counties(this.maternalHealthSelected, this.broadbandSelected).then((newData) => {
        dispatchDataChanged(newData);
      });
    }

    render() {
      this.innerHTML = `
        <div class="p-0 overflow-hidden">
          <div
            class="variable-header ${this[this.variable] === this.name ? 'active' : ''}"
          >
            
            ${this.name} <i
              class="fas fa-info-circle"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="${this.tooltip}"
            ></i>
            <span
              style="cursor: pointer; float: right; font-size: 1rem; padding-top: 5px; color: #4781d7;"
              class="${ this[this.variable] === this.name ? 'fas fa-caret-down' : 'fas fa-caret-right'}"
              title="${ this[this.variable] === this.name ? 'Collapse' : 'Expand'} ${this.name}"
            ></span>
            <div class="variable-subtext">${this.subtext}</div>

          </div>
          <div
            style="display: ${this[this.variable] === this.name ? 'block' : 'none'}"
            class="variable-expanded"
          >
            <span>
              ${this.variable === "maternalHealthSelected" ? "Health" : "Broadband"} threshold:
              <input
                type="text" 
                class="threshold-input form-control val_text"
                inputMode="numeric"
                pattern="^(0|[1-9][0-9]?|100)$"
                maxLength="3"
                onkeypress="return event.key === 'Enter'
                  || (Number(event.key) >= 0
                  && Number(event.key) <= 100)"
                data-variable="${this.variable}"
              ><br>
            </span>
            <div class="threshold-slider-container"></div>
            <div
              style="text-align: right; padding-top: 15px;"
            >
              (National Median)
            </div>
          </div>
        </div>  
      `;
      this.querySelector(".variable-header").onclick = () => this.onVariableClick();
      const sliderRef = this.querySelector(".threshold-slider-container")
      const inputRef = this.querySelector(".threshold-input");
      noUiSlider.create(sliderRef, {
        connect: 'lower',
        step: 1,
        range: {
          'min': 0,
          'max': 100
        },
        start: 50
      });
      sliderRef.noUiSlider.on('update', (sliderVal) => this.onSliderUpdate(sliderVal));
      sliderRef.noUiSlider.on('change', (sliderVal) => this.changeThreshold(sliderVal));
      inputRef.oninput = (e) => this.onTextInput(e);
      inputRef.onchange = (e) => this.changeThreshold(e.target.value);
    }

    connectedCallback() {
      this.render();
    }
  }
);