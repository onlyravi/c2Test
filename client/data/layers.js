/*
 _____                             _   _____  _   _            _ _   _       _____ _____ _____ 
/  __ \                           | | / __  \| | | |          | | | | |     |  __ \_   _/  ___|
| /  \/ ___  _ __  _ __   ___  ___| |_`' / /'| |_| | ___  __ _| | |_| |__   | |  \/ | | \ `--. 
| |    / _ \| '_ \| '_ \ / _ \/ __| __| / /  |  _  |/ _ \/ _` | | __| '_ \  | | __  | |  `--. \
| \__/\ (_) | | | | | | |  __/ (__| |_./ /___| | | |  __/ (_| | | |_| | | | | |_\ \_| |_/\__/ /
 \____/\___/|_| |_|_| |_|\___|\___|\__\_____/\_| |_/\___|\__,_|_|\__|_| |_|  \____/\___/\____/ 
  
*/

var insight_ly = {
    broadband: {
        in_bb_access: {
            name: 'Broadband Access',
            column: 'pctpopwbbacc',
            min: 0,
            max: 100,
            zindex: 99,
            step: .1,
            values: [0, 94.4],
            label: '% Coverage',
            tooltip: 'Percent of population with access to fixed broadband service at 25/3 mbps or higher advertised speeds, 2018.',
            slider: []
        },
        in_bb_rural_access: {
            name: 'Rural Access',
            column: 'bpr_ruralpctwaccess',
            min: 0,
            max: 100,
            zindex: 99,
            step: .1,
            values: [0, 77.7],
            label: '% Coverage',
            tooltip: 'Percent of rural population with access to fixed broadband service at 25/3 mbps or higher advertised speeds, 2018.',
            slider: []
        },
        in_bb_in_adoption: {
            name: 'Internet Adoption',
            column: 'subscription_ratio',
            min: 0,
            max: 330,
            zindex: 99,
            step: 1,
            values: [0, 84],
            label: ' Connections',
            tooltip: 'Subscribership ratio: number of fixed connections over 200kbps per 100 households, 2018.',
            slider: []
        },
        in_bb_dl_speed: {
            name: 'Download Speed',
            column: 'dl_tiers',
            min: 0,
            max: 11,
            zindex: 99,
            step: 1,
            values: [0, 7],
            label: 'Download',
            tooltip: 'Most commonly advertised maximum download speed tier, 2018.',
            slider: []
        },
        in_bb_ul_speed: {
            name: 'Upload Speed',
            column: 'ul_tiers',
            min: 0,
            max: 11,
            zindex: 99,
            step: 1,
            values: [0, 2],
            label: 'Upload',
            tooltip: 'Most commonly advertised maximum upload speed tier, 2018.',
            slider: []
        },
        in_bb_in_adoption_choro: {
            column: 'res_concxns_choro'
        }
    },
    health: {
        in_diabetes_rate: {
            name: 'Diabetes Rate',
            column: 'diabetes_pct',
            min: 0,
            max: 34.1,
            zindex: 90,
            step: .1,
            values: [0, 10.3],
            label: '% Diabetes',
            tooltip: 'Percentage of adults with diabetes.',
            slider: []
        },
        in_obs_rate: {
            name: 'Obesity Rate',
            column: 'adult_obesity_pct',
            min: 0,
            max: 57.7,
            zindex: 90,
            step: .1,
            values: [0, 29],
            label: '% Obesity',
            tooltip: 'Percentage of adults that report a BMI of 30 or more.',
            slider: []
        },
        in_pcp_access: {
            name: 'Physician Access',
            column: 'pcp_rate_per_100000',
            min: 0,
            max: 515.4,
            zindex: 90,
            step: .1,
            values: [0, 75.1],
            label: ' Physicians',
            tooltip: 'Primary Care Physicians per 100,000 people.',
            slider: []
        },
        in_poorfair: {
            name: 'Poor/Fair Health',
            column: 'poor_fair_health_pct',
            min: 0,
            max: 41,
            zindex: 90,
            step: .1,
            values: [0, 17.2],
            label: '% Poor/Fair',
            tooltip: 'Percentage of adults reporting fair or poor health (age-adjusted).',
            slider: []
        },
        in_prv_hosp: {
            name: 'Preventable Hospitalization',
            column: 'preventable_hospital_stays_per_100000',
            min: 0,
            max: 16855,
            zindex: 90,
            step: 5,
            values: [0, 4535],
            label: ' Stays',
            tooltip: 'Rate of hospital stays for ambulatory-care sensitive conditions per 100,000 Medicare enrollees.',
            slider: []
        },
        in_sick_days: {
            name: 'Sick Days',
            column: 'poor_physical_health_days_within_last_30_days',
            min: 0,
            max: 7.11,  // true max is 7.1. Due to slider bug, set to 7.11
            zindex: 90,
            step: .1,
            values: [0, 3.8],
            label: ' Sick Days',
            tooltip: 'Average number of physically unhealthy days reported in past 30 days (age-adjusted).',
            suffix: 'days',
            slider: []
        }
    },
    opioid: {
        in_alldrugs_age_adj_mortality_rate: {
            name: 'All Drug Deaths',
            column: 'alldrugs_age_adj_mortality_rate',
            zindex: 90,
            label: ' Deaths per 100,000',
            tooltip: 'Average, age-adjusted mortality rate from all drug-related overdoses, 2014-2018.',
            stateMin: 7.2,
            stateMax: 47.6,
            countyMin: 3.6,
            countyMax: 113.6,
            slider: {county: [], state: []}
        },
        in_alldrugs_age_adj_mortality_rate_pct_change: {
            name: 'All Drug Death Trends',
            column: 'alldrugs_age_adj_mortality_rate_pct_change',
            zindex: 90,
            label: ' in Death Rate',
            tooltip: 'Percent change in average, age-adjusted mortality rate from all drug-related overdoses, 2009-2018.',
            stateMin: -9.5,
            stateMax: 190.3,
            countyMin: -65.7,
            countyMax: 287.6,
            slider: {county: [], state: []}
        },
        in_anyopioids_age_adj_mortality_rate: {
            name: 'All Opioid Deaths',
            column: 'anyopioids_age_adj_mortality_rate',
            zindex: 90,
            label: ' Deaths per 100,000',
            tooltip: 'Average, age-adjusted mortality rate from all opioid-related overdoses, 2014-2018.',
            stateMin: 3,
            stateMax: 40.5,
            countyMin: 1.2,
            countyMax: 104,
            slider: {county: [], state: []}
        },
        in_anyopioids_age_adj_mortality_rate_pct_change: {
            name: 'All Opioid Death Trends',
            column: 'anyopioids_age_adj_mortality_rate_pct_change',
            zindex: 90,
            label: ' in Death Rate',
            tooltip: 'Percent change in average, age-adjusted mortality rate from all opioid-related overdoses, 2009-2018.',
            stateMin: -29,
            stateMax: 262.5,
            countyMin: -59.3,
            countyMax: 917.6,
            slider: {county: [], state: []}
        },
        in_prescriptionopioids_age_adj_mortality_rate: {
            name: 'Rx Opioid Deaths',
            column: 'prescriptionopioids_age_adj_mortality_rate',
            zindex: 90,
            label: ' Deaths per 100,000',
            tooltip: 'Average, age-adjusted mortality rate from all prescription opioid overdoses, 2014-2018.',
            stateMin: 2,
            stateMax: 18.6,
            countyMin: 0.9,
            countyMax: 52.8,
            slider: {county: [], state: []}
        },
        in_prescriptionopioids_age_adj_mortality_rate_pct_change: {
            name: 'Rx Opioid Death Trends',
            column: 'prescriptionopioids_age_adj_mortality_rate_pct_change',
            zindex: 90,
            label: ' in Death Rate',
            tooltip: 'Percent change in average, age-adjusted mortality rate from all prescription opioid overdoses, 2009-2018.',
            stateMin: -50.9,
            stateMax: 180,
            countyMin: -75.5,
            countyMax: 390.9,
            slider: {county: [], state: []}
        },
        in_syntheticopioids_age_adj_mortality_rate: {
            name: 'Synthetic Opioid Deaths',
            column: 'syntheticopioids_age_adj_mortality_rate',
            zindex: 90,
            label: ' Deaths per 100,000',
            tooltip: 'Average, age-adjusted mortality rate from all synthetic opioid overdoses, 2014-2018.',
            stateMin: 0.7,
            stateMax: 25.7,
            countyMin: 0.4,
            countyMax: 75.3,
            slider: {county: [], state: []}
        },
        in_syntheticopioids_age_adj_mortality_rate_pct_change: {
            name: 'Synthetic Opioid Death Trends',
            column: 'syntheticopioids_age_adj_mortality_rate_pct_change',
            zindex: 90,
            label: ' in Death Rate',
            tooltip: 'Percent change in average, age-adjusted mortality rate from all synthetic opioid overdoses, 2009-2018.',
            stateMin: -26.7,
            stateMax: 3433.3,
            countyMin: -27.3,
            countyMax: 4290,
            slider: {county: [], state: []}
        },
        in_heroin_age_adj_mortality_rate: {
            name: 'Heroin Deaths',
            column: 'heroin_age_adj_mortality_rate',
            zindex: 90,
            label: ' Deaths per 100,000',
            tooltip: 'Average, age-adjusted mortality rate  from all heroin overdoses, 2014-2018.',
            stateMin: 0.3,
            stateMax: 12.7,
            countyMin: 0.5,
            countyMax: 50.2,
            slider: {county: [], state: []}
        },
        in_heroin_age_adj_mortality_rate_pct_change: {
            name: 'Heroin Death Trends',
            column: 'heroin_age_adj_mortality_rate_pct_change',
            zindex: 90,
            label: ' in Death Rate',
            tooltip: 'Percent change in average, age-adjusted mortality rate from all heroin overdoses, 2009-2018.',
            stateMin: 3.3,
            stateMax: 716.7,
            countyMin: -41.5,
            countyMax: 860,
            slider: {county: [], state: []}
        },
        in_opioid_prescribing_rate: {
            name: 'Rx Rates',
            column: 'opioid_prescribing_rate',
            zindex: 90,
            label: ' Rx per 100',
            tooltip: 'Opioid prescribing patterns (rate of retail opioid prescriptions dispensed per 100 persons), 2018.',
            stateMin: 25,
            stateMax: 97.5,
            countyMin: 0,
            countyMax: 311.3,
            slider: {county: [], state: []}
        },
        in_opioid_prescribing_rate_pct_change: {
            name: 'Rx Trends',
            column: 'opioid_prescribing_rate_pct_change',
            zindex: 90,
            label: ' in Rx Rate',
            tooltip: 'Percent change in opioid prescribing patterns (percent change in rate of retail opioid prescriptions dispensed per 100 persons), 2017-2018.',
            stateMin: -24,
            stateMax: -7.9,
            countyMin: -100,
            countyMax: 6125,
            slider: {county: [], state: []}
        }
    },
    // Broadband tab > opioid filter slider - user setting
    bbOpioid: {
        in_alldrugs_age_adj_mortality_rate: {
            slider: {county: [], state: []}
        },
        in_alldrugs_age_adj_mortality_rate_pct_change: {
            slider_allTrends: {county: [], state: []},
            slider_decreasing: {county: [], state: []},
            slider_increasing: {county: [], state: []}
        },
        in_anyopioids_age_adj_mortality_rate: {
            slider: {county: [], state: []}
        },
        in_anyopioids_age_adj_mortality_rate_pct_change: {
            slider_allTrends: {county: [], state: []},
            slider_decreasing: {county: [], state: []},
            slider_increasing: {county: [], state: []}
        },
        in_prescriptionopioids_age_adj_mortality_rate: {
            slider: {county: [], state: []}
        },
        in_prescriptionopioids_age_adj_mortality_rate_pct_change: {
            slider_allTrends: {county: [], state: []},
            slider_decreasing: {county: [], state: []},
            slider_increasing: {county: [], state: []}
        },
        in_syntheticopioids_age_adj_mortality_rate: {
            slider: {county: [], state: []}
        },
        in_syntheticopioids_age_adj_mortality_rate_pct_change: {
            slider_allTrends: {county: [], state: []},
            slider_decreasing: {county: [], state: []},
            slider_increasing: {county: [], state: []}
        },
        in_heroin_age_adj_mortality_rate: {
            slider: {county: [], state: []}
        },
        in_heroin_age_adj_mortality_rate_pct_change: {
            slider_allTrends: {county: [], state: []},
            slider_decreasing: {county: [], state: []},
            slider_increasing: {county: [], state: []}
        },
        in_opioid_prescribing_rate: {
            slider: {county: [], state: []}
        },
        in_opioid_prescribing_rate_pct_change: {
            slider_allTrends: {county: [], state: []},
            slider_decreasing: {county: [], state: []},
            slider_increasing: {county: [], state: []}
        },
    },
    // Data overlays
    count: {
        in_cnt_pcp: {
            name: 'Physicians',
            layer: 'c2hgis',
            column: 'pcp_total',
            style: 'pcp',
            color: '#ba0c0c',
            county: {
                min: 10,
                max: 500
            },
            state: {
                min: '1,000',
                max: '10,000'
            }
        },
        in_cnt_ip: {
            name: 'Internet Providers',
            layer: 'c2hgis',
            column: 'provcount_c',
            style: 'ip',
            color: '#0050cc',
            county: {
                min: 1,
                max: 15
            },
            state: {
                min: 10,
                max: 150
            }
        },
        in_cnt_pop: {
            name: 'Population',
            layer: 'c2hgis',
            column: 'population',
            style: 'pop',
            color: '#05ad28',
            county: {
                min: '10,000',
                max: '1&nbsp;million'
            },
            state: {
                min: '1&nbsp;million',
                max: '10&nbsp;million'
            }
        }
    }
};

