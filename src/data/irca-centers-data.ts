// =============================================================================
// IRCA Centers Detailed Data
// =============================================================================
// This file contains detailed information for all IRCA centers.
// Each center has a unique ID and comprehensive details for the details page.

export interface IRCACenterDetails {
  id: string;
  title: string;
  beds: string;
  established_year: number;
  rating: number;
  location: string;
  phone: string[];
  email: string;
  overview: string;
  services: string[];
  staff: {
    name: string;
    designation: string;
    qualification: string;
  }[];
  contact: {
    operating_hours: string;
    website: string;
    helpline: string;
  };
}

export const ircaCentersDetails: IRCACenterDetails[] = [
  {
    id: "irca_dharwad_maitri",
    title: "Sri Maitri Integrated Rehabilitation Centre for Addicts (IRCA)",
    beds: "30 beds (official) / 40 beds (some sources)",
    established_year: 1998,
    rating: 3.9,
    location: "Shakthi Nagar, Bidnal Cross, PB Road, Near Igalur Shivappa Building, Hubli - 580025, Dharwad, Karnataka",
    phone: ["0836-2240446", "9535104406"],
    email: "maitrihubli@gmail.com",
    overview: "The IRCA offers 30 beds with a mission of service to humanity focusing on de-addiction and rehabilitation for those suffering from substance abuse (alcohol, drugs, tobacco, etc.) and related disorders. It provides structured inpatient/outpatient treatment, medical support, family counseling, yoga, and aftercare. Licensed under Ministry of Social Justice and Empowerment, serving the community for over 25 years.",
    services: [
      "Medical detoxification and psychiatric care",
      "Counseling (individual, family, group)",
      "Rehabilitation and occupational therapy",
      "Yoga, meditation, and wellness programs",
      "Relapse prevention and aftercare",
      "Education and community outreach",
      "Special programs for youth, women, and dual diagnosis patients"
    ],
    staff: [
      { name: "Ashok R Adavi", designation: "Project Director", qualification: "MSW" },
      { name: "Naganagoud F Mudigoudra", designation: "Counselor", qualification: "BEd, MA" },
      { name: "Irappa Baraker", designation: "Counselor", qualification: "MA" },
      { name: "Shivanagoud Patil", designation: "Counselor", qualification: "MA" },
      { name: "Mala Satagi", designation: "Nurse", qualification: "GNM" },
      { name: "Vinod G", designation: "Ward Boy", qualification: "10th" },
      { name: "Shiddalingeshwr Hugar", designation: "Social Worker", qualification: "MSW" },
      { name: "Ratnajyoti B", designation: "Accountant", qualification: "B.Com" },
      { name: "Prabhu Biradar", designation: "Doctor", qualification: "MBBS" },
      { name: "Gangadhar Kagiyavar", designation: "Ward Boy", qualification: "7th" },
      { name: "Beemakka Kagiyavar", designation: "Cook", qualification: "7th" },
      { name: "Shivanad Oli", designation: "Security", qualification: "10th" },
      { name: "Shambuling Hiremath", designation: "Nurse", qualification: "GNM" },
      { name: "Kalmesh Dundi", designation: "Security", qualification: "10th" },
      { name: "Masabbi Kanammanavar", designation: "Sweeper", qualification: "7th" },
      { name: "Makthumhussen Gamanagatti", designation: "Pre-educator", qualification: "7th" },
      { name: "Manjunathgoud Mudigoudra", designation: "Nurse", qualification: "GNM" }
    ],
    contact: {
      operating_hours: "24×7 inpatient and day hours for outpatient/counseling",
      website: "https://maitriircahubli.com",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, 24x7 helpline)"
    }
  },
  {
    id: "irca_davangere_bhuvaneshwari",
    title: "Bhuvaneshwari Association - Integrated Rehabilitation Centre for Addicts (IRCA)",
    beds: "15 beds",
    established_year: 1994,
    rating: 3.5,
    location: "Bhuvaneshwari Association, Doddibeedi (Doddibeethi), Harihar - 577601, Davanagere District, Karnataka, India",
    phone: ["08172-240226", "+91-9986408109"],
    email: "bhuvaneshwariknt@gmail.com",
    overview: "Bhuvaneshwari Association was established on 20th September 1994 as a Registered Society (Non-Government) under the Karnataka State Registration Act 1960. The organization operates an Integrated Rehabilitation Centre for Addicts (IRCA) with a 15-bed capacity, providing comprehensive de-addiction and rehabilitation services for individuals struggling with drug and alcohol addiction. The center focuses on children, health, and family welfare as its key operational areas. Medical Support: The center provides medically supervised treatment and rehabilitation services addressing substance abuse and addiction recovery. Licenses: Recognized and funded by the Ministry of Social Justice and Empowerment (MSJE), Government of India under the Central Sector Scheme for Assistance of Prevention of Alcoholism and Substance (Drugs) Abuse. Registration Details: Registration Number: S.O.R.NO.183/194/1994-95. NGO ID: KA/2009/0006930. Registered with: Registrar of Societies, Chitradurga. Achievements: Recognized by the Ministry of Social Justice and Empowerment, Government of India. Successfully operates IRCA at Hassan district under government funding. Operational area extends across Davanagere and Hassan districts in Karnataka. Received continuous government grants for de-addiction services (2013-14 to 2015-16).",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "Inpatient residential rehabilitation services (15-bed facility)",
      "Individual counseling services",
      "Family counseling and support programs",
      "Group therapy sessions",
      "Medically supervised detoxification",
      "Preventive education and awareness generation",
      "Aftercare and follow-up services",
      "Health and family welfare programs",
      "Community outreach and awareness programs",
      "Children and youth welfare services"
    ],
    staff: [
      { name: "Brahmanand", designation: "President", qualification: "Administrative Head" },
      { name: "Gajananasa", designation: "Treasurer", qualification: "Administrative Head" },
      { name: "V. Srinivasa Rao Mane", designation: "Secretary", qualification: "Administrative Head" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated. Contact center for specific operating hours.",
      website: "https://ngodetails.com/india/madhya-pradesh/bhuvaneshwari-association/",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9986408109 (for immediate assistance)"
    }
  },
  {
    id: "irca_chitradurga_date",
    title: "Date Charitable Society – (IRCA), Chitradurga",
    beds: "15 beds",
    established_year: 1998,
    rating: 4,
    location: "No. 14, 2nd Main, Near Ayyappa Swamy Temple, Vidya Nagar, Chitradurga - 577502, Karnataka, India",
    phone: ["+91-9845509861"],
    email: "date_durga@rediffmail.com",
    overview: "Date Charitable Society is a non-government organization established in 1998 and registered as a Charitable Society under the Karnataka Society Registration Act. Since its inception, the organization has served humanity with dedicated service in healthcare, energy, education, environment, and social welfare activities. The society operates two Integrated Rehabilitation Centres for Addicts (IRCA) in Chitradurga and Koppal, running efficiently for over 26 years without any hindrance. Medical Support: The center provides comprehensive medically supervised de-addiction treatment, detoxification, counseling, guidance, and rehabilitation services for individuals struggling with drug and alcohol addiction. Licenses: Registered Society: S.O.R No. 36/1998-99 (dated 15-05-1998), Recognized and sponsored by Ministry of Social Justice and Empowerment (MSJE), Government of India, New Delhi, Listed under NAPDDR (National Action Plan for Drug Demand Reduction). Achievements: Successfully treated nearly 30,000 patients (addicts) over 26+ years through treatment, counseling, and guidance, Around 10,000 addicts have turned to sobriety and are now leading good and decent lives, Conducted 100+ awareness programs on drug abuse, tobacco ill-effects, water conservation, environmental protection, HIV/AIDS, and diabetes, Organized 12 free de-addiction camps across Chitradurga District, Started an old-age day care center for dementia patients, serving nearly 240 senior citizens with nutrition, counseling, health checkups, and entertainment, Environmental initiatives include planting fruit-bearing and medicinal plants at schools and colleges in Chitradurga District to control pollution and global warming, Regularly conducts health checkup camps for senior citizens in Chitradurga and Koppal Districts.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "12 Step Program",
      "Medically supervised detoxification",
      "Individual drug addiction counseling",
      "Family counseling and family services",
      "Depression and mental health treatment",
      "Substance abuse counseling",
      "Alcoholism treatment",
      "Occupational therapy",
      "Psychotherapy and behavioral therapy",
      "Relapse prevention therapy",
      "Yoga and meditation classes",
      "Smoking cessation programs",
      "Gambling addiction treatment",
      "Sex addiction counseling",
      "Youth substance abuse treatment",
      "Residential rehabilitation programs",
      "COVID-19 safety precautions implemented",
      "Community awareness and prevention programs",
      "Health camps and HIV/AIDS awareness",
      "Environmental protection programs"
    ],
    staff: [
      { name: "Dr. H.S. Shivanna", designation: "Director/Key Official", qualification: "Medical Director" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated on website. Contact center for specific operating hours.",
      website: "www.datecharitablesociety.org",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9845509861 (for immediate assistance)"
    }
  },
  {
    id: "irca_koppal_surabee",
    title: "Surabee Mahila Mandali – (IRCA), Koppal",
    beds: "15 beds",
    established_year: 1994,
    rating: 4,
    location: "14/4, Ground and 1st Floor, IRCA Building, Near Water Tank, 1st Cross, J.H. Patil Nagar, Kinnal Road, Koppal - 583231, Karnataka, India",
    phone: ["+91-7829999111", "08182-240315"],
    email: "surabeekoppal@gmail.com",
    overview: "Surabee Mahila Mandali is a registered non-government organization established on 21st September 1994 to work in the fields of children, vocational training, women's development & empowerment, and other social welfare activities. The organization operates Integrated Rehabilitation Centres for Addicts (IRCA) in multiple districts including Gadag, Koppal, Shimoga, and Uttara Kannada. The Koppal IRCA operates with 15 beds, providing comprehensive de-addiction and rehabilitation services under the National Action Plan for Drug Demand Reduction (NAPDDR). Medical Support: The center provides medically supervised detoxification, comprehensive counseling, psychotherapy, and rehabilitation services for individuals struggling with drug and alcohol addiction. Licenses: Registered Society: S.O.R No. 186/1994-95 (dated 21-09-1994), NGO ID: KA/2014/0074274, Recognized and funded by Ministry of Social Justice and Empowerment (MSJE), Government of India, Listed under NAPDDR (National Action Plan for Drug Demand Reduction). Operational Areas: The organization operates across multiple districts in Karnataka including Gadag, Koppal, Shimoga, and Uttara Kannada. Additional Programs: Surabee Mahila Mandali also operates a Senior Citizen Home (Swadhara Greh) for 50 inmates under National Action Plan for Senior Citizen (NAPSrC) at Olekar Building, Kuvempu Nagar, Hoovinal Road, Koppal. Achievements: Successfully operating IRCA services for over 30 years (since 1994), Recognized by Ministry of Social Justice and Empowerment, Government of India, Multi-district operations across Gadag, Koppal, Shimoga, and Uttara Kannada, Active community outreach and prevention programs, Senior citizen care and rehabilitation services.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "12 Step Program",
      "Medically supervised detoxification",
      "Depression and mental health treatment",
      "Alcoholism treatment",
      "Drug addiction counseling",
      "Individual and family counseling",
      "Family services and support programs",
      "Substance abuse counseling",
      "Occupational therapy",
      "Psychotherapy and behavioral therapy",
      "Relapse prevention programs",
      "Yoga and meditation classes",
      "Smoking cessation programs",
      "Gambling addiction treatment",
      "Sex addiction counseling",
      "Youth substance abuse treatment",
      "Residential rehabilitation services",
      "COVID-19 safety precautions implemented",
      "Community prevention and awareness programs"
    ],
    staff: [
      { name: "Sheela Patil", designation: "Key Official/Administrative", qualification: "Administrative Head" },
      { name: "Nirmala V.S.", designation: "Superintendent (Senior Citizen Home, Koppal)", qualification: "Social Work" },
      { name: "Dr. Muttappa Kamate", designation: "Medical Officer", qualification: "Medical Doctor" },
      { name: "Bhairavi", designation: "Social Worker", qualification: "Social Work" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated. Contact center for specific operating hours.",
      website: "Not Available",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-7829999111 (for immediate assistance)"
    }
  },
  {
    id: "irca_mandya_river_valley",
    title: "River Valley Organisation for Rural Development – (IRCA)",
    beds: "15 beds",
    established_year: 1994,
    rating: 4.2,
    location: "River Valley Organisation for Rural Development, Mandya District, Karnataka, India",
    phone: ["+91-9448494414"],
    email: "dhwani94ccc@yahoo.in",
    overview: "River Valley Organisation for Rural Development is a registered society working in the field of rural development and rehabilitation services. The organization operates an Integrated Rehabilitation Centre for Addicts (IRCA) with 15 beds, providing comprehensive de-addiction and rehabilitation services under the National Action Plan for Drug Demand Reduction (NAPDDR). The center focuses on holistic recovery and community reintegration for individuals struggling with substance abuse.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "Individual counseling services",
      "Family counseling and support programs",
      "Group therapy sessions",
      "Medically supervised detoxification",
      "Relapse prevention programs",
      "Community outreach and awareness programs",
      "Rural development initiatives"
    ],
    staff: [
      { name: "River Valley Organisation Administration", designation: "Administrative Team", qualification: "NGO Management" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated. Contact center for specific operating hours.",
      website: "Not Available",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9448494414 (for immediate assistance)"
    }
  },
  {
    id: "irca_mandya_akshaya",
    title: "Shree Akshaya Nikethana Trust – (IRCA)",
    beds: "15 beds",
    established_year: 1994,
    rating: 4.1,
    location: "Shree Akshaya Nikethana Trust, Mandya District, Karnataka, India",
    phone: ["+91-9448494414"],
    email: "dhwani94ccc@yahoo.in",
    overview: "Shree Akshaya Nikethana Trust is a registered trust dedicated to social welfare and rehabilitation services. The trust operates an Integrated Rehabilitation Centre for Addicts (IRCA) with 15 beds, providing comprehensive de-addiction and rehabilitation services under the National Action Plan for Drug Demand Reduction (NAPDDR). The center emphasizes spiritual and psychological healing alongside medical treatment for individuals struggling with substance abuse.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "Spiritual and psychological counseling",
      "Individual counseling services",
      "Family counseling and support programs",
      "Group therapy sessions",
      "Medically supervised detoxification",
      "Relapse prevention programs",
      "Community outreach and awareness programs",
      "Spiritual healing programs"
    ],
    staff: [
      { name: "Shree Akshaya Nikethana Trust Administration", designation: "Administrative Team", qualification: "Trust Management" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated. Contact center for specific operating hours.",
      website: "Not Available",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9448494414 (for immediate assistance)"
    }
  },
  {
    id: "irca_mandya_dhwani",
    title: "Dhwani Institute for Rural Development – (IRCA)",
    beds: "15 beds",
    established_year: 1994,
    rating: 4,
    location: "#3584, 1st & 2nd Building, Sihineerukola Colony, Sihineerukola Street, Near Hollalu Circle, Behind KSRTC Bus Stand, Mandya - 571401, Karnataka, India",
    phone: ["08234-285450", "+91-9448494414", "+91-9449301105"],
    email: "dhwani94ccc@yahoo.in",
    overview: "Dhwani Institute for Rural Development (DIRD) was established on 28th June 1994 as a registered society under the Karnataka Society Registration Act, 1960. The organization operates an Integrated Rehabilitation Centre for Addicts (IRCA) with 15 beds, providing comprehensive de-addiction and rehabilitation services under the National Action Plan for Drug Demand Reduction (NAPDDR). The institute works across multiple sectors including health & family welfare, HIV/AIDS awareness, education & literacy, rural development, vocational training, and children's welfare. Medical Support: The center provides medically supervised detoxification, comprehensive counseling, psychotherapy, and rehabilitation services for individuals struggling with drug and alcohol addiction. Licenses: Registered Society: S.O.R No. 41/94-95 (dated 28-06-1994), NGO ID: KA/2013/0069504, Recognized and funded by Ministry of Social Justice and Empowerment (MSJE), Government of India, Listed under NAPDDR (National Action Plan for Drug Demand Reduction). Operational Areas: The organization operates across multiple districts in Karnataka including Bangalore, Bangalore Rural, Dakshina Kannada, Gadag, Mandya, and Mysore. Achievements: Successfully operating IRCA services for over 30 years (since 1994), Recognized by Ministry of Social Justice and Empowerment, Government of India, Comprehensive community outreach programs focusing on drug abuse prevention and awareness, Active involvement in HIV/AIDS awareness programs, Provides services to both urban and rural populations across Mandya district, Engaged in multiple social welfare activities including health, education, environment, and rural development.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "12 Step Program",
      "Alcoholism treatment and support",
      "Medically supervised detoxification",
      "Depression and mental health treatment",
      "Individual drug addiction counseling",
      "Family counseling and family services",
      "Group therapy sessions",
      "Gambling addiction treatment",
      "Sex addiction counseling",
      "Psychotherapy and behavioral therapy",
      "Occupational therapy",
      "Relapse prevention programs",
      "Residential rehabilitation services",
      "Yoga and meditation classes",
      "Smoking cessation programs",
      "Youth substance abuse treatment",
      "Substance abuse counseling",
      "COVID-19 safety precautions implemented",
      "Prevention and awareness programs",
      "Community outreach and education"
    ],
    staff: [
      { name: "Nagannagowda K", designation: "Director/Key Official", qualification: "Administrative Head" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated. Contact center for specific operating hours.",
      website: "www.dhwaniirca.org",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9448494414, +91-9449301105 (for immediate assistance)"
    }
  },
  {
    id: "irca_koppal_date",
    title: "Date Charitable Society – (IRCA), Koppal",
    beds: "15 beds",
    established_year: 1998,
    rating: 3.8,
    location: "No. 91/8, Mudhugal Amaramma Complex, Near NKPM School, Kustagi Road, Koppal, Karnataka",
    phone: ["+91-9845509861"],
    email: "date_durga@rediffmail.com",
    overview: "Date Charitable Society is a non-government organization registered under the Ministry of Social Justice and Empowerment, Government of India. Since its establishment in 1998, the organization has been serving humanity with dedicated service in the fields of healthcare, energy, education, environment, and social welfare activities. The society operates two Integrated Rehabilitation Centres for Addicts (IRCA) in Chitradurga and Koppal, running efficiently for over 16 years without any hindrance. Medical Support: The center provides comprehensive medically supervised de-addiction treatment, counseling, guidance, and rehabilitation services for individuals struggling with drug and alcohol addiction. Licenses: Registered Society: S.O.R No. 36/1998-99, Recognized and sponsored by Ministry of Social Justice and Empowerment (MSJE), Government of India, New Delhi, Listed under NAPDDR (National Action Plan for Drug Demand Reduction). Achievements: Successfully treated nearly 30,000 patients (addicts) over 16+ years through treatment, counseling, and guidance, Around 10,000 addicts have turned to sobriety and are now leading good and decent lives, Conducted 100+ awareness programs on drug abuse, tobacco ill-effects, water conservation, environmental protection, HIV/AIDS, and diabetes, Organized 12 free de-addiction camps across the district, Started an old-age day care center for dementia patients at Koppal, serving nearly 240 senior citizens with nutrition, counseling, health checkups, and entertainment, Environmental initiatives include planting fruit-bearing and medicinal plants at schools and colleges in Chitradurga District to control pollution and global warming, Regularly conducts health checkup camps for senior citizens in Chitradurga and Koppal Districts.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "12 Step Program",
      "AA & NA (Alcoholics Anonymous & Narcotics Anonymous) Meetings",
      "Medically supervised detoxification",
      "Individual counseling services",
      "Family counseling and family services",
      "Substance abuse counseling",
      "Depression treatment and mental health support",
      "Residential rehabilitation programs",
      "Out-patient services",
      "Relapse prevention therapy",
      "Occupational therapy",
      "Yoga and meditation classes",
      "Smoking cessation programs",
      "Youth substance abuse treatment",
      "Corporate programs",
      "Free treatment programs (Nasha Mukti Kendra)",
      "Community awareness and prevention programs",
      "Health camps and HIV/AIDS awareness",
      "Environmental protection programs"
    ],
    staff: [
      { name: "Date Charitable Society Administration", designation: "Administrative Team", qualification: "NGO Management" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated on website. Contact center for specific operating hours.",
      website: "datecharitablesociety.org",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9845509861 (for immediate assistance)"
    }
  },
  {
    id: "irca_davangere_shakti",
    title: "Sri Shakthi Association – Tapovana (IRCA)",
    beds: "15 beds",
    established_year: 2008,
    rating: 4.4,
    location: "Tapovana IRCA, Sugar Factory Road, Doddabathi, Davangere – 577566, Karnataka, India",
    phone: ["+91-9845137157", "+91-9449163187", "08192-262001"],
    email: "srishakthingo@gmail.com",
    overview: "Sri Shakthi Association's Tapovana IRCA at Davangere is a recognized non-profit de-addiction and rehabilitation project affiliated with the Ministry of Social Justice & Empowerment, Government of India. The center provides holistic, community-based treatment for drug and alcohol dependency and emphasizes inclusive social reintegration. The IRCA's mission underscores health advocacy, rehabilitation, and addiction awareness among marginalized communities in Davangere and the region. Medical Support: Medically supervised detoxification, Continuous psychiatric care, Comprehensive interventions (medical, psychosocial, familial, and vocational) for substance use recovery. Licenses: Sponsored & recognized by the Ministry of Social Justice & Empowerment (MSJE), Government of India, Registered Society: No. DR/90/95-96, Registered under NAPDDR as an IRCA. Achievements: Hundreds of patients treated annually since 2008 at the Davangere IRCA, Recognized for post-treatment family support and community outreach, Active partner in major national health campaigns (pulse polio, Swachh Bharat, etc.), Leading awareness drives, vocational guidance, and reintegration support for vulnerable populations.",
    services: [
      "Comprehensive alcohol and drug de-addiction treatment programs",
      "Medically monitored inpatient detoxification",
      "Individual and family counseling",
      "Group therapy and peer support meetings",
      "Psychiatric evaluation and management for co-occurring disorders",
      "Relapse prevention and aftercare planning",
      "Yoga, meditation, and wellness activities",
      "Skill development, vocational rehabilitation, and community reintegration",
      "Outreach, prevention, and educational programs",
      "Psychiatric and social work consultations"
    ],
    staff: [
      { name: "Dr. M S Keshavamurthy", designation: "Secretary/Director", qualification: "Medical Director" },
      { name: "Mr. H C Nagaraj", designation: "President/Chairman", qualification: "Administrative Head" }
    ],
    contact: {
      operating_hours: "Monday to Saturday: 9:00 AM – 6:00 PM, Sunday: Emergency/On-Call Service Only",
      website: "www.srishakthi.org",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7), Center Direct Contact: +91-9845137157"
    }
  },
  {
    id: "irca_bellary_maitri",
    title: "Sri Maitri Integrated Rehabilitation Centre for Addicts (IRCA)",
    beds: "15 beds",
    established_year: 1992,
    rating: 4.5,
    location: "156, Ground and First Floor, 1st Cross, Opposite Sadhana Yoga Center, Basaveshwara Nagar, Nehru Colony IV Cross, Post Office Road, Ballari - 583103, Karnataka, India",
    phone: ["+91-9902217268", "+91-9036258143"],
    email: "Maitribellary@gmail.com",
    overview: "Sri Maitri Integrated Rehabilitation Centre for Addicts is a comprehensive treatment facility in Ballari that has been working in the field of drug abuse prevention for over 14 years. The center is part of Sri Maitri Association, a registered voluntary organization under the Ministry of Social Justice and Empowerment, Government of India, with Registration Number: SOR NO 40/92-93. Operating with 15 beds, the center provides both inpatient and outpatient treatment services for individuals struggling with drug and alcohol addiction. Medical Support: The center offers medically supervised detoxification, psychiatric care, and comprehensive interventions addressing medical, psychological, familial, social, and vocational aspects of substance abuse. Licenses: Sri Maitri is recognized by the Ministry of Social Justice and Empowerment (MSJE), Government of India, and listed under IRCA (Integrated Rehabilitation Centre for Addicts) program. Registration Number: KA/2009/0010647. Achievements: Successfully treated over 3,000 patients over more than 10 years. Working towards a drug-free world through comprehensive rehabilitation programs. Recognized by the Government of India under NAPDDR (National Action Plan for Drug Demand Reduction). Conducts mass awareness programs throughout Ballari district. Provides after-care and follow-up services for hundreds of outpatients and inpatients annually.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "Medically supervised detoxification with 24-hour supervision",
      "Individual counseling services",
      "Family counseling and family therapy programs",
      "Group therapy sessions",
      "Pre-counseling and post-counseling services",
      "Psychiatric and psychological support for co-occurring disorders",
      "Dual diagnostic facilities for patients requiring psychiatric care",
      "Yoga and meditation classes",
      "Occupational therapy",
      "Relapse prevention therapy",
      "Recreational activities and re-educative lectures",
      "Vocational training and rehabilitation programs",
      "Community outreach and mass awareness programs",
      "Mental health treatment for depression and other conditions",
      "Alternative techniques including biofeedback, electrosleep, and acupuncture"
    ],
    staff: [
      { name: "Dr. Shankar Patil B.G.", designation: "Chief Functionary & Secretary", qualification: "Sri Maitri Association" },
      { name: "Smt. Meenakshamma (B.G. Meenakshamma)", designation: "Chairman/President", qualification: "Sri Maitri Association" }
    ],
    contact: {
      operating_hours: "Information not explicitly stated on website. Contact center for specific operating hours.",
      website: "maitriircabellary.com",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9902217268, +91-9036258143 (for immediate assistance)"
    }
  },
  {
    id: "irca_tumkur_achrd",
    title: "Abyudaya Centre for Humanity and Rural Development (ACHRD) Integrated Rehabilitation Centre for Addicts (IRCA)",
    beds: "30 beds",
    established_year: 1995,
    rating: 4.6,
    location: "3rd Main Road, Ashoka Nagar, Opposite Tumkur University/Dhobhi Ghat, Tumkur - 572102, Karnataka, India",
    phone: ["+91-816-2279463", "+91-9845296471"],
    email: "achrd.tumkur@gmail.com",
    overview: "ACHRD Integrated Rehabilitation Centre for Addicts was established in 1995 with a vision to create communities free from alcohol and substance abuse while advocating for social justice. The center operates with 30-50 beds and provides comprehensive treatment and rehabilitation services for individuals struggling with drug and alcohol addiction. Over the past 25+ years, ACHRD has successfully treated over 12,500 beneficiaries with a success rate of nearly 80%. Medical Support: The center offers medically supervised detoxification, psychiatric care, and comprehensive interventions addressing medical, psychological, familial, social, and vocational aspects of substance abuse. Licenses: ACHRD is recognized and sponsored by the Ministry of Social Justice and Empowerment (MSJE), Government of India. Registration Number: SOC 308/94-95 (dated 06-01-1995). Achievements: Successfully treated over 12,500 beneficiaries over 25+ years with an 80% success rate. Recognized by the Ministry of Social Justice and Empowerment, Government of India. Extended services to both urban and rural areas through numerous health camps. Actively participates in social awareness programs including HIV/AIDS awareness (since 2001 with NACO support), pulse polio immunization, Swachh Bharat Abhiyan, and environmental pollution initiatives.",
    services: [
      "Comprehensive drug and alcohol de-addiction treatment",
      "Individual counseling services",
      "Family counseling and family programs",
      "Group therapy sessions",
      "Psychiatric and psychological support for co-occurring disorders",
      "Medically supervised detoxification",
      "Yoga and meditation classes",
      "Vocational training and skill development programs",
      "Relapse prevention and aftercare support",
      "Community outreach and awareness programs",
      "Mental health counseling"
    ],
    staff: [
      { name: "Dr. Sadashivaiah H. G.", designation: "Director", qualification: "Medical Director" },
      { name: "Smt. Mala Sadashivaiah", designation: "Secretary", qualification: "Administrative Head" }
    ],
    contact: {
      operating_hours: "Monday to Friday: 9:00 AM - 6:00 PM (IST), Saturday: 9:00 AM - 2:00 PM (IST), Closed on Sundays and Public Holidays",
      website: "https://achrd.in",
      helpline: "14446 (Nasha Mukt Bharat Abhiyaan, available 24x7 for addiction emergencies and support across India), Center Direct Contact: +91-9845296471 (for immediate assistance)"
    }
  }
  // Add more IRCA centers here as needed
];

// Helper function to get center details by ID
export const getIrcaCenterById = (id: string): IRCACenterDetails | undefined => {
  return ircaCentersDetails.find(center => center.id === id);
};

// Helper function to get all IRCA center IDs for routing
export const getAllIrcaCenterIds = (): string[] => {
  return ircaCentersDetails.map(center => center.id);
};