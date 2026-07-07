/**
 * ============================================================================
 * Supabase Service Layer - IRCA Platform Mobile
 * ============================================================================
 * This service provides all data fetching functions for the IRCA Platform
 * Replaces static imports with dynamic Supabase queries
 * ============================================================================
 */

import { supabase } from '../lib/supabaseClient';

// ============================================================================
// Type Definitions (matching existing interfaces)
// ============================================================================

export interface IRCACenter {
  id: string;
  center_id?: string;
  name: string;
  district: string;
  address: string;
  beds: number;
  phone?: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
  services?: string[];
  established?: number;
  verified?: boolean;
  type?: string;
  details?: string;
  description?: string;
  village?: string;
  taluk?: string;
  category?: 'government' | 'private';
}

export interface Hospital {
  id: string;
  hospital: string;
  city: string;
  details: string;
  type: 'government' | 'private';
  village?: string;
}

export interface Psychiatrist {
  id: string;
  name: string;
  city: string;
  affiliation: string;
  specialty: string;
  village?: string;
}

export interface IRCACenterDetails {
  id: string;
  center_id: string;
  title: string;
  beds: string;
  established_year: string | number;
  rating: string | number;
  location: string;
  phone: string[];
  email: string;
  overview: string;
  services: string[];
  staff: any; // Can be JSON object or Array
  contact: any; // Can be JSON object
  created_at?: string;
  updated_at?: string;
  images?: string[];
}

export interface VillageFacilityCounts {
  governmentIRCA: number;
  privateIRCA: number;
  governmentHospital: number;
  privateHospital: number;
  psychiatrist: number;
}

export interface Village {
  id: string;
  name: string;
  taluka_id: string;
  facilities: VillageFacilityCounts;
}

export interface Taluka {
  id: string;
  name: string;
  district_id: string;
  villages: Village[];
}

export interface District {
  id: string;
  name: string;
  talukas: Taluka[];
}

// ============================================================================
// Geographic Data Functions
// ============================================================================

/**
 * Fetch all districts
 */
export async function getAllDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching districts:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch district names for dropdown
 */
export async function getDistrictNames(): Promise<string[]> {
  const districts = await getAllDistricts();
  return districts.map(d => d.name);
}

/**
 * Fetch talukas for a specific district
 */
