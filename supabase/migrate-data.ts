/**
 * ============================================================================
 * IRCA Platform - Data Migration Script
 * ============================================================================
 * This script migrates all data from local TypeScript files to Supabase
 * Run this script using: npx tsx supabase/migrate-data.ts
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://biugkzihccnfjcvrctmv.supabase.co";
const supabaseKey = "sb_publishable_wv0LXzfmXsWv-b1pBnajKA_cC0rK5LJ";

const supabase = createClient(supabaseUrl, supabaseKey);

// Import local data
import { karnatakaDistricts } from '../src/data/karnatakaData.js';
import {
  ircas_government,
  ircas_private,
  hospitals_gov,
  hospitals_private,
  psychiatrists
} from '../src/data/centers.js';
import { ircaCentersDetails } from '../src/data/irca-centers-data.js';

/**
 * Main migration function
 */
async function migrateAllData() {
  console.log('🚀 Starting IRCA Platform Data Migration...\n');

  try {
    // Step 1: Migrate Districts, Talukas, Villages
    await migrateGeographicData();

    // Step 2: Migrate IRCA Centers
    await migrateIRCACenters();

    // Step 3: Migrate Hospitals
    await migrateHospitals();

    // Step 4: Migrate Psychiatrists
    await migratePsychiatrists();

    // Step 5: Migrate IRCA Center Details
    await migrateIRCACenterDetails();

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Migrate Districts, Talukas, Villages, and Facility Counts
 */
async function migrateGeographicData() {
  console.log('📍 Migrating Geographic Data (Districts, Talukas, Villages)...');

  for (const district of karnatakaDistricts) {
    // Insert District
    const { data: districtData, error: districtError } = await supabase
      .from('districts')
      .insert({ name: district.name })
      .select()
      .single();

    if (districtError) {
      console.error(`❌ Error inserting district ${district.name}:`, districtError);
      continue;
    }

    console.log(`  ✓ District: ${district.name}`);

    // Insert Talukas
    for (const taluka of district.talukas) {
      const { data: talukaData, error: talukaError } = await supabase
        .from('talukas')
        .insert({
          name: taluka.name,
          district_id: districtData.id
        })
        .select()
        .single();

      if (talukaError) {
        console.error(`❌ Error inserting taluka ${taluka.name}:`, talukaError);
        continue;
      }

      console.log(`    ✓ Taluka: ${taluka.name}`);

      // Insert Villages and Facility Counts
      for (const village of taluka.villages) {
        const { data: villageData, error: villageError } = await supabase
          .from('villages')
          .insert({
            name: village.name,
            taluka_id: talukaData.id
          })
          .select()
          .single();

        if (villageError) {
          console.error(`❌ Error inserting village ${village.name}:`, villageError);
          continue;
        }

        // Insert Facility Counts
        const { error: facilityError } = await supabase
          .from('village_facility_counts')
          .insert({
            village_id: villageData.id,
            government_irca: village.facilities.governmentIRCA,
            private_irca: village.facilities.privateIRCA,
            government_hospital: village.facilities.governmentHospital,
            private_hospital: village.facilities.privateHospital,
            psychiatrist: village.facilities.psychiatrist
          });

        if (facilityError) {
          console.error(`❌ Error inserting facility counts for ${village.name}:`, facilityError);
        }
      }
    }
  }

  console.log('✅ Geographic data migration complete\n');
}

/**
 * Migrate IRCA Centers (Government and Private)
 */
async function migrateIRCACenters() {
  console.log('🏥 Migrating IRCA Centers...');

  // Migrate Government IRCAs
  for (const center of ircas_government) {
    const services = Array.isArray(center.services)
      ? center.services
      : typeof center.services === 'string'
        ? [center.services]
        : [];

    const { error } = await supabase.from('ircacenters').insert({
      name: center.name,
      district: center.district,
      address: center.address,
      beds: center.beds,
      phone: center.phone || null,
      lat: center.coordinates?.lat || null,
      lng: center.coordinates?.lng || null,
      services: services,
      established: center.established || null,
      verified: center.verified || false,
      type: center.type || 'Government-Aided IRCA',
      details: center.details || null,
      description: center.description || null,
      village: center.village || null,
      category: 'government'
    });

    if (error) {
      console.error(`❌ Error inserting government IRCA ${center.name}:`, error);
    } else {
      console.log(`  ✓ Government IRCA: ${center.name}`);
    }
  }

  // Migrate Private IRCAs
  for (const center of ircas_private) {
    const services = Array.isArray(center.services)
      ? center.services
      : typeof center.services === 'string'
        ? [center.services]
        : [];

    const { error } = await supabase.from('ircacenters').insert({
      name: center.name,
      district: center.district,
      address: center.address,
      beds: center.beds,
      phone: center.phone || null,
      lat: center.coordinates?.lat || null,
      lng: center.coordinates?.lng || null,
      services: services,
      established: center.established || null,
      verified: center.verified || false,
      type: center.type || 'Private',
      details: center.details || null,
      description: center.description || null,
      village: center.village || null,
      category: 'private'
    });

    if (error) {
      console.error(`❌ Error inserting private IRCA ${center.name}:`, error);
    } else {
      console.log(`  ✓ Private IRCA: ${center.name}`);
    }
  }

  console.log('✅ IRCA Centers migration complete\n');
}

/**
 * Migrate Hospitals (Government and Private)
 */
async function migrateHospitals() {
  console.log('🏨 Migrating Hospitals...');

  // Migrate Government Hospitals
  for (const hospital of hospitals_gov) {
    const { error } = await supabase.from('hospitals').insert({
      hospital: hospital.hospital,
      city: hospital.city,
      details: hospital.details,
      type: 'government',
      village: hospital.village || null
    });

    if (error) {
      console.error(`❌ Error inserting government hospital ${hospital.hospital}:`, error);
    } else {
      console.log(`  ✓ Government Hospital: ${hospital.hospital}`);
    }
  }

  // Migrate Private Hospitals
  for (const hospital of hospitals_private) {
    const { error } = await supabase.from('hospitals').insert({
      hospital: hospital.hospital,
      city: hospital.city,
      details: hospital.details,
      type: 'private',
      village: hospital.village || null
    });

    if (error) {
      console.error(`❌ Error inserting private hospital ${hospital.hospital}:`, error);
    } else {
      console.log(`  ✓ Private Hospital: ${hospital.hospital}`);
    }
  }

  console.log('✅ Hospitals migration complete\n');
}

/**
 * Migrate Psychiatrists
 */
async function migratePsychiatrists() {
  console.log('👨‍⚕️ Migrating Psychiatrists...');

  for (const psychiatrist of psychiatrists) {
    const { error } = await supabase.from('psychiatrists').insert({
      name: psychiatrist.name,
      city: psychiatrist.city,
      affiliation: psychiatrist.affiliation,
      specialty: psychiatrist.specialty,
      village: psychiatrist.village || null
    });

    if (error) {
      console.error(`❌ Error inserting psychiatrist ${psychiatrist.name}:`, error);
    } else {
      console.log(`  ✓ Psychiatrist: ${psychiatrist.name}`);
    }
  }

  console.log('✅ Psychiatrists migration complete\n');
}

/**
 * Migrate IRCA Center Details
 */
async function migrateIRCACenterDetails() {
  console.log('📋 Migrating IRCA Center Details...');

  for (const centerDetail of ircaCentersDetails) {
    const { error } = await supabase.from('ircacenter_details').insert({
      center_id: centerDetail.id,
      title: centerDetail.title,
      beds: centerDetail.beds,
      established_year: centerDetail.established_year,
      rating: centerDetail.rating,
      location: centerDetail.location,
      phone: centerDetail.phone,
      email: centerDetail.email,
      overview: centerDetail.overview,
      services: centerDetail.services,
      staff: centerDetail.staff,
      contact: centerDetail.contact
    });

    if (error) {
      console.error(`❌ Error inserting IRCA center detail ${centerDetail.id}:`, error);
    } else {
      console.log(`  ✓ IRCA Detail: ${centerDetail.title}`);
    }
  }

  console.log('✅ IRCA Center Details migration complete\n');
}

// Run migration
migrateAllData();