// Health > Chronic disease > Health measures choropleth
var health_ly = {
    hh_diabetes_rate: {
        column: 'diabetes_pct',
        style: 'health_sec_diabetes',
        ranges: '≤8.7, 8.8 - 10.7, 10.8 - 12.6, 12.7 - 15.4, >15.4',
        label: '% Diabetes',
        tooltip: 'in_diabetes_rate'
    },
    hh_obesity: {
        column: 'adult_obesity_pct',
        style: 'health_sec_obesity',
        ranges: '≤28.3, 28.4 - 31.7, 31.8 - 34.4, 34.5 - 37.3, >37.3',
        label: '% Obesity',
        tooltip: 'in_obs_rate'
    },
    hh_pcppc: {
        column: 'pcp_rate_per_100000',
        style: 'health_sec_pcpacc',
        ranges: '>76.1, 76.1 - 54, 54 - 39.8, 39.8 - 24.2, ≤24.2',
        label: 'PCP/100,000',
        tooltip: 'in_pcp_access'
    },
    hh_poorfair: {
        column: 'poor_fair_health_pct',
        style: 'health_sec_poorfair',
        ranges: '≤13.7, 13.8 - 16.0, 16.1 - 18.6, 18.7 - 21.8, >21.8',
        label: '% Poor/Fair Health',
        tooltip: 'in_poorfair'
    },
    hh_preventhosp: {
        column: 'preventable_hospital_stays_per_100000',
        style: 'health_sec_preventhosp',
        ranges: '≤3391, 3392 - 4284, 4285 - 5118, 5119 - 6139, >6139',
        label: '# Hospital Stays',
        tooltip: 'in_prv_hosp'
    },
    hh_sick_days: {
        column: 'poor_physical_health_days_within_last_30_days',
        style: 'health_sec_sickdays',
        ranges: '≤3.4, 3.4 - 3.8, 3.8 - 4.1, 4.1 - 4.6, >4.6',
        label: '# Sick Days',
        tooltip: 'in_sick_days'
    },
};