export async function getTalukasForDistrict(districtName: string): Promise<Taluka[]> {
  const { data: districtData, error: districtError } = await supabase
    .from('districts')
    .select('id')
    .eq('name', districtName)
    .single();

  if (districtError || !districtData) {
    console.error('Error fetching district:', districtError);
    return [];
  }

  const { data, error } = await supabase
    .from('talukas')
    .select('*')
    .eq('district_id', districtData.id)
    .order('name');

  if (error) {
    console.error('Error fetching talukas:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch villages for a specific taluka
 */
export async function getVillagesForTaluka(districtName: string, talukaName: string): Promise<Village[]> {
  const talukas = await getTalukasForDistrict(districtName);
  const taluka = talukas.find(t => t.name === talukaName);

  if (!taluka) return [];

  const { data: villagesData, error: villagesError } = await supabase
    .from('villages')
    .select('*')
    .eq('taluka_id', taluka.id)
    .order('name');

  if (villagesError || !villagesData) {
    console.error('Error fetching villages:', villagesError);
    return [];
  }

  // Fetch facility counts for each village
  const villagesWithFacilities = await Promise.all(
    villagesData.map(async (village) => {
      const { data: facilityData } = await supabase
        .from('village_facility_counts')
        .select('*')
        .eq('village_id', village.id)
        .single();

      return {
        ...village,
        facilities: facilityData ? {
          governmentIRCA: facilityData.government_irca,
          privateIRCA: facilityData.private_irca,
          governmentHospital: facilityData.government_hospital,
          privateHospital: facilityData.private_hospital,
          psychiatrist: facilityData.psychiatrist
        } : {
          governmentIRCA: 0,
          privateIRCA: 0,
          governmentHospital: 0,
          privateHospital: 0,
          psychiatrist: 0
        }
      };
    })
  );

  return villagesWithFacilities;
}

/**
 * Fetch complete geographic hierarchy (Districts > Talukas > Villages)
 */
export async function getCompleteGeographicData(): Promise<District[]> {
  const districts = await getAllDistricts();

  const districtsWithData = await Promise.all(
    districts.map(async (district) => {
      const talukas = await getTalukasForDistrict(district.name);
      const talukasWithVillages = await Promise.all(
        talukas.map(async (taluka) => {
          const villages = await getVillagesForTaluka(district.name, taluka.name);
          return { ...taluka, villages };
        })
      );
      return { ...district, talukas: talukasWithVillages };
    })
  );

  return districtsWithData;
}

// ============================================================================
// IRCA Centers Functions
// ============================================================================

/**
 * Fetch all IRCA centers (government and private)
 */
export async function getAllIRCACenters(): Promise<IRCACenter[]> {
  const { data, error } = await supabase
    .from('ircacenters')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching IRCA centers:', error);
    return [];
  }

  return (data || []).map(center => ({
    ...center,
    coordinates: center.lat && center.lng ? {
      lat: center.lat,
      lng: center.lng
    } : undefined
  }));
}

/**
 * Fetch government IRCA centers
 */
export async function getGovernmentIRCACenters(): Promise<IRCACenter[]> {
  const { data, error } = await supabase
    .from('ircacenters')
    .select('*')
    .eq('category', 'government')
    .order('name');

  if (error) {
    console.error('Error fetching government IRCA centers:', error);
    return [];
  }

  return (data || []).map(center => ({
    ...center,
    coordinates: center.lat && center.lng ? {
      lat: center.lat,
      lng: center.lng
    } : undefined
  }));
}

/**
 * Fetch private IRCA centers
 */
export async function getPrivateIRCACenters(): Promise<IRCACenter[]> {
  const { data, error } = await supabase
    .from('ircacenters')
    .select('*')
    .eq('category', 'private')
    .order('name');

  if (error) {
    console.error('Error fetching private IRCA centers:', error);
    return [];
  }

  return (data || []).map(center => ({
    ...center,
    coordinates: center.lat && center.lng ? {
      lat: center.lat,
      lng: center.lng
    } : undefined
  }));
}

/**
 * Fetch IRCA centers by district
 */
export async function getIRCACentersByDistrict(district: string, category?: 'government' | 'private'): Promise<IRCACenter[]> {
  let query = supabase
    .from('ircacenters')
    .select('*')
    .eq('district', district);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching IRCA centers by district:', error);
    return [];
  }

  return (data || []).map(center => ({
    ...center,
    coordinates: center.lat && center.lng ? {
      lat: center.lat,
      lng: center.lng
    } : undefined
  }));
}

/**
 * Fetch IRCA centers by village
 */
export async function getIRCACentersByVillage(village: string, category?: 'government' | 'private'): Promise<IRCACenter[]> {
  let query = supabase
    .from('ircacenters')
    .select('*')
    .eq('village', village);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching IRCA centers by village:', error);
    return [];
  }

  return (data || []).map(center => ({
    ...center,
    coordinates: center.lat && center.lng ? {
      lat: center.lat,
      lng: center.lng
    } : undefined
  }));
}

// ============================================================================
// Hospitals Functions
// ============================================================================

/**
 * Fetch all hospitals
 */
