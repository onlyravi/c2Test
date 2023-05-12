/*
  _____                             _   _____  _   _            _ _   _       _____ _____ _____ 
 /  __ \                           | | / __  \| | | |          | | | | |     |  __ \_   _/  ___|
| /  \/ ___  _ __  _ __   ___  ___| |_`' / /'| |_| | ___  __ _| | |_| |__   | |  \/ | | \ `--. 
| |    / _ \| '_ \| '_ \ / _ \/ __| __| / /  |  _  |/ _ \/ _` | | __| '_ \  | | __  | |  `--. \
| \__/\ (_) | | | | | | |  __/ (__| |_./ /___| | | |  __/ (_| | | |_| | | | | |_\ \_| |_/\__/ /
 \____/\___/|_| |_|_| |_|\___|\___|\__\_____/\_| |_/\___|\__,_|_|\__|_| |_|  \____/\___/\____/ 
  
*/

var states_data = {
    "01": {
        "name": "Alabama",
        "abbr": "AL"
    },
    "02": {
        "name": "Alaska",
        "abbr": "AK"
    },
    "04": {
        "name": "Arizona",
        "abbr": "AZ"
    },
    "05": {
        "name": "Arkansas",
        "abbr": "AR"
    },
    "06": {
        "name": "California",
        "abbr": "CA"
    },
    "08": {
        "name": "Colorado",
        "abbr": "CO"
    },
    "09": {
        "name": "Connecticut",
        "abbr": "CT"
    },
    "10": {
        "name": "Delaware",
        "abbr": "DE"
    },
    "11": {
        "name": "District of Columbia",
        "abbr": "DC"
    },
    "12": {
        "name": "Florida",
        "abbr": "FL"
    },
    "13": {
        "name": "Georgia",
        "abbr": "GA"
    },
    "15": {
        "name": "Hawaii",
        "abbr": "HI"
    },
    "16": {
        "name": "Idaho",
        "abbr": "ID"
    },
    "17": {
        "name": "Illinois",
        "abbr": "IL"
    },
    "18": {
        "name": "Indiana",
        "abbr": "IN"
    },
    "19": {
        "name": "Iowa",
        "abbr": "IA"
    },
    "20": {
        "name": "Kansas",
        "abbr": "KS"
    },
    "21": {
        "name": "Kentucky",
        "abbr": "KY"
    },
    "22": {
        "name": "Louisiana",
        "abbr": "LA"
    },
    "23": {
        "name": "Maine",
        "abbr": "ME"
    },
    "24": {
        "name": "Maryland",
        "abbr": "MD"
    },
    "25": {
        "name": "Massachusetts",
        "abbr": "MA"
    },
    "26": {
        "name": "Michigan",
        "abbr": "MI"
    },
    "27": {
        "name": "Minnesota",
        "abbr": "MN"
    },
    "28": {
        "name": "Mississippi",
        "abbr": "MS"
    },
    "29": {
        "name": "Missouri",
        "abbr": "MO"
    },
    "30": {
        "name": "Montana",
        "abbr": "MT"
    },
    "31": {
        "name": "Nebraska",
        "abbr": "NE"
    },
    "32": {
        "name": "Nevada",
        "abbr": "NV"
    },
    "33": {
        "name": "New Hampshire",
        "abbr": "NH"
    },
    "34": {
        "name": "New Jersey",
        "abbr": "NJ"
    },
    "35": {
        "name": "New Mexico",
        "abbr": "NM"
    },
    "36": {
        "name": "New York",
        "abbr": "NY"
    },
    "37": {
        "name": "North Carolina",
        "abbr": "NC"
    },
    "38": {
        "name": "North Dakota",
        "abbr": "ND"
    },
    "39": {
        "name": "Ohio",
        "abbr": "OH"
    },
    "40": {
        "name": "Oklahoma",
        "abbr": "OK"
    },
    "41": {
        "name": "Oregon",
        "abbr": "OR"
    },
    "42": {
        "name": "Pennsylvania",
        "abbr": "PA"
    },
    "44": {
        "name": "Rhode Island",
        "abbr": "RI"
    },
    "45": {
        "name": "South Carolina",
        "abbr": "SC"
    },
    "46": {
        "name": "South Dakota",
        "abbr": "SD"
    },
    "47": {
        "name": "Tennessee",
        "abbr": "TN"
    },
    "48": {
        "name": "Texas",
        "abbr": "TX"
    },
    "49": {
        "name": "Utah",
        "abbr": "UT"
    },
    "50": {
        "name": "Vermont",
        "abbr": "VT"
    },
    "51": {
        "name": "Virginia",
        "abbr": "VA"
    },
    "53": {
        "name": "Washington",
        "abbr": "WA"
    },
    "54": {
        "name": "West Virginia",
        "abbr": "WV"
    },
    "55": {
        "name": "Wisconsin",
        "abbr": "WI"
    },
    "56": {
        "name": "Wyoming",
        "abbr": "WY"
    }
};