// Health > Opioids > Opioid measures choropleth
var opioid_ly = {
    in_alldrugs_age_adj_mortality_rate: {
        column: 'alldrugs_age_adj_mortality_rate',
        style: 'opioid_alldrugs_mortality',
        ranges: '≤13.1, 13.2 - 17.8, 17.9 - 22.6, 22.7 - 30.2, >30.2'
    },
    in_alldrugs_age_adj_mortality_rate_pct_change: {
        column: 'alldrugs_age_adj_mortality_rate_pct_change',
        style: 'opioid_alldrugs_pct_chg',
        ranges: '≤-2.5, -2.4 - 18.6, 18.7 - 45.5, 45.6 - 88, >88'
    },
    in_anyopioids_age_adj_mortality_rate: {
        column: 'anyopioids_age_adj_mortality_rate',
        style: 'opioid_anyopioids_mortality',
        ranges: '≤8.1, 8.2 - 12.3, 12.4 - 17, 17.1 - 23.8, >23.8'
    },
    in_anyopioids_age_adj_mortality_rate_pct_change: {
        column: 'anyopioids_age_adj_mortality_rate_pct_change',
        style: 'opioid_anyopioids_pct_chg',
        ranges: '≤0, 0.1 - 33.6, 33.7 - 80.9, 81 - 148, >148'
    },
    in_syntheticopioids_age_adj_mortality_rate: {
        column: 'syntheticopioids_age_adj_mortality_rate',
        style: 'opioid_syntheticopioids_mortality',
        ranges: '≤4.1, 4.2 - 7.1, 7.2 - 10.8, 10.9 - 16.9, >16.9'
    },
    in_syntheticopioids_age_adj_mortality_rate_pct_change: {
        column: 'syntheticopioids_age_adj_mortality_rate_pct_change',
        style: 'opioid_syntheticopioids_pct_chg',
        ranges: '≤71.4, 71.5 - 350, 350.1 - 675, 675.1 - 1200, >1200'
    },
    in_prescriptionopioids_age_adj_mortality_rate: {
        column: 'prescriptionopioids_age_adj_mortality_rate',
        style: 'opioid_prescriptionopioids_mortality',
        ranges: '≤3.8, 3.9 - 5.5, 5.6 - 7.6, 7.7 - 11.1, >11.1'
    },
    in_prescriptionopioids_age_adj_mortality_rate_pct_change: {
        column: 'prescriptionopioids_age_adj_mortality_rate_pct_change',
        style: 'opioid_prescriptionopioids_pct_chg',
        ranges: '≤-26.3, 26.2- -4.5, -4.4 - 15.9, 16 - 44.1, 44.1'
    },
    in_heroin_age_adj_mortality_rate: {
        column: 'heroin_age_adj_mortality_rate',
        style: 'opioid_heroin_mortality',
        ranges: '≤3.2, 3.3 - 5.1, 5.2 - 7.5, 7.6 - 11, >11'
    },
    in_heroin_age_adj_mortality_rate_pct_change: {
        column: 'heroin_age_adj_mortality_rate_pct_change',
        style: 'opioid_heroin_pct_chg',
        ranges: '≤50.3, 50.4 - 121.2, 121.3 - 175, 175.1 - 258.3, >258.3'
    },
    in_opioid_prescribing_rate: {
        column: 'opioid_prescribing_rate',
        style: 'opioid_prescribing_rate',
        ranges: '≤36.5, 36.6 - 51.2, 51.3 - 66.3, 66.4 - 84.9, >84.9'
    },
    in_opioid_prescribing_rate_pct_change: {
        column: 'opioid_prescribing_rate_pct_change',
        style: 'opioid_prescribing_rate_pct_chg',
        ranges: '≤-16.8, -16.7 - -13.4, -13.3 - -10.8, -10.7 - -7.3, >-7.3'
    }
};

