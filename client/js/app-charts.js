/*
 _____                             _   _____  _   _            _ _   _       _____ _____ _____ 
/  __ \                           | | / __  \| | | |          | | | | |     |  __ \_   _/  ___|
| /  \/ ___  _ __  _ __   ___  ___| |_`' / /'| |_| | ___  __ _| | |_| |__   | |  \/ | | \ `--. 
| |    / _ \| '_ \| '_ \ / _ \/ __| __| / /  |  _  |/ _ \/ _` | | __| '_ \  | | __  | |  `--. \
| \__/\ (_) | | | | | | |  __/ (__| |_./ /___| | | |  __/ (_| | | |_| | | | | |_\ \_| |_/\__/ /
 \____/\___/|_| |_|_| |_|\___|\___|\__\_____/\_| |_/\___|\__,_|_|\__|_| |_|  \____/\___/\____/ 
  
*/

var chart_obj = {
    health: {
        measurements: {
            chart: null,
            data: null,
            options: null
        }
    },
    broadband: {
        num_providers: {
            chart: null,
            data: null,
            options: null
        },
        dl_tiers: {
            chart: null,
            data: null,
            options: null
        },
        ul_tiers: {
            chart: null,
            data: null,
            options: null
        }
    },
    population: {
        ruralurban: {
            chart: null,
            data: null,
            options: null
        }
    }
};