var states_abbr = {
    "AL": {
        "name": "Alabama",
        "fips": "01"
    },
    "AK": {
        "name": "Alaska",
        "fips": "02"
    },
    "AZ": {
        "name": "Arizona",
        "fips": "04"
    },
    "AR": {
        "name": "Arkansas",
        "fips": "05"
    },
    "CA": {
        "name": "California",
        "fips": "06"
    },
    "CO": {
        "name": "Colorado",
        "fips": "08"
    },
    "CT": {
        "name": "Connecticut",
        "fips": "09"
    },
    "DE": {
        "name": "Delaware",
        "fips": "10"
    },
    "DC": {
        "name": "District of Columbia",
        "fips": "11"
    },
    "FL": {
        "name": "Florida",
        "fips": "12"
    },
    "GA": {
        "name": "Georgia",
        "fips": "13"
    },
    "HI": {
        "name": "Hawaii",
        "fips": "15"
    },
    "ID": {
        "name": "Idaho",
        "fips": "16"
    },
    "IL": {
        "name": "Illinois",
        "fips": "17"
    },
    "IN": {
        "name": "Indiana",
        "fips": "18"
    },
    "IA": {
        "name": "Iowa",
        "fips": "19"
    },
    "KS": {
        "name": "Kansas",
        "fips": "20"
    },
    "KY": {
        "name": "Kentucky",
        "fips": "21"
    },
    "LA": {
        "name": "Louisiana",
        "fips": "22"
    },
    "ME": {
        "name": "Maine",
        "fips": "23"
    },
    "MD": {
        "name": "Maryland",
        "fips": "24"
    },
    "MA": {
        "name": "Massachusetts",
        "fips": "25"
    },
    "MI": {
        "name": "Michigan",
        "fips": "26"
    },
    "MN": {
        "name": "Minnesota",
        "fips": "27"
    },
    "MS": {
        "name": "Mississippi",
        "fips": "28"
    },
    "MO": {
        "name": "Missouri",
        "fips": "29"
    },
    "MT": {
        "name": "Montana",
        "fips": "30"
    },
    "NE": {
        "name": "Nebraska",
        "fips": "31"
    },
    "NV": {
        "name": "Nevada",
        "fips": "32"
    },
    "NH": {
        "name": "New Hampshire",
        "fips": "33"
    },
    "NJ": {
        "name": "New Jersey",
        "fips": "34"
    },
    "NM": {
        "name": "New Mexico",
        "fips": "35"
    },
    "NY": {
        "name": "New York",
        "fips": "36"
    },
    "NC": {
        "name": "North Carolina",
        "fips": "37"
    },
    "ND": {
        "name": "North Dakota",
        "fips": "38"
    },
    "OH": {
        "name": "Ohio",
        "fips": "39"
    },
    "OK": {
        "name": "Oklahoma",
        "fips": "40"
    },
    "OR": {
        "name": "Oregon",
        "fips": "41"
    },
    "PA": {
        "name": "Pennsylvania",
        "fips": "42"
    },
    "RI": {
        "name": "Rhode Island",
        "fips": "44"
    },
    "SC": {
        "name": "South Carolina",
        "fips": "45"
    },
    "SD": {
        "name": "South Dakota",
        "fips": "46"
    },
    "TN": {
        "name": "Tennessee",
        "fips": "47"
    },
    "TX": {
        "name": "Texas",
        "fips": "48"
    },
    "UT": {
        "name": "Utah",
        "fips": "49"
    },
    "VT": {
        "name": "Vermont",
        "fips": "50"
    },
    "VA": {
        "name": "Virginia",
        "fips": "51"
    },
    "WA": {
        "name": "Washington",
        "fips": "53"
    },
    "WV": {
        "name": "West Virginia",
        "fips": "54"
    },
    "WI": {
        "name": "Wisconsin",
        "fips": "55"
    },
    "WY": {
        "name": "Wyoming",
        "fips": "56"
    }
};