export async function getAllHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('hospital');

  if (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch government hospitals
 */
export async function getGovernmentHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('type', 'government')
    .order('hospital');

  if (error) {
    console.error('Error fetching government hospitals:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch private hospitals
 */
export async function getPrivateHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('type', 'private')
    .order('hospital');

  if (error) {
    console.error('Error fetching private hospitals:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch hospitals by city/district
 */
export async function getHospitalsByCity(city: string, type?: 'government' | 'private'): Promise<Hospital[]> {
  let query = supabase
    .from('hospitals')
    .select('*')
    .ilike('city', `%${city}%`);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.order('hospital');

  if (error) {
    console.error('Error fetching hospitals by city:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch hospitals by village
 */
export async function getHospitalsByVillage(village: string, type?: 'government' | 'private'): Promise<Hospital[]> {
  let query = supabase
    .from('hospitals')
    .select('*')
    .eq('village', village);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.order('hospital');

  if (error) {
    console.error('Error fetching hospitals by village:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Psychiatrists Functions
// ============================================================================

/**
 * Fetch all psychiatrists
 */
export async function getAllPsychiatrists(): Promise<Psychiatrist[]> {
  const { data, error } = await supabase
    .from('psychiatrists')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching psychiatrists:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch psychiatrists by city/district
 */
export async function getPsychiatristsByCity(city: string): Promise<Psychiatrist[]> {
  const { data, error } = await supabase
    .from('psychiatrists')
    .select('*')
    .ilike('city', `%${city}%`)
    .order('name');

  if (error) {
    console.error('Error fetching psychiatrists by city:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch psychiatrists by village
 */
export async function getPsychiatristsByVillage(village: string): Promise<Psychiatrist[]> {
  const { data, error } = await supabase
    .from('psychiatrists')
    .select('*')
    .eq('village', village)
    .order('name');

  if (error) {
    console.error('Error fetching psychiatrists by village:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// IRCA Center Details Functions
// ============================================================================

/**
 * Fetch IRCA center details by center ID
 */
export async function getIRCACenterDetails(centerId: string): Promise<IRCACenterDetails | null> {
  const { data, error } = await supabase
    .from('ircacenter_details')
    .select('*')
    .eq('center_id', centerId)
    .single();

  if (error) {
    console.error('Error fetching IRCA center details:', error);
    return null;
  }

  return data;
}

/**
 * Fetch all IRCA center detail IDs (for routing)
 */
export async function getAllIRCACenterIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('ircacenter_details')
    .select('center_id');

  if (error) {
    console.error('Error fetching IRCA center IDs:', error);
    return [];
  }

  return (data || []).map(item => item.center_id);
}

/**
 * Get all IRCA centers from details table for mobile app
 */
export async function getAllIRCADetails(): Promise<IRCACenterDetails[]> {
  const { data, error } = await supabase
    .from('ircacenter_details')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching all IRCA center details:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Filtering and Search Functions
// ============================================================================

export interface FilterCriteria {
  district?: string;
  taluka?: string;
  village?: string;
  serviceType: 'irca' | 'hospital' | 'psychiatrist';
  category?: 'government' | 'private' | null;
}

/**
 * Filter centers based on criteria (replicates existing filterCenters function)
 */
export async function filterCenters(criteria: FilterCriteria): Promise<any[]> {
  const { district, village, serviceType, category } = criteria;

  if (!serviceType) return [];
  if (serviceType !== 'psychiatrist' && !category) return [];

  let results: any[] = [];

  if (serviceType === 'irca') {
    if (village) {
      results = await getIRCACentersByVillage(village, category as 'government' | 'private');
    } else if (district) {
      results = await getIRCACentersByDistrict(district, category as 'government' | 'private');
    } else if (category) {
      results = category === 'government'
        ? await getGovernmentIRCACenters()
        : await getPrivateIRCACenters();
    }
  } else if (serviceType === 'hospital') {
    if (village) {
      results = await getHospitalsByVillage(village, category as 'government' | 'private');
    } else if (district) {
      results = await getHospitalsByCity(district, category as 'government' | 'private');
    } else if (category) {
      results = category === 'government'
        ? await getGovernmentHospitals()
        : await getPrivateHospitals();
    }
  } else if (serviceType === 'psychiatrist') {
    if (village) {
      results = await getPsychiatristsByVillage(village);
    } else if (district) {
      results = await getPsychiatristsByCity(district);
    } else {
      results = await getAllPsychiatrists();
    }
  }

  return results;
}

/**
 * Get any center by ID from database
 */
export async function getCenterByIdFromDB(id: string): Promise<any> {
  // Try IRCA centers first
  try {
    const ircaResult = await getIRCACenterDetails(id);
    if (ircaResult) {
      return { ...ircaResult, type: 'irca' };
    }
  } catch (error) {
    console.log('Not an IRCA center:', error);
  }

  // Try hospitals
  try {
    const { data: hospitalData, error: hospitalError } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();

    if (!hospitalError && hospitalData) {
      return { ...hospitalData, type: 'hospital' };
    }
  } catch (error) {
    console.log('Not a hospital:', error);
  }

  // Try psychiatrists
  try {
    const { data: psychiatristData, error: psychiatristError } = await supabase
      .from('psychiatrists')
      .select('*')
      .eq('id', id)
      .single();

    if (!psychiatristError && psychiatristData) {
      return { ...psychiatristData, type: 'psychiatrist' };
    }
  } catch (error) {
    console.log('Not a psychiatrist:', error);
  }

  return null;
}

/**
 * Get facility count for a specific location and type
 */
export async function getFacilityCount(
  district: string,
  taluka: string,
  village: string,
  serviceType: string,
  category?: string
): Promise<number> {
  const criteria: FilterCriteria = {
    district,
    taluka,
    village,
    serviceType: serviceType as 'irca' | 'hospital' | 'psychiatrist',
    category: category as 'government' | 'private' | null
  };

  const results = await filterCenters(criteria);
  return results.length;
}

// ============================================================================
// IRCA Taluk Centers Functions
// ============================================================================

export interface IRCATalukCenter {
  taluk: string;
  centers: string[];
}

/**
 * Fetch IRCA centers grouped by taluk
 */
export async function getIRCATalukCenters(): Promise<IRCATalukCenter[]> {
  // Fetch all IRCA centers
  const { data: centers, error } = await supabase
    .from('ircacenters')
    .select('taluk, name')
    .order('taluk, name');

  if (error) {
    console.error('Error fetching IRCA taluk centers:', error);
    return [];
  }

  // Group by taluk
  const grouped = (centers || []).reduce((acc: any, center: any) => {
    if (!acc[center.taluk]) {
      acc[center.taluk] = [];
    }
    acc[center.taluk].push(center.name);
    return acc;
  }, {});

  // Convert to array format
  return Object.entries(grouped).map(([taluk, centers]) => ({
    taluk,
    centers: centers as string[]
  }));
}

/**
 * Get IRCA center ID mapping for navigation
 */
export async function getIRCACenterIdMap(): Promise<{ [key: string]: string }> {
  // Use the more robust dynamic mapping that handles missing columns
  return getDynamicIRCAMapping();
}

/**
 * Get dynamic IRCA center mapping by matching center names with available details
 */
export async function getDynamicIRCAMapping(): Promise<{ [key: string]: string }> {
  // Get all IRCA centers from ircacenters table
  const { data: centers, error: centersError } = await supabase
    .from('ircacenters')
    .select('name, id')
    .order('name');

  // Get all available center details from ircacenter_details table
  const { data: details, error: detailsError } = await supabase
    .from('ircacenter_details')
    .select('center_id, title')
    .order('title');

  if (centersError || detailsError) {
    console.error('Error fetching data for mapping:', centersError || detailsError);
    return {};
  }

  const mapping: { [key: string]: string } = {};
  const usedCenterIds = new Set<string>();

  // Create mapping by finding exact matches first, then partial matches
  (centers || []).forEach((center: any) => {
    // Try exact match first
    const exactMatch = (details || []).find((detail: any) => {
      const centerName = center.name.toLowerCase().trim();
      const detailTitle = detail.title.toLowerCase().trim();
      return centerName === detailTitle && !usedCenterIds.has(detail.center_id);
    });

    if (exactMatch) {
      mapping[center.name] = exactMatch.center_id;
      usedCenterIds.add(exactMatch.center_id);
      return;
    }

    // Try partial match with higher specificity
    const partialMatch = (details || []).find((detail: any) => {
      const centerName = center.name.toLowerCase();
      const detailTitle = detail.title.toLowerCase();

      // Skip if already used
      if (usedCenterIds.has(detail.center_id)) return false;

      // Extract key words from center name (remove common words)
      const centerKeyWords = centerName
        .split(' ')
        .filter((word: string) => word.length > 3 && !['rehabilitation', 'centre', 'center', 'association', 'institute'].includes(word));

      // Extract key words from detail title
      const detailKeyWords = detailTitle
        .split(' ')
        .filter((word: string) => word.length > 3 && !['integrated', 'rehabilitation', 'centre', 'center', 'association', 'institute'].includes(word));

      // Match if at least 2 unique key words match
      const matches = centerKeyWords.filter((centerWord: string) =>
        detailKeyWords.some((detailWord: string) =>
          (centerWord.includes(detailWord) || detailWord.includes(centerWord)) &&
          centerWord.length > 4
        )
      );

      return matches.length >= 2;
    });

    if (partialMatch) {
      mapping[center.name] = partialMatch.center_id;
      usedCenterIds.add(partialMatch.center_id);
    }
  });

  return mapping;
}
