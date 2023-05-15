class navbar extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", (event) => {
      if (event.target.id === "maps_nav") { this.toggleDropdown(); }
      this.setActive(event.target.id);
    });
    this.addEventListener("blur", (event) => {
      if (event.currentTarget.contains(event.relatedTarget)) {
        event.currentTarget.focus();
        return;
      }
      this.clickable = false;
      var maps_dropdown = document.getElementById("maps_dropdown");
      maps_dropdown.style.display = "none";
    }, true);


  }

  toggleDropdown() {
    var maps_dropdown = document.getElementById("maps_dropdown");
    if (maps_dropdown.style.display === "none") {
      maps_dropdown.style.display = "block";
      maps_dropdown.focus();
    } else {
      maps_dropdown.style.display = "none";
    }
  }

  setActive(id) {
    if (id !== "maps_nav") {
      var maps_dropdown = document.getElementById("maps_dropdown");
      maps_dropdown !== null ?
        maps_dropdown.style.display = "none" : null;

    }
    var nav_links = document.getElementById("nav_bar");

    var all_links = [];
    nav_links !== null && nav_links.length > 0 ? all_links =
      document.getElementById("nav_bar").getElementsByClassName("nav-link") :
      all_links = [];

    for (let i = 0; i < all_links.length; i++) {
      all_links[i].classList.remove("active");
    }

    this.active = id;
    var id_docs = document.getElementById(id);
    id_docs !== null ? id_docs.classList.add("active") : null;
  }
  connectedCallback() {
    this.innerHTML = `<div class="page row-offcanvas row-offcanvas-right">
          <nav role="navigation">
            <div
              id="fcc_header"
              class="navbar navbar-default navbar-primary"
            >
              <div class="container">
                <div
                  class="navbar-header"
                  style="display: inline-flex"
                >
                  <h1
                    class="navbar-brand"
                  >
                    <a
                      title="Go to the Federal Communications Commission homepage at www.fcc.gov"
                      href="http://fcc.gov"
                      class="navbar-logo-mh"
                    >
                      <span class="sr-only">Federal Communications Commission</span>
                    </a>
                  </h1>
                  <strong class="title-emphasis">Connect2Health<sup>FCC</sup></strong>
                </div>
              </div>
            </div>
            <div
              id="nav_bar"
              class="navbar-secondary-mh navbar-default navbar-expand-lg navbar-dark"
            >
              <div
                class="tab-content"
              >
                <div
                  class="container tab-pane active"
                >
                  <ul class="navbar-nav-mh mx-auto" style="padding-inline-start:10px">
                    <li class="nav-item dropdown">
                      <a
                        id="maps_nav"
                        data-testid="maps_nav"
                        class="nav-link dropdown-toggle active"
                        href="#"                                          
                      >
                        Maps
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        id="background_nav"
                        data-testid="background_nav"
                        class="nav-link"
                        href="/background"                          
                      >
                        Background
                      </a>
                    </li>
                    <li class="nav-item dropdown">
                      <a
                        id="gs_nav"
                        data-testid="gs_nav"
                        class="nav-link"
                        href="/getting-started"                          
                      >
                        Getting Started
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        id="opioids_nav"
                        data-testid="opiods_nav"
                        class="nav-link"
                        href="/focus-on-opioids"                          
                      >
                        Focus on Opioids
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        id="ce_nav"
                        data-testid="ce_nav"
                        class="nav-link"
                        href="/community-engagement"                         
                      >
                        Community Engagement
                      </a>
                    </li>
                    <li class="nav-item">
                      <a
                        id="data_nav"
                        data-testid="data_nav"
                        class="nav-link"
                        href="/data"                          
                      >Data</a>
                    </li>
                    <li class="nav-item">
                      <a
                        id="about_nav"
                        data-testID="about_nav"
                        class="nav-link"
                        href="/about"                          
                      >About
                        C2HFCC</a>
                    </li>
                  </ul>
                </div>
                <div
                  id="maps_dropdown"
                  class="nav-dropdown-container-mh"
                  style="display: none;"
                  tabindex="0"
                >
                  <div class="nav-dropdown-options-mh">
                    <b>
                      <a
                        class="nav-link" 
                        href="/"
                      >
                        Health
                      </a>
                    </b>
                    <hr style="width: 50%">
                    <b><a
                      class="nav-link"
                      href="/maternal-health-map"
                    >Maternal Health</a></b>
                    <hr style="width: 50%">
                  </div>
                  <div class="nav-dropdown-text-mh">
                    <h4><b>Mapping Broadband Health in America</b></h4>
                    <p>
                      Everyone connected... to the people, services, and information they need to get well and
                      stay healthy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>`;
  }
}

customElements.define('nav-bar', navbar);
