window.customElements.define(
  "control-panel",
  class extends HTMLElement {
    constructor() {
      super();
    }

    toggleAccordion(e) {
      const panel = e.target.nextElementSibling;
      // Close all accordions except the one that was clicked.
      [...this.querySelectorAll(".mh-accordion-panel")].forEach((ele) => {
        if (ele !== panel) ele.className = "mh-accordion-panel";
      });

      if (panel.className === "mh-accordion-panel open") {
        panel.className = "mh-accordion-panel";
      } else {
        panel.className = "mh-accordion-panel open";
      };
    }

    connectedCallback() {
      this.className = "col-3";
      this.style.height = "80vh";
      this.innerHTML = document.getElementById("control-panel-template").innerHTML;
      [...this.querySelectorAll(".mh-accordion-button")].forEach((ele) => {
        ele.onclick = (e) => this.toggleAccordion(e);
      });
      [...this.querySelectorAll(".rural-pop-dropdown")].forEach((ele) => {
        ele.innerHTML = document.getElementById("rural-pop-template").innerHTML;
      });
    }
  }
);