function createCharts() {

    if (cur_tab === 'health') {

        chart_obj.health.measurements.data = {
            labels: ["Obesity", "Diabetes", "Smoking", "Excessive Drinking", "Physical Inactivity", "Severe Housing"],
            datasets: [
                {
                    label: "Health Behaviors",
                    backgroundColor: "rgba(220,220,220,0.2)",
                    borderColor: "rgba(186,12,12,0.5)",
                    pointBackgroundColor: "rgba(186,12,12,1)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    data: [geo_prop.adult_obesity_pct, geo_prop.diabetes_pct, geo_prop.smoking_pct, geo_prop.drinking_pct, geo_prop.physical_inactivity, geo_prop.severe_housing_problems]
                }
            ]
        };

        chart_obj.health.measurements.options = {
            responsive: true,
            // maintainAspectRatio: false,
            tooltips: {
                custom: function (tooltip) {
                    if (!tooltip) return;
                    tooltip.displayColors = false;
                },
                callbacks: {
                    title: function () {
                    },
                    label: function (tooltipItem, data) {
                        var label = data['labels'][tooltipItem['index']];
                        return tooltipItem.yLabel ? label + ': ' + tooltipItem.yLabel.toFixed(1) + '%' : label + ': N/A';
                    }
                }
            },
            legendCallback: function (chart) {
                return '<ul class="radar-legends" style="width: 100%; list-style-type: none; margin-top: 15px;"><li><div style="background-color:rgba(186,12,12,0.5); width: 20px; height: 2px; display: inline-block; margin: 4px 0;"></div>&nbsp;Health Behaviors</li></ul>'
            },
            scale: {
                ticks: {
                    display: false,
                    beginAtZero: true
                }
            },
            legend: {
                display: false
            }
        };

        if (chart_obj.health.measurements.chart) {
            chart_obj.health.measurements.chart.destroy();
        }
        chart_obj.health.measurements.chart = new Chart(document.getElementById('ch-canvas-health-1'), {
            type: 'radar',
            data: chart_obj.health.measurements.data,
            options: chart_obj.health.measurements.options
        });

        $('#ch-legend-health-1').html(chart_obj.health.measurements.chart.generateLegend());

    } else if (cur_tab === 'broadband') {

        var current_slide = $('#carousel-bb .carousel-inner div.active').index() + 1;

        //console.log(' current_slide : ' + current_slide );

        if (chart_obj.broadband.dl_tiers.chart) {
            chart_obj.broadband.dl_tiers.chart.destroy();
        }
        if (chart_obj.broadband.num_providers.chart) {
            chart_obj.broadband.num_providers.chart.destroy();
        }

        // ***********************************************************
        // chart - Number of Providers

        if (current_slide === 1) {

            chart_obj.broadband.num_providers.data = {
                labels: ["< 1", "< 2", "< 3", "< 4", "< 5", "< 6", "< 7", "< 8"],
                datasets: [
                    {
                        label: "Number of Providers",
                        backgroundColor: "rgba(220,220,220,0.4)",
                        borderColor: "rgba(0,80,204,1)",
                        pointRadius: 4,
                        pointBackgroundColor: "rgba(0,80,204,1)",
                        pointBorderColor: "#fff",
                        pointHoverBackgroundColor: "#fff",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        data: [geo_prop.cumm_prov_c_1, geo_prop.cumm_prov_c_2, geo_prop.cumm_prov_c_3, geo_prop.cumm_prov_c_4, geo_prop.cumm_prov_c_5, geo_prop.cumm_prov_c_6, geo_prop.cumm_prov_c_7, geo_prop.cumm_prov_c_8]
                    }
                ]
            };

            chart_obj.broadband.num_providers.options = {
                responsive: true,
                pointHitDetectionRadius: 0,
                scaleBeginAtZero: true,
                tooltips: {
                    custom: function (tooltip) {
                        if (!tooltip) return;
                        // Disable displaying the color box;
                        tooltip.displayColors = false;
                    },
                    callbacks: {
                        title: function (tooltipItem, data) {
                        },
                        label: function (tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';

                            if (label) {
                                label += ' ' + data.labels[tooltipItem.index] + ': ';
                            }
                            // Display value as percent
                            label += tooltipItem.yLabel.toFixed(1) + '%';
                            return label;
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            stepSize: 25
                        }
                    }]
                },
                legend: {
                    display: false
                }
            };

            if (chart_obj.broadband.num_providers.chart) {
                chart_obj.broadband.num_providers.chart.destroy();
            }

            chart_obj.broadband.num_providers.chart = new Chart(document.getElementById('ch-canvas-broadband-1'), {
                type: 'line',
                data: chart_obj.broadband.num_providers.data,
                options: chart_obj.broadband.num_providers.options
            });

            // $('#ch-legend-broadband-1').html(chart_obj.broadband.num_providers.chart.generateLegend());
        }	// end of current_slide == 1


        // ***********************************************************
        // chart - Download Tiers

        if (current_slide === 2) {

            chart_obj.broadband.dl_tiers.data = {
                labels: ['15 - 25 mbps', '25 - 50 mbps', '50 - 100 mbps', '100 - 1,000 mbps', '> 1,000 mbps'],
                datasets: [{
                    data: [
                        geo_prop.pctdsgt15000kandlt25000k_hi,
                        geo_prop.pctdsgt25000kandlt50000k_hi,
                        geo_prop.pctdsgt50000kandlt100000k_hi,
                        geo_prop.pctdsgt100000kandlt1gig_hi,
                        geo_prop.pctdsgt1gig_hi
                    ],
                    backgroundColor: [
                        '#376AE8',
                        '#3D59D7',
                        '#4348C5',
                        '#4937B4',
                        '#4F26A3'
                    ]
                }]
            };

            chart_obj.broadband.dl_tiers.options = {
                title: {
                    display: true,
                    position: 'bottom',
                    text: 'Download Speed Tiers',
                    fontSize: 14,
                    fontFamily: '"Open Sans", "sans-serif"',
                    fontStyle: 'normal'
                },
                // responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    custom: function (tooltip) {
                        if (!tooltip) return;
                        tooltip.displayColors = false;
                    },
                    callbacks: {
                        title: function () {},
                        label: function (tooltipItem, data) {
                            var label = data.labels[tooltipItem.index] + ': ';
                            label += parseFloat((data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).toFixed(3)) + '%';
                            return label;
                        }
                    }
                },
                legend: {
                    display: false
                }
            };

            if (chart_obj.broadband.dl_tiers.chart) {
                chart_obj.broadband.dl_tiers.chart.destroy();
            }

            chart_obj.broadband.dl_tiers.chart = new Chart(document.getElementById('ch-canvas-broadband-2'), {
                type: 'doughnut',
                data: chart_obj.broadband.dl_tiers.data,
                options: chart_obj.broadband.dl_tiers.options
            });

            // $('#ch-legend-broadband-2').html('Download Speed Tiers');
        }

        // ***********************************************************
        // chart - Upload Tiers

        if (current_slide === 3) {

            chart_obj.broadband.ul_tiers.data = {
                labels: ['1 - 3 mbps', '3 - 4 mbps', '4 - 6 mbps', '6 - 10 mbps', '10 - 15 mbps', '15 - 25 mbps', '25 - 50 mbps', '50 - 100 mbps', '100 - 1,000 mbps', '> 1,000 mbps'],
                datasets: [{
                    data: [
                        geo_prop.pctusgt1000kandlt3000k_hi,
                        geo_prop.pctusgt3000kandlt4000k_hi,
                        geo_prop.pctusgt4000kandlt6000k_hi,
                        geo_prop.pctusgt6000kandlt10000k_hi,
                        geo_prop.pctusgt10000kandlt15000k_hi,
                        geo_prop.pctusgt15000kandlt25000k_hi,
                        geo_prop.pctusgt25000kandlt50000k_hi,
                        geo_prop.pctusgt50000kandlt100000k_hi,
                        geo_prop.pctusgt100000kandlt1gig_hi,
                        geo_prop.pctusgt1gig_hi
                    ],
                    backgroundColor: [
                        '#87FACA',
                        '#71DAD6',
                        '#5CBAE2',
                        '#479AEE',
                        '#327BFA',
                        '#376AE8',
                        '#3D59D7',
                        '#4348C5',
                        '#4937B4',
                        '#4F26A3'
                    ]
                }]
            };


            chart_obj.broadband.ul_tiers.options = {
                // responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    position: 'bottom',
                    text: 'Upload Speed Tiers',
                    fontSize: 14,
                    fontFamily: '"Open Sans", "sans-serif"',
                    fontStyle: 'normal'
                },
                tooltips: {
                    custom: function (tooltip) {
                        if (!tooltip) return;
                        // Disable displaying the color box;
                        tooltip.displayColors = false;
                    },
                    callbacks: {
                        title: function (tooltipItem, data) {
                        },
                        label: function (tooltipItem, data) {
                            var label = data.labels[tooltipItem.index] + ': ';
                            label += parseFloat((data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).toFixed(3)) + '%';
                            return label;
                        }
                    }
                },
                legend: {
                    display: false
                }
            };

            if (chart_obj.broadband.ul_tiers.chart) {
                chart_obj.broadband.ul_tiers.chart.destroy();
            }

            chart_obj.broadband.num_providers.chart = new Chart(document.getElementById('ch-canvas-broadband-3'), {
                type: 'doughnut',
                data: chart_obj.broadband.ul_tiers.data,
                options: chart_obj.broadband.ul_tiers.options
            });

            // $('#ch-legend-broadband-3').html('Upload Speed Tiers');
        }
    } else if (cur_tab === 'population') {

        var current_slide = $('#carousel-pop .carousel-inner div.active').index() + 1;

        //console.log(' current_slide : ' + current_slide );
        if (chart_obj.broadband.dl_tiers.chart) {
            chart_obj.broadband.dl_tiers.chart.destroy();
        }
        if (chart_obj.broadband.dl_tiers.chart) {
            chart_obj.broadband.dl_tiers.chart.destroy();
        }
        if (chart_obj.broadband.num_providers.chart) {
            chart_obj.broadband.num_providers.chart.destroy();
        }
        if (chart_obj.population.ruralurban.chart) {
            chart_obj.population.ruralurban.chart.destroy();
        }


        if (current_slide === 1) {

            chart_obj.population.ruralurban.data = {
                labels: ['Rural', 'Urban'],
                datasets: [{
                    data: [geo_prop.rural_total, geo_prop.urban_total],
                    backgroundColor: ['#71DAD6', '#3D59D7']
                }]
            };

            chart_obj.population.ruralurban.options = {
                responsive: true,
                // maintainAspectRatio: false,
                tooltips: {
                    custom: function (tooltip) {
                        if (!tooltip) return;
                        // Disable displaying the color box;
                        tooltip.displayColors = false;
                    },
                    callbacks: {
                        title: function (tooltipItem, data) {},
                        label: function (tooltipItem, data) {
                            var label = data.labels[tooltipItem.index] + ': ';

                            // Calculate percentage of total population
                            var popTotal = data.datasets[tooltipItem.datasetIndex].data[0] + data.datasets[tooltipItem.datasetIndex].data[1]
                            var popVal = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            var percentPop = ((popVal / popTotal) * 100).toFixed(1);

                            // Display label with value and population percentage
                            label += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString() + ' (' + percentPop + '%)';

                            return label;
                        }
                    }
                },
                legend: {
                    display: false
                }
            };

            if (chart_obj.population.ruralurban.chart) {
                chart_obj.population.ruralurban.chart.destroy();
            }

            chart_obj.population.ruralurban.chart = new Chart(document.getElementById('ch-canvas-population-1'), {
                type: 'doughnut',
                data: chart_obj.population.ruralurban.data,
                options: chart_obj.population.ruralurban.options
            });

            // $('#ch-legend-population-1').html(chart_obj.population.ruralurban.chart.generateLegend());
        }
    }
}
  