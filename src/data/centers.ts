import { LatLngExpression } from 'leaflet';
export interface IRCACenter {
  id: number;
  name: string;
  district: string;
  address: string;
  beds: number;
  phone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  services?: string[] | string;
  established?: number;
  verified?: boolean;
  type?: string;
  details?: string;
  description?: string;
  village?: string;
}

export interface Hospital {
  id: number;
  hospital: string;
  city: string;
  details: string;
  type: 'government' | 'private';
  village?: string;
}

export interface Psychiatrist {
  id: number;
  name: string;
  city: string;
  affiliation: string;
  specialty: string;
  village?: string;
}


export const districts = [
  "Bagalkot",
  "Ballari",
  "Belagavi",
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Bengaluru South",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Yadgir",
  "Vijayanagara"
];

export const services = [
  "Detoxification",
  "Medical Management",
  "Counseling",
  "Therapy",
  "Education",
  "Rehabilitation",
  "Aftercare Support",
  "Family Support",
  "Psychiatric Care",
  "Group Therapy",
  "Individual Counseling",
  "Medical Detox",
  "Rehabilitation Programs"
];

export const ircas_government: IRCACenter[] = [
  {
    id: 1,
    name: "Sri Maitri De-Addiction & Rehabilitation Centre",
    district: "Hubli",
    address: "Sri Maitri De-Addiction & Rehabilitation Centre, Hubli",
    beds: 30,
    type: "Government-Aided IRCA",
    details: "Officially registered under MSJE; offers detoxification, counseling, psychiatric care, and aftercare.",
    verified: true,
  },
  {
    id: 2,
    name: "Spandana Hospital Rehabilitation Centre",
    district: "Dharwad",
    address: "Spandana Hospital Rehabilitation Centre, Dharwad",
    beds: 25,
    type: "Government-Recognized",
    details: "Provides psychiatric and de-addiction services using a holistic care model.",
    verified: true,
  },
];

