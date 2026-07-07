// =============================================================================
// Karnataka IRCA Centers - Data Structure Documentation
// =============================================================================
//
// This file contains the complete hierarchical data structure for Karnataka's
// healthcare facilities, organized by administrative divisions.
//
// DATA HIERARCHY:
// Karnataka State
// ├── District (31 districts)
// │   ├── Taluka (sub-districts within each district)
// │   │   └── Village (settlements with facility counts)
// │   │       ├── Government IRCA Centers (count)
// │   │       ├── Private IRCA Centers (count)
// │   │       ├── Government Hospitals (count)
// │   │       ├── Private Hospitals (count)
// │   │       └── Psychiatrists (count)
//
// USAGE:
// - Data drives the multi-level dropdown navigation in Header.tsx
// - Facility counts determine which services are displayed (green if > 0)
// - Structure supports dynamic updates from APIs or databases
// - Helper functions provide easy access to nested data
//
// VISUAL MAPPING:
// - Green badges/counts: Available services (> 0 facilities)
// - Grey styling: Unavailable services (= 0 facilities)
// - Hover navigation: Cascading menus expand rightward
// - Click navigation: Routes to filtered detail pages with URL params
//
// =============================================================================

/**
 * Karnataka Districts, Talukas, and Villages with Facility Counts
 *
 * This data structure powers the entire district-based navigation system.
 * Each village contains real-time counts of available healthcare facilities.
 */
export interface VillageFacilityCounts {
  governmentIRCA: number;
  privateIRCA: number;
  governmentHospital: number;
  privateHospital: number;
  psychiatrist: number;
}

export interface Village {
  name: string;
  facilities: VillageFacilityCounts;
}

export interface Taluka {
  name: string;
  villages: Village[];
}

export interface District {
  name: string;
  talukas: Taluka[];
}