// Broadband tab > Fixed broadband availability tooltips
var broadband_ly = {
    fixed_access: {
        tooltip: 'Percent of population with access to fixed broadband service at 25/3 mbps or higher advertised speeds, 2018.'
    },
    wn_dl: {
        tooltip: 'Percent of population with access to fixed broadband service at 25 mbps or higher advertised download speeds, 2018.'
    },
    wn_ul: {
        tooltip: 'Percent of population with access to fixed broadband service at 3 mbps or higher advertised upload speeds, 2018.'
    },
    in_adoption: {
        tooltip: 'Subscribership ratio: number of fixed connections over 200kbps per 100 households, 2018.'
    }
};

// Demographics tab choropleth
var pop_ly = {
    pop_urbanrural: {
        column: 'rural_pct',
        style: 'pop_urbanrural',
        ranges: '≤10,10 - 20,20 - 35,35 - 50,>50',
        label: '% Rural',
        tooltip: 'Percentage of population living in a rural area.'
    },
    pop_density: {
        column: 'pop_density',
        style: 'pop_density',
        ranges: '≤25,25 - 50,50 - 100,100 - 250,>250',
        label: 'Population per sq. mile',
        tooltip: 'Population density per square mile.'
    },
    pop_age: {
        column: 'age_over_65_pct',
        style: 'pop_age',
        ranges: '≤15.6,15.7 - 17.9,18 - 19.9,20 - 22.6,>22.6',
        label: '% Over 65',
        tooltip: 'Percentage of population aged 65 and older.'
    },
    pop_unemploy: {
        column: 'unemployment',
        style: 'pop_unemploy',
        ranges: '≤3,3.1 - 3.6,3.7 - 4.2,4.3 - 5.1,>5.1',
        label: '% Unemployed',
        tooltip: 'Percentage of civilian population ages 16 and older unemployed but seeking work.'
    },
    pop_edu: {
        column: 'some_college',
        style: 'pop_edu',
        ranges: '≤47.8,47.9 - 54.6,54.7 - 61.2,61.3 - 68.3,>68.3',
        label: '% Some College',
        tooltip: 'Percentage of adults ages 25-44 with some post-secondary education.'
    }
};

// Broadband speed tiers
var bb_speed_tiers = {
    0: {
        range: '0',
        min: '0',
        max: '0'
    },
    1: {
        range: '0 - 1',
        min: '0',
        max: '1'
    },
    2: {
        range: '1 - 3',
        min: '1',
        max: '3'
    },
    3: {
        range: '3 - 4',
        min: '3',
        max: '4'
    },
    4: {
        range: '4 - 6',
        min: '4',
        max: '6'
    },
    5: {
        range: '6 - 10',
        min: '6',
        max: '10'
    },
    6: {
        range: '10 - 15',
        min: '10',
        max: '15'
    },
    7: {
        range: '15 - 25',
        min: '15',
        max: '25'
    },
    8: {
        range: '25 - 50',
        min: '25',
        max: '50'
    },
    9: {
        range: '50 - 100',
        min: '50',
        max: '100'
    },
    10: {
        range: '100 - 1,000',
        min: '100',
        max: '1,000'
    },
    11: {
        range: '> 1,000',
        min: '> 1,000',
        max: '> 1,000'
    }
};