export const ircas_private: IRCACenter[] = [
  {
    id: 3,
    name: "Abhasa Rehabilitation Centre",
    district: "Hubli, Dharwad",
    address: "Abhasa Rehabilitation Centre, Hubli-Dharwad",
    beds: 50,
    services: "Drug, alcohol, and mental wellness recovery",
    description: "Luxury detox and therapy facility with yoga, emotional counseling, and 24x7 inpatient care.",
    verified: false,
  },
  {
    id: 4,
    name: "Jagruti Rehab Centre",
    district: "Dharwad",
    address: "Jagruti Rehab Centre, Dharwad",
    beds: 40,
    services: "Addiction & mental wellness",
    description: "Full residential de-addiction program with psychological and medical treatment plans.",
    verified: false,
  },
  {
    id: 5,
    name: "Samyak Mental Health Care & Rehabilitation Center",
    district: "Dharwad",
    address: "Samyak Mental Health Care & Rehabilitation Center, Dharwad",
    beds: 35,
    services: "Psychiatric & de-addiction care",
    description: "Certified psychotherapists offering long-term rehab and dual-diagnosis treatment.",
    verified: false,
  },
  {
    id: 6,
    name: "Cadabam’s Amitha",
    district: "Dharwad",
    address: "Cadabam’s Amitha, Dharwad",
    beds: 45,
    services: "Mental health and de-addiction",
    description: "Part of Cadabam Group; provides integrated de-addiction and psychiatric programs.",
    verified: false,
  },
  {
    id: 7,
    name: "Sri Maitri Association IRCA",
    district: "Ballari",
    address: "Vasudeva Naidu Street, Near Rayadurga Old Bus Stand, Ballari (Bellary), Karnataka - 583101",
    beds: 15,
    type: "Private NGO (Registered under Ministry of Social Justice & Empowerment)",
    details: "Sri Maitri Association runs government-recognized IRCA centers in several districts. They provide integrated services focused on detoxification, counseling, rehabilitation, and community awareness regarding substance abuse. Services include Detoxification, Medical Management, Individual/Group Counseling, Family Therapy, Relapse Prevention, Aftercare, Awareness Programs.",
    verified: true,
    village: "Ballari City"
  },
  {
    id: 27,
    name: "Shri Annapurna Association IRCA",
    district: "Belagavi",
    address: "Mangalwar Peth, Tilakwadi, Belagavi (Near Railway Station), Karnataka - 590006",
    beds: 15,
    type: "Private NGO (Registered under Ministry of Social Justice & Empowerment)",
    details: "Shri Annapurna Association runs government-recognized IRCA centers providing integrated services for substance abuse recovery, focusing on detox, counseling, and rehabilitation within the IRCA framework. Services include Detoxification, Medical Management, Individual/Group Counseling, Family Therapy, Relapse Prevention, Aftercare, Awareness Programs.",
    verified: true,
    village: "Tilakwadi"
  },
  {
    id: 28,
    name: "Sri Shakthi Association IRCA (Sri Shakti De-Addiction Cum Rehabilitation Centre)",
    district: "Belagavi",
    address: "Chidambar Nagar, Angol, Belagavi, Karnataka - 590006",
    beds: 15,
    type: "Private NGO (Registered under Ministry of Social Justice & Empowerment)",
    details: "Sri Shakthi Association operates this IRCA, offering comprehensive de-addiction and rehabilitation services following the government-supported model. Services include Detoxification, Medical Aid, Counseling (Individual, Group, Family), Yoga, Meditation, Relapse Prevention, Awareness programs.",
    verified: true,
    village: "Angol"
  },
  {
    id: 32,
    name: "Seva Sangama IRCA",
    district: "Bengaluru Urban",
    address: "Prashanth Nagar, Bengaluru Urban - 560079",
    beds: 15,
    type: "Private NGO (Registered under Ministry of Social Justice & Empowerment)",
    details: "Founded in 1988, Seva Sangama started its rehabilitation center in 1999, offering services based on the IRCA model for alcoholism and substance abuse. They focus on detoxification, counseling, and long-term recovery support. Services include Detoxification, Rehabilitation, 12-Step Programme, Individual/Group/Family Counseling, Yoga & Meditation, OPD services.",
    verified: true,
    village: "Prashanth Nagar"
  },
  {
    id: 33,
    name: "Association for Promoting Social Action (APSA) IRCA",
    district: "Bengaluru Urban",
    address: "Geddalahalli, Bengaluru Urban",
    beds: 15,
    type: "Private NGO (Potentially receiving government support)",
    details: "APSA is a large NGO working on various social issues, including child rights and potentially rehabilitation services. Their involvement in running a dedicated IRCA needs confirmation. Services include Detoxification, Counseling, Rehabilitation, Community Awareness.",
    verified: true,
    village: "Geddalahalli"
  },
  {
    id: 46,
    name: "Tapovanaraaj De Addiction Centre",
    district: "Davanagere",
    address: "Doddabathi, Davanagere Taluk, Davanagere District",
    beds: 60,
    type: "Private",
    details: "Tapovanaraaj offers psychiatric care combined with yoga, mindfulness, and family therapy in a rural environment near Davanagere city. It's a multi disciplinary centre under the Tapovana Group with therapy, detox, and follow up programs. Services: Alcohol and drug detox, family counselling, yoga, psychotherapy, nutritional therapy, relapse prevention, occupational training.",
    verified: true,
    village: "Doddabathi"
  },
];