// Sample data structure - In a real application, this would be populated from a database
// For now, we'll create a basic structure with some sample data
export const karnatakaDistricts: District[] = [
  {
    name: "Bagalkot",
    talukas: [
      {
        name: "Bagalkot",
        villages: [
          {
            name: "Navanagar",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 2, psychiatrist: 2 }
          },
          {
            name: "Shabadi Layout, Near Old I.B.",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Badami",
        villages: [
          {
            name: "Station Road, Kaulpet",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Ballari",
    talukas: [
      {
        name: "Ballari",
        villages: [
          {
            name: "Ballari City",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Cantonment",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Belagavi",
    talukas: [
      {
        name: "Belagavi",
        villages: [
          {
            name: "Tilakwadi",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Angol",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Dr BR Ambedkar Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "Nehru Nagar",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "Goaves",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Bengaluru Urban",
    talukas: [
      {
        name: "Bengaluru North",
        villages: [
          {
            name: "Prashanth Nagar",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Bengaluru South",
        villages: [
          {
            name: "Geddalahalli",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Kanakapura Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 2, psychiatrist: 1 }
          },
          {
            name: "Mysore Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Anekal",
        villages: [
          {
            name: " Hosur Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Bengaluru Rural",
    talukas: [
      {
        name: "Nelamangala",
        villages: [
          {
            name: "Bhudihalu Village",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Makali",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Hoskote",
        villages: [
          {
            name: "Dommasandra",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Devanahalli",
        villages: [
          {
            name: "Bandaramanahalli",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Doddaballapura",
        villages: [
          {
            name: "Doddaballapura Town",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Bengaluru South",
    talukas: [
      {
        name: "Bengaluru South ",
        villages: [
          {
            name: "JP Nagar",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 1, psychiatrist: 1 }
          },
          {
            name: "Hosur Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "Rajajinagar",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Bidar",
    talukas: [
      {
        name: "Bidar",
        villages: [
          {
            name: "Bidar City",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 2, privateHospital: 2, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Bhalki",
        villages: [
          {
            name: "Bhalki",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Basavakalyan",
        villages: [
          {
            name: "Basavakalyan",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Humnabad",
        villages: [
          {
            name: "Humnabad",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Aurad",
        villages: [
          {
            name: "Aurad",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Chamarajanagar",
    talukas: [
      {
        name: "Chamarajanagar",
        villages: [
          {
            name: "Chamarajanagar",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Gundlupet",
        villages: [
          {
            name: "Gundlupet",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Kollegala",
        villages: [
          {
            name: "Kollegala",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Yelandur",
        villages: [
          {
            name: "Yelandur",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Hanur",
        villages: [
          {
            name: "Hanur",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Chikkaballapur",
    talukas: [
      {
        name: "Chikkaballapur",
        villages: [
          {
            name: "Chikkaballapur",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 2, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Gauribidanur",
        villages: [
          {
            name: "Gauribidanur",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Bagepalli",
        villages: [
          {
            name: "Bagepalli",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Gudibanda",
        villages: [
          {
            name: "Gudibanda",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Sidlaghatta",
        villages: [
          {
            name: "Sidlaghatta",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Chikkamagaluru",
    talukas: [
      {
        name: "Chikkamagaluru",
        villages: [
          {
            name: "Chikkamagaluru",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 2, privateHospital: 2, psychiatrist: 2 }
          }
        ]
      },
      {
        name: "Mudigere",
        villages: [
          {
            name: "Mudigere",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Tarikere",
        villages: [
          {
            name: "Tarikere",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Ajjampura",
        villages: [
          {
            name: "Ajjampura",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Kadur",
        villages: [
          {
            name: "Kadur",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Chitradurga",
    talukas: [
      {
        name: "Chitradurga",
        villages: [
          {
            name: "Chitradurga",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Holalkere",
        villages: [
          {
            name: "Holalkere",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Hiriyur",
        villages: [
          {
            name: "Hiriyur",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Challakere",
        villages: [
          {
            name: "Challakere",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Hosadurga",
        villages: [
          {
            name: "Hosadurga",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Dakshina Kannada",
    talukas: [
      {
        name: "Mangaluru",
        villages: [
          {
            name: "Mangalore City",
            facilities: { governmentIRCA: 2, privateIRCA: 3, governmentHospital: 4, privateHospital: 6, psychiatrist: 4 }
          }
        ]
      },
      {
        name: "Puttur",
        villages: [
          {
            name: "Puttur",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 2, privateHospital: 2, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Bantwal",
        villages: [
          {
            name: "Bantwal",
            facilities: { governmentIRCA: 1, privateIRCA: 2, governmentHospital: 1, privateHospital: 3, psychiatrist: 2 }
          }
        ]
      },
      {
        name: "Belthangadi",
        villages: [
          {
            name: "Belthangadi",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 1, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Sullia",
        villages: [
          {
            name: "Sullia",
            facilities: { governmentIRCA: 1, privateIRCA: 1, governmentHospital: 1, privateHospital: 2, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Davanagere",
    talukas: [
      {
        name: "Davanagere",
        villages: [
          {
            name: "Doddabathi",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "PJ Extension (Near Bapuji Hospital)",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Shamanur Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "MCC “B” Block, PB Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Gundi Circle",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Harihara",
        villages: [
          {
            name: "Harihara Town",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Dharwad",
    talukas: [
      {
        name: "Dharwad",
        villages: [
          {
            name: "Saptapur",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Belgaum Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "PB Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Hubballi",
        villages: [
          {
            name: "Shakti Nagar(Near Bidnal Cross)",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Gokul Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Vidyanagar",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Gadag",
    talukas: [
      {
        name: "Gadag",
        villages: [
          {
            name: "Betgeri",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Tanga Koot",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Gadag City (District Hospital Campus)",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 2 }
          }
        ]
      }
    ]
  },
  {
    name: "Hassan",
    talukas: [
      {
        name: "Hassan",
        villages: [
          {
            name: "Kattihalli",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Shankar Mutt Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Vidyanagar, Hassan City",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Hassan City",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "Salagame Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Belur",
        villages: [
          {
            name: "Arehalli",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Haveri",
    talukas: [
      {
        name: "Haveri",
        villages: [
          {
            name: "Ashwini Nagar",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "M.M. Circle",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Hosur Cross",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "Shivalingeshwar Nagar, PB Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Savanur",
        villages: [
          {
            name: "Huvinshigli",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Kalaburagi",
    talukas: [
      {
        name: "Kalaburagi City",
        villages: [
          {
            name: "Udnoor Road (Yashwant Nagar)",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Court Area",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Sedam Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Kodagu",
    talukas: [
      {
        name: "Madikeri",
        villages: [
          {
            name: "Near LIC Office",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Field Marshal Cariappa College Campus",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Kolar",
    talukas: [
      {
        name: "Kolar",
        villages: [
          {
            name: "Parandahalli",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Kolar City",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Koppal",
    talukas: [
      {
        name: "Koppal",
        villages: [
          {
            name: "Kennal Road",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Bhagyanagar",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Market Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Mandya",
    talukas: [
      {
        name: "Mandya",
        villages: [
          {
            name: "Hollalu Circle",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Mandya City",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      },
      {
        name: "Srirangapatna",
        villages: [
          {
            name: "Cauvery Extension",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Mysuru",
    talukas: [
      {
        name: "Mysuru",
        villages: [
          {
            name: "Madahalli",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Srirampura Village, Kasaba Hobli",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Ramanahalli",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Kuvempunagara North, TK Layout",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Devaraja Mohalla",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          },
          {
            name: "Siddarthalayout",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Raichur",
    talukas: [
      {
        name: "Raichur city",
        villages: [
          {
            name: "Basavanagar",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 1 }
          },
          {
            name: "Mantralaya Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Lingasur Road",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Androon Quilla",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Gandhi Chowk",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Shivamogga",
    talukas: [
      {
        name: "Bhadravathi",
        villages: [
          {
            name: "Shivamogga",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      },
      {
        name: "Shimoga",
        villages: [
          {
            name: "Shivamogga City",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 3, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Tumakuru",
    talukas: [
      {
        name: "Tumakuru",
        villages: [
          {
            name: "SS Puram",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Tumkur",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Udupi",
    talukas: [
      {
        name: "Udupi",
        villages: [
          {
            name: "Chitrapady Post",
            facilities: { governmentIRCA: 0, privateIRCA: 1, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Udupi",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 0 }
          },
          {
            name: "Manipal",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 1 }
          }
        ]
      }
    ]
  },
  {
    name: "Uttara Kannada",
    talukas: [
      {
        name: "Karwar",
        villages: [
          {
            name: "Near District Hospital",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 0, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "District HQ",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          },
          {
            name: "Karwar City",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 0, privateHospital: 1, psychiatrist: 2 }
          }
        ]
      },
      {
        name: "Sirsi",
        villages: [
          {
            name: "sirsi",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Vijayapura",
    talukas: [
      {
        name: "Vijayapura",
        villages: [
          {
            name: "Vijayapura City",
            facilities: { governmentIRCA: 1, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Yadgir",
    talukas: [
      {
        name: "Yadgir",
        villages: [
          {
            name: "Yadgir",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 0, psychiatrist: 0 }
          }
        ]
      }
    ]
  },
  {
    name: "Vijayanagara",
    talukas: [
      {
        name: "Hosapete",
        villages: [
          {
            name: "Hosapete",
            facilities: { governmentIRCA: 0, privateIRCA: 0, governmentHospital: 1, privateHospital: 1, psychiatrist: 2 }
          }
        ]
      }
    ]
  }
];

// =============================================================================
// Helper Functions - Data Access Layer
// =============================================================================

/**
 * Get all district names for dropdown population
 * @returns Array of district names
 */
export const getDistrictNames = (): string[] => {
  return karnatakaDistricts.map(district => district.name);
};

/**
 * Get talukas for a specific district
 * @param districtName - Name of the district
 * @returns Array of talukas or empty array if district not found
 */
export const getTalukasForDistrict = (districtName: string): Taluka[] => {
  const district = karnatakaDistricts.find(d => d.name === districtName);
  return district ? district.talukas : [];
};

/**
 * Get villages for a specific taluka within a district
 * @param districtName - Name of the district
 * @param talukaName - Name of the taluka
 * @returns Array of villages or empty array if not found
 */
export const getVillagesForTaluka = (districtName: string, talukaName: string): Village[] => {
  const taluka = getTalukasForDistrict(districtName).find(t => t.name === talukaName);
  return taluka ? taluka.villages : [];
};

/**
 * Check if a village has any healthcare facilities
 * Used to filter villages in dropdown navigation
 * @param village - Village object to check
 * @returns True if village has at least one facility type
 */
export const hasFacilities = (village: Village): boolean => {
  return (
    village.facilities.governmentIRCA > 0 ||
    village.facilities.privateIRCA > 0 ||
    village.facilities.governmentHospital > 0 ||
    village.facilities.privateHospital > 0 ||
    village.facilities.psychiatrist > 0
  );
};

// =============================================================================
// Future API Integration Points
// =============================================================================

/**
 * TODO: Implement API integration for dynamic data loading
 *
 * Example API endpoints:
 * - GET /api/districts - Fetch all districts
 * - GET /api/districts/{name}/talukas - Fetch talukas for district
 * - GET /api/talukas/{name}/villages - Fetch villages with facility counts
 * - POST /api/facilities/search - Search facilities by location and type
 *
 * Data flow:
 * 1. Load districts on app initialization
 * 2. Lazy-load talukas on district hover
 * 3. Lazy-load villages on taluka hover
 * 4. Cache data to improve performance
 * 5. Handle loading states and error conditions
 */

// =============================================================================