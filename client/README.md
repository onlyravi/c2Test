Connect2HealthFCC
======
The Connect2HealthFCC Task Force’s platform *Mapping Broadband Health in America 2022* allows users to visualize, intersect and analyze broadband and health data at the national, state and county levels – informing policy and program prescriptions, future innovations, and investment decisions.

The maps are an interactive experience, showing various pictures of the intersection between connectivity and health for every county in the United States. Users can generate customized maps that show broadband access, adoption and speed alongside various health measures (e.g., opioid mortality, obesity, diabetes and physician access) in urban and rural areas.

These maps can be used by both public and private sectors, and local communities, to identify opportunities and gaps in connected care. 

### Screenshot
![alt text](img/screenshot-home.PNG "FCC Connect2Health")

## Data sources
The annual fixed broadband data in the platform comes from the Commission’s [Form 477](https://www.fcc.gov/general/broadband-deployment-data-fcc-form-477) data on residential fixed broadband deployment and residential fixed broadband subscribership. (Through Form 477, facilities-based broadband providers submit information to the FCC about where they offer and have subscribers to Internet access services over 200 kilobits per second (kbps) in at least one direction.) The annual data in the platform was released in December 2019 and covers data submissions as of December 2018. Proportions for broadband access statistics are calculated using U.S. household estimates from the Census Bureau’s Current Population Survey (CPS) for July of each year.

The health data is drawn from the 2020 release of the Robert Wood Johnson Foundation County Health Rankings & Roadmap (which reflects data from the Health Resources and Services Administration, Dartmouth Atlas Project, American Medical Association, Centers for Disease Control and Prevention, National Center for Health Statistics and other primary sources); additional demographic data is from the U.S. Census Bureau. Learn more about the [data](https://www.fcc.gov/reports-research/maps/connect2health/data.html) and [methodology](https://www.fcc.gov/health/maps/methodology).

## Running the Site Locally
To run the site locally on your own computer (most helpful for previewing your own changes), you will need to install a local server like [http-server](https://www.npmjs.com/package/http-server) or [xampp](https://www.apachefriends.org/index.html):

1. [Fork this repository](https://help.github.com/articles/fork-a-repo/ "Instructions for Forking Your Repository") and clone it on your computer.
2. The client side files are located in the `client` folder.
3. Start the local server, then visit `http://localhost:8080/client/index.html` in your browser to preview the site. You may need to change the port number depending on how your local server is setup.

## Download 
* [Version 2.0.0](https://github.com/FCC/c2hgis-web/archive/refs/tags/v2.0.0.zip)

## Contact
* e-mail: engagec2h@fcc.gov