export const hospitals_gov: Hospital[] = [
  {
    id: 7,
    hospital: "Karnataka Institute of Medical Sciences (KIMS)",
    city: "Hubli",
    details: "Public teaching hospital with psychiatric, toxicology, and emergency departments.",
    type: "government",
  },
  {
    id: 8,
    hospital: "Dharwad District Hospital",
    city: "Dharwad",
    details: "Major district hospital covering psychiatry, internal medicine, and de-addiction services.",
    type: "government",
  },
  {
    id: 9,
    hospital: "Dharwad Institute of Mental Health and Neurosciences (DIMHANS)",
    city: "Dharwad",
    details: "State tertiary hospital for psychiatry and addiction rehabilitation.",
    type: "government",
  },
  {
    id: 10,
    hospital: "Primary Health Centres (PHCs) Hubli & Dharwad",
    city: "Hubli/Dharwad",
    details: "Public health centers offering coordinated addiction and mental healthcare.",
    type: "government",
  },
  {
    id: 39,
    hospital: "NIMHANS - Centre for Addiction Medicine (CAM)",
    city: "Hosur Road, Bengaluru Urban",
    details: "A premier national institute. The Centre for Addiction Medicine offers comprehensive services for substance use disorders, including clinical care, training, and research. Handles complex cases and provides affordable care. Services: Outpatient and Inpatient Services, Detoxification, Pharmacotherapy, Psychosocial Interventions (Counseling, Therapy), Family Support, Community Services, Nicotine Cessation Clinic.",
    type: "government",
    village: " Hosur Road"
  },
];

export const hospitals_private: Hospital[] = [
  {
    id: 11,
    hospital: "Vithoba Memorial Hospital",
    city: "Hubli–Dharwad",
    details: "Multispecialty hospital offering psychiatry, neurology, and de-addiction services.",
    type: "private",
  },
  {
    id: 12,
    hospital: "Tatwadarsha Hospital",
    city: "Hubli",
    details: "Private hospital focused on psychiatry, neurology, and behavioral health.",
    type: "private",
  },
  {
    id: 13,
    hospital: "Dr. Nagnath Psychological Centre",
    city: "Dharwad",
    details: "Specialized in psychiatric and addiction recovery programs.",
    type: "private",
  },
  {
    id: 14,
    hospital: "Lifeline Multispeciality Hospital",
    city: "Hubli",
    details: "Offers inpatient and outpatient psychiatric evaluation.",
    type: "private",
  },
  {
    id: 15,
    hospital: "Navajeevan Neuropsychiatry & De-addiction Centre",
    city: "Navanagar, Bagalkot",
    details: "A private clinic offering integrated services for neuropsychiatric conditions and substance de-addiction. Provides counseling and treatment options. Services include Psychiatric Consultation, De-addiction Treatment, Counseling, Child Psychological Diagnosis, Tobacco De-addiction. Staff: Psychiatrists and support staff (Dr. Vishwanatha Sham Alamela associated). Contact: 08792508971. Generally positive reviews (5.0/5 on Justdial), staff noted as professional and accessible.",
    type: "private",
    village: "Navanagar"
  },
  {
    id: 16,
    hospital: "BVVS Ayurved Medical College & Hospital (De-Addiction Centre)",
    city: "Navanagar, Bagalkot",
    details: "Unit operating in Ayurvedic hospital, part of medical college, integrates Ayurveda with de-addiction. Affiliated to RGUHS, recognized by NCISM. Services: De-addiction treatment (detox, counseling, Ayurvedic protocols). Staff: Medical and specialist de-addiction staff. Contact: 08354-223280. Website: https://www.bvvsayurved.ac.in/de-addiction-centre/. Basic info available on website.",
    type: "private",
    village: "Navanagar"
  },
  {
    id: 17,
    hospital: "Manvantara Neuropsychiatry Hospital and Deaddiction Centre",
    city: "Shabadi Layout, Near Old I.B., Bagalkot",
    details: "A private hospital focused on neuropsychiatry and de-addiction, aiming to provide evidence-based treatment and compassionate care. Services: Neuropsychiatry services, De-addiction support, potentially inpatient and outpatient care. Staff: Includes psychiatrists and relevant medical/support staff. Contact: +91 8217 33 11 58. Website: https://www.manvantarahospitals.com/.",
    type: "private",
    village: "Shabadi Layout, Near Old I.B."
  },
  {
    id: 18,
    hospital: "Spandana Nursing Home & Deaddiction Centre",
    city: "Ballari City, Ballari",
    details: "A private nursing home offering psychiatric and de-addiction services. It provides both inpatient and outpatient care for substance abuse and related mental health issues. Services: Detoxification, Psychiatric Consultation, Counseling, Rehabilitation Programs. Staff: Includes psychiatrists, medical officers, counselors, and nursing staff.",
    type: "private",
    village: "Ballari City"
  },
  {
    id: 34,
    hospital: "Cadabam's Anunitha",
    city: "Kanakapura Road, Bengaluru Urban",
    details: "A specialized and often considered luxury de-addiction center offering advanced treatment programs and infrastructure. They emphasize a holistic Biopsychosocial model and have over 30 years of experience in mental healthcare. Services: Detoxification, Residential Rehabilitation, Dual Diagnosis Treatment, Counseling (Individual, Group, Family), Yoga & Meditation, Occupational Therapy, Aftercare Programs.",
    type: "private",
    village: "Kanakapura Road"
  },
  {
    id: 35,
    hospital: "Abhasa Rehabilitation Centre",
    city: "Kanakapura Road, Bengaluru Urban",
    details: "Focuses on holistic wellness and rehabilitation, integrating various therapies in a comfortable setting. Services: Medical Detox, Evidence-Based Therapies (CBT, DBT), Neurofeedback, Holistic therapies (Yoga, Art, Music, Pet therapy), Family Programs.",
    type: "private",
    village: "Kanakapura Road"
  },
  {
    id: 37,
    hospital: "Spandana Hospitals - De-addiction Services",
    city: "Mysore Road, Bengaluru Urban",
    details: "A well-known name in mental health, de-addiction, and rehabilitation with decades of experience. Offers both inpatient and outpatient services for addiction. Services: Detoxification, Rehabilitation Programs (including pharmacotherapy and psychosocial therapy), Counseling, Relapse Prevention. Uses techniques like Rapid Detox and US FDA-approved therapies.",
    type: "private",
    village: "Mysore Road"
  },
  {
    id: 41,
    hospital: "Sree Sai Freedom Foundation",
    city: "Bhudihalu Village, Nelamangala Taluk, Bengaluru Rural District",
    details: "A rehabilitation center focused on treating alcoholism and drug addiction. Provides a residential program with counseling and therapy. Services: Residential Rehabilitation, Detoxification support, Counseling (Individual, Group), Relapse Prevention.",
    type: "private",
    village: "Bhudihalu Village"
  },
  {
    id: 42,
    hospital: "Unity Foundation",
    city: "Near Himalaya Drug House Backside, Makali, Nelamangala Taluk, Bengaluru Rural District",
    details: "Offers rehabilitation services for substance abuse, providing a structured environment for recovery. Services: Residential Rehabilitation, Counseling, Support Groups.",
    type: "private",
    village: "Makali"
  },
  {
    id: 43,
    hospital: "Jeevan Deep Foundation",
    city: "Muthanallur Cross, Dommasandra, Hoskote Taluk, Bengaluru Rural District",
    details: "Provides services for de-addiction and rehabilitation. Services: Rehabilitation programs, Counseling.",
    type: "private",
    village: "Dommasandra"
  },
  {
    id: 44,
    hospital: "Brunda Foundation",
    city: "IVC Road, Bandaramanahalli, Devanahalli Taluk, Bengaluru Rural District",
    details: "A center offering support and rehabilitation for addiction. Services: Rehabilitation, Counseling.",
    type: "private",
    village: "Bandaramanahalli"
  },
  {
    id: 47,
    hospital: "Jagruti Rehabilitation Centre",
    city: "PJ Extension (Near Bapuji Hospital), Davanagere Taluk, Davanagere District",
    details: "A franchise of India's leading psychiatric rehab chain under Dr. Amar Shinde. Jagruti specializes in psychiatric, neuropsychological, and behavioural treatment with advanced mental healthcare infrastructure. Services: Medical detox, neuropsychiatric care, inpatient/outpatient programs, CBT, music therapy, addiction prevention, and family counselling.",
    type: "private",
    village: "PJ Extension (Near Bapuji Hospital)"
  },
];

export const psychiatrists: Psychiatrist[] = [
  {
    id: 15,
    name: "Dr. N.S. Mahadeva",
    city: "Hubli",
    affiliation: "KIMS",
    specialty: "Addiction medicine expert",
  },
  {
    id: 16,
    name: "Dr. Ramesh Deshpande",
    city: "Hubli",
    affiliation: "Private Clinic",
    specialty: "Clinical psychiatrist and counselor",
  },
  {
    id: 17,
    name: "Dr. Sneha Patil",
    city: "Dharwad",
    affiliation: "DIMHANS",
    specialty: "Mental health and trauma recovery",
  },
  {
    id: 18,
    name: "Dr. Ganesh Hegde",
    city: "Dharwad",
    affiliation: "Cadabam's Amitha",
    specialty: "Addiction psychiatry expert",
  },
  {
    id: 19,
    name: "Dr. Sudha Kulkarni",
    city: "Hubli",
    affiliation: "Independent / Practo Verified",
    specialty: "Psychotherapist and de-addiction consultant",
  },
  {
    id: 20,
    name: "District Hospital, Bagalkote",
    city: "Navanagar, Bagalkot",
    affiliation: "Government District Hospital",
    specialty: "General medical services, Outpatient psychiatric consultation, initial management of psychiatric emergencies",
    village: "Navanagar"
  },
  {
    id: 21,
    name: "S. Nijalingappa Medical College & H.S.K Hospital & Research Centre",
    city: "Navanagar, Bagalkot",
    affiliation: "Private Teaching Hospital",
    specialty: "Outpatient/Inpatient care, treatment for various mental disorders, child guidance, de-addiction services",
    village: "Navanagar"
  },
  {
    id: 22,
    name: "Navajeevan Neuropsychiatry & De-addiction Centre",
    city: "Nava Nagar, Bagalkot",
    affiliation: "Private Clinic",
    specialty: "Psychiatric consultation and treatment alongside de-addiction",
    village: "Navanagar"
  },
  {
    id: 23,
    name: "Manvantara Neuropsychiatry Hospital",
    city: "Shabadi Layout, Bagalkot",
    affiliation: "Private Hospital",
    specialty: "Neuropsychiatry consultation and treatment",
    village: "Shabadi Layout, Near Old I.B."
  },
  {
    id: 24,
    name: "Kerudi Hospital & Research Centre",
    city: "Station Road, Kaulpet, Badami, Bagalkote",
    affiliation: "Private Multispecialty Hospital",
    specialty: "Psychiatric Consultation, counseling and medication management",
    village: "Station Road, Kaulpet"
  },
  {
    id: 25,
    name: "Spandana Nursing Home & Deaddiction Centre",
    city: "Ballari City, Ballari",
    affiliation: "Private Nursing Home",
    specialty: "Psychiatric Consultation, Counseling, Inpatient psychiatric care, De-addiction",
    village: "Ballari City"
  },
  {
    id: 26,
    name: "Vijayanagara Institute of Medical Sciences (VIMS) - Department of Psychiatry",
    city: "Cantonment, Ballari, Karnataka - 583104",
    affiliation: "Government Teaching & Referral Hospital",
    specialty: "General Psychiatry, Child & Adolescent Psychiatry, De-addiction services, Clinical Psychology, Psychiatric Social Work, Community outreach programs, Emergency psychiatric care",
    village: "Cantonment"
  },
  {
    id: 29,
    name: "Belagavi Institute of Medical Sciences (BIMS) - Department of Psychiatry",
    city: "Dr BR Ambedkar Road, Belagavi, Karnataka - 590001",
    affiliation: "Government Teaching & Referral Hospital",
    specialty: "General Psychiatry, Child Psychiatry, De-addiction Unit, Psychological Assessments, Counseling, Community Outreach, Electroconvulsive Therapy (ECT)",
    village: "Dr BR Ambedkar Road"
  },
  {
    id: 30,
    name: "KLE Dr. Prabhakar Kore Hospital & MRC - Department of Psychiatry",
    city: "Nehru Nagar, Belagavi, Karnataka - 590010",
    affiliation: "Private Teaching & Super Speciality Hospital (part of KLE Society/University)",
    specialty: "General Psychiatry, Child and Adolescent Psychiatry, De-addiction Psychiatry, Geriatric Psychiatry, Psychotherapy, Counseling, ECT, Biofeedback, Psychological Testing",
    village: "Nehru Nagar"
  },
  {
    id: 31,
    name: "Lakeview Goaves Hospital",
    city: "Goaves, Belagavi",
    affiliation: "Private Hospital",
    specialty: "Psychiatric consultation, Counseling",
    village: "Goaves"
  },
  {
    id: 36,
    name: "Cadabam's Hospitals",
    city: "Kanakapura Road, Bengaluru Urban",
    affiliation: "Private",
    specialty: "Comprehensive psychiatric care (inpatient/outpatient), Rehabilitation, De-addiction, Geriatric care, Child & Adolescent services, Psychological therapies, ECT",
    village: "Kanakapura Road"
  },
  {
    id: 38,
    name: "Spandana Hospitals",
    city: "Mysore Road, Bengaluru Urban",
    affiliation: "Private",
    specialty: "Inpatient/Outpatient psychiatric care, De-addiction, Child Psychiatry, Geriatric Psychiatry, Counseling, ECT, Psychological Testing",
    village: "Mysore Road"
  },
  {
    id: 40,
    name: "National Institute of Mental Health and Neuro-Sciences (NIMHANS)",
    city: "Hosur Road, Bengaluru Urban",
    affiliation: "Government (Autonomous Central Government Institute)",
    specialty: "All sub-specialties of Psychiatry (Adult, Child & Adolescent, Geriatric, Addiction, Forensic, etc.), Neurology, Neurosurgery, Clinical Psychology, Psychiatric Social Work, Neurophysiology, Neuroimaging, Rehabilitation services, 24/7 Emergency services",
    village: " Hosur Road"
  },
  {
    id: 45,
    name: "District Hospital, Doddaballapura",
    city: "Doddaballapura Town, Bengaluru Rural District",
    affiliation: "Government District Hospital",
    specialty: "General medical care, basic psychiatric OPD consultation, initial management/stabilization",
    village: "Doddaballapura Town"
  },
];

// =============================================================================
// IRCA TALUKS AND CENTERS MAPPING
// =============================================================================

export interface IRCATalukCenter {
  taluk: string;
  centers: string[];
}

export const ircaTalukCenters: IRCATalukCenter[] = [
  {
    taluk: "Tumkur",
    centers: ["Abyudaya Centre for Humanity and Rural Development"]
  },
  {
    taluk: "Davangere",
    centers: ["Bhuvaneshwari association", "Sri Shakthi Association"]
  },
  {
    taluk: "Chitradurga",
    centers: ["Date Charitable Society(Chitradurga)"]
  },
  {
    taluk: "Koppal",
    centers: ["Date Charitable Society(Koppal)", "Surabee Mahila Mandali(Koppal)"]
  },
  {
    taluk: "Mandya",
    centers: ["Dhwani Institute of Rural Development(Mandya)", "River Valley Organisation for Rural Development", "Shree Akshaya Nikethana Trust"]
  },
  {
    taluk: "Shimoga",
    centers: ["Capuchin Krishak Seva Kendra", "Surabee Mahila Mandali"]
  },
  {
    taluk: "Bidar",
    centers: ["Kittur Rani Chennammamahila Mandal"]
  },
  {
    taluk: "Mangalore",
    centers: ["Link Anti Addiction Citizen's Committee", "Prajna Counselling Centre"]
  },
  {
    taluk: "Bengaluru",
    centers: ["Seva Sangama", "Eshwar Education and Welfare Society", "Sri Sai International Charitable Trust", "Sri Baba Trust and Foundation"]
  },
  {
    taluk: "Haveri",
    centers: ["Shri Annapurna Association", "Shanthi Sandesha Trust"]
  },
  {
    taluk: "Belgaum",
    centers: ["Shri Annapurna Association"]
  },
  {
    taluk: "Kolar",
    centers: ["Shri Ramana Maharishi Trust for Disabled Person"]
  },
  {
    taluk: "Puttur",
    centers: ["Society of the Sisters of St. Joseph of Tarbes"]
  },
  {
    taluk: "Dharwad",
    centers: ["Sri Maitri Association(Dharwad)"]
  },
  {
    taluk: "Bellary",
    centers: ["Sri Maitri Association(Bellary)"]
  },
  {
    taluk: "Gadag",
    centers: ["Sri Maitri Association(Gadag)"]
  },
  {
    taluk: "Chikmangalur",
    centers: ["Sri Shakthi Association", "Anikethana Samaja Kalyana Kendra"]
  },
  {
    taluk: "Kodagu",
    centers: ["Sri Shakthi Association"]
  },
  {
    taluk: "Uttara Kannada",
    centers: ["Surabee Mahila Mandali"]
  },
  {
    taluk: "Chamarajanagar",
    centers: ["Sri Rajiv Gandhi Education and Welfare Trust"]
  },
  {
    taluk: "Gulbarga",
    centers: ["Bhagya Mahila Mandal"]
  },
  {
    taluk: "Bijapur",
    centers: ["Shri Vaishnavi Rural Development Society Sindagi"]
  }
];

// IRCA Center ID mapping for navigation
export const ircaCenterIdMap: { [key: string]: string } = {
  "Sri Maitri Association IRCA": "irca_dharwad_maitri",
  "Sri Maitri De-Addiction & Rehabilitation Centre": "irca_dharwad_maitri",
  "Shri Annapurna Association IRCA": "irca_bellary_maitri",
  "Spandana Hospital Rehabilitation Centre": "irca_dharwad_maitri",
  "Seva Sangama IRCA": "irca_tumkur_achrd",
  "Association for Promoting Social Action (APSA) IRCA": "irca_tumkur_achrd",
  "Sri Shakthi Association IRCA (Sri Shakti De-Addiction Cum Rehabilitation Centre)": "irca_davangere_shakti",
  "Tapovanaraaj De Addiction Centre": "irca_davangere_bhuvaneshwari",
  "Samyak Mental Health Care & Rehabilitation Center": "irca_davangere_bhuvaneshwari",
  "Abhasa Rehabilitation Centre": "irca_davangere_bhuvaneshwari",
  "Jagruti Rehab Centre": "irca_davangere_bhuvaneshwari",
  "Cadabam's Amitha": "irca_davangere_bhuvaneshwari",
  // Legacy mappings for backward compatibility
  "Sri Maitri Association(Dharwad)": "irca_dharwad_maitri",
  "Sri Maitri Association(Bellary)": "irca_bellary_maitri",
  "Abyudaya Centre for Humanity and Rural Development": "irca_tumkur_achrd",
  "Bhuvaneshwari association": "irca_davangere_bhuvaneshwari",
  "Sri Shakthi Association": "irca_davangere_shakti",
  "Date Charitable Society(Koppal)": "irca_koppal_date",
  "Dhwani Institute of Rural Development(Mandya)": "irca_mandya_dhwani",
  "Date Charitable Society(Chitradurga)": "irca_chitradurga_date",
  "Surabee Mahila Mandali(Koppal)": "irca_koppal_surabee",
  "River Valley Organisation for Rural Development": "irca_mandya_river_valley",
  "Shree Akshaya Nikethana Trust": "irca_mandya_akshaya"
};

// =============================================================================
// FILTERING FUNCTIONS - Karnataka IRCA Platform
// =============================================================================
// Reusable functions for contextual data filtering based on user navigation path.
//
// ROUTING STRUCTURE:
// - /district/:district/taluk/:taluk/village/:village/:type/:category
// - /district/:district/taluk/:taluk/village/:village/:type
// - /district/:district/:type/:category
// - /district/:district/:type
//
// USAGE:
// filterCenters(criteria: FilterCriteria)
// - criteria.district: string (e.g., "Bagalkot")
// - criteria.taluk: string (e.g., "Bagalkot")
// - criteria.village: string (e.g., "Navanagar")
// - criteria.serviceType: 'irca' | 'hospital' | 'psychiatrist'
// - criteria.category: 'government' | 'private' | null (null for psychiatrists)
//
// RETURNS: Filtered array of centers matching the criteria
//
// EXAMPLES:
// filterCenters({district: "Bagalkot", serviceType: "hospital", category: "private"})
// → Returns private hospitals in Bagalkot District
//
// filterCenters({district: "Bagalkot", taluk: "Bagalkot", village: "Navanagar", serviceType: "hospital", category: "private"})
// → Returns private hospitals in Navanagar, Bagalkot Taluk, Bagalkot District
//
// NAVIGATION LOGIC:
// - If facility count === 1: Direct redirect to /center/{id}
// - If facility count > 1: Redirect to list page with URL parameters for filtering
// - List pages automatically filter based on URL parameters
// - State persistence: Filtered views maintain context when navigating back
//
// FILE LOCATIONS:
// - Header.tsx: Level 4 navigation logic and URL generation
// - centers.ts: filterCenters() and getCenterById() functions
// - PrivateHospitalsPage.tsx: URL parameter filtering and display
// - PsychiatristsPage.tsx: URL parameter filtering and display
// - CenterDetailPage.tsx: Universal center detail display
// =============================================================================

export interface FilterCriteria {
  district?: string;
  taluk?: string;
  village?: string;
  serviceType: 'irca' | 'hospital' | 'psychiatrist';
  category?: 'government' | 'private' | null;
}

const extractVillage = (str: string): string => {
  return str.split(',')[0].trim();
};

export const filterCenters = (criteria: FilterCriteria): any[] => {
  const { district, taluk, village, serviceType, category } = criteria;

  // === STRICT: Must have serviceType and (for irca/hospital) category ===
  if (!serviceType) return [];
  if (serviceType !== 'psychiatrist' && !category) return [];

  let results: any[] = [];

  // === IRCA: Only from ircas_government or ircas_private ===
  if (serviceType === 'irca') {
    const list = category === 'government' ? ircas_government : ircas_private;
    results = list
      .map(c => ({ ...c, village: c.village || extractVillage(c.address) }))
      .filter(c => !district || c.district === district)
      .filter(c => !village || c.village === village);
  }

  // === HOSPITAL: Only from hospitals_gov or hospitals_private ===
  else if (serviceType === 'hospital') {
    const list = category === 'government' ? hospitals_gov : hospitals_private;
    results = list
      .map(h => ({ ...h, village: h.village || extractVillage(h.city) }))
      .filter(h => !district || h.city.includes(district))
      .filter(h => !village || h.village === village);
  }

  // === PSYCHIATRIST ===
  else if (serviceType === 'psychiatrist') {
    results = psychiatrists
      .map(p => ({ ...p, village: p.village || extractVillage(p.city) }))
      .filter(p => !district || p.city.includes(district))
      .filter(p => !village || p.village === village);
  }

  return results;
};
// Helper function to get center by ID across all types
export const getCenterById = (id: number): any => {
  // Check government IRCA
  let center: any = ircas_government.find((c: IRCACenter) => c.id === id);
  if (center) return { ...center, type: 'irca', category: 'government' };

  // Check private IRCA
  center = ircas_private.find((c: IRCACenter) => c.id === id);
  if (center) return { ...center, type: 'irca', category: 'private' };

  // Check hospitals
  center = hospitals_gov.find((h: Hospital) => h.id === id);
  if (center) return { ...center, type: 'hospital', category: 'government' };

  center = hospitals_private.find((h: Hospital) => h.id === id);
  if (center) return { ...center, type: 'hospital', category: 'private' };

  // Check psychiatrists
  center = psychiatrists.find((p: Psychiatrist) => p.id === id);
  if (center) return { ...center, type: 'psychiatrist' };

  return null;
};

// Helper function to get facility count for a specific location and type
export const getFacilityCount = (district: string, taluk: string, village: string, serviceType: string, category?: string): number => {
  const criteria: FilterCriteria = {
    district,
    taluk,
    village,
    serviceType: serviceType as 'irca' | 'hospital' | 'psychiatrist',
    category: category as 'government' | 'private' | null
  };

  return filterCenters(criteria).length;
};
