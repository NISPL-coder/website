// Hierarchical Country -> State -> City Dataset for Customer Directory
export const LOCATION_DATA = [
  {
    country: 'India',
    code: 'IN',
    states: [
      {
        state: 'West Bengal',
        cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Burdwan', 'Kharagpur', 'Haldia', 'Kalyani', 'Barasat']
      },
      {
        state: 'Maharashtra',
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati']
      },
      {
        state: 'Karnataka',
        cities: ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Shivamogga']
      },
      {
        state: 'Delhi (NCT)',
        cities: ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Connaught Place']
      },
      {
        state: 'Tamil Nadu',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore']
      },
      {
        state: 'Telangana',
        cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Secunderabad', 'Ramagundam']
      },
      {
        state: 'Gujarat',
        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand']
      },
      {
        state: 'Uttar Pradesh',
        cities: ['Lucknow', 'Noida', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj (Allahabad)', 'Ghaziabad', 'Meerut', 'Aligarh']
      },
      {
        state: 'Odisha',
        cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur', 'Balasore', 'Baripada']
      },
      {
        state: 'Bihar',
        cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Ara']
      },
      {
        state: 'Jharkhand',
        cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh', 'Giridih']
      },
      {
        state: 'Andhra Pradesh',
        cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada']
      },
      {
        state: 'Rajasthan',
        cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar']
      },
      {
        state: 'Madhya Pradesh',
        cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna']
      },
      {
        state: 'Kerala',
        cities: ['Kochi (Cochin)', 'Thiruvananthapuram', 'Kozhikode (Calicut)', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur']
      },
      {
        state: 'Punjab',
        cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot']
      },
      {
        state: 'Haryana',
        cities: ['Gurugram (Gurgaon)', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal']
      },
      {
        state: 'Assam',
        cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur']
      },
      {
        state: 'Chhattisgarh',
        cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon']
      },
      {
        state: 'Goa',
        cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda']
      }
    ]
  },
  {
    country: 'United States',
    code: 'US',
    states: [
      {
        state: 'California',
        cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Irvine']
      },
      {
        state: 'New York',
        cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'White Plains']
      },
      {
        state: 'Texas',
        cities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Plano']
      },
      {
        state: 'Washington',
        cities: ['Seattle', 'Bellevue', 'Spokane', 'Tacoma', 'Vancouver', 'Redmond']
      },
      {
        state: 'Illinois',
        cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield']
      },
      {
        state: 'Florida',
        cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg']
      },
      {
        state: 'Massachusetts',
        cities: ['Boston', 'Cambridge', 'Worcester', 'Lowell', 'Springfield']
      }
    ]
  },
  {
    country: 'United Arab Emirates',
    code: 'AE',
    states: [
      {
        state: 'Dubai',
        cities: ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Deira', 'Jumeirah Lakes Towers (JLT)', 'Al Barsha']
      },
      {
        state: 'Abu Dhabi',
        cities: ['Abu Dhabi City', 'Al Ain', 'Al Dhafra', 'Khalifa City', 'Yas Island']
      },
      {
        state: 'Sharjah',
        cities: ['Sharjah City', 'Khor Fakkan', 'Kalba', 'Al Dhaid']
      },
      {
        state: 'Ajman',
        cities: ['Ajman City', 'Masfout', 'Al Manama']
      }
    ]
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    states: [
      {
        state: 'England',
        cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Cambridge', 'Oxford']
      },
      {
        state: 'Scotland',
        cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness']
      },
      {
        state: 'Wales',
        cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham']
      },
      {
        state: 'Northern Ireland',
        cities: ['Belfast', 'Derry (Londonderry)', 'Lisburn', 'Newry']
      }
    ]
  },
  {
    country: 'Singapore',
    code: 'SG',
    states: [
      {
        state: 'Singapore Region',
        cities: ['Central Business District (CBD)', 'Marina Bay', 'Jurong', 'Changi', 'Tampines', 'Woodlands']
      }
    ]
  },
  {
    country: 'Australia',
    code: 'AU',
    states: [
      {
        state: 'New South Wales',
        cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast']
      },
      {
        state: 'Victoria',
        cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo']
      },
      {
        state: 'Queensland',
        cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns', 'Townsville']
      },
      {
        state: 'Western Australia',
        cities: ['Perth', 'Fremantle', 'Mandurah', 'Bunbury']
      }
    ]
  },
  {
    country: 'Canada',
    code: 'CA',
    states: [
      {
        state: 'Ontario',
        cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'Markham']
      },
      {
        state: 'British Columbia',
        cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna']
      },
      {
        state: 'Quebec',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil']
      },
      {
        state: 'Alberta',
        cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge']
      }
    ]
  },
  {
    country: 'Germany',
    code: 'DE',
    states: [
      {
        state: 'Bavaria',
        cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Würzburg']
      },
      {
        state: 'Berlin',
        cities: ['Berlin Central', 'Charlottenburg', 'Mitte', 'Spandau']
      },
      {
        state: 'Hesse',
        cities: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt']
      },
      {
        state: 'North Rhine-Westphalia',
        cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn']
      }
    ]
  }
];

export const COUNTRIES = LOCATION_DATA.map((c) => c.country);

export function getStatesByCountry(countryName) {
  const match = LOCATION_DATA.find((c) => c.country.toLowerCase() === (countryName || '').toLowerCase());
  return match ? match.states.map((s) => s.state) : [];
}

export function getCitiesByState(countryName, stateName) {
  const matchCountry = LOCATION_DATA.find(
    (c) => c.country.toLowerCase() === (countryName || '').toLowerCase()
  );
  if (!matchCountry) return [];

  const matchState = matchCountry.states.find(
    (s) => s.state.toLowerCase() === (stateName || '').toLowerCase()
  );
  return matchState ? matchState.cities : [];
}

