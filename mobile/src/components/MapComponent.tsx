import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface MapProps {
  facilities?: any[];
  style?: any;
  onFacilityPress?: (facility: any) => void;
}

// Simple Map Component for Mobile (placeholder for real map integration)
export default function MapComponent({ facilities = [], style, onFacilityPress }: MapProps) {
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  
  // Karnataka state center coordinates (approximate)
  const karnatakaCenter = { latitude: 15.3173, longitude: 75.7139 };
  
  const handleMapPress = () => {
    Alert.alert(
      'Interactive Map',
      'This is a placeholder map. In production, this will show an interactive map with all facility locations.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleFacilityMarkerPress = (facility: any) => {
    setSelectedFacility(facility);
    if (onFacilityPress) {
      onFacilityPress(facility);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Map Placeholder */}
      <TouchableOpacity 
        style={styles.mapPlaceholder}
        onPress={handleMapPress}
        activeOpacity={0.8}
      >
        <View style={styles.mapContent}>
          <Text style={styles.mapTitle}>Karnataka Facilities Map</Text>
          <Text style={styles.mapSubtitle}>
            {facilities.length} facilities located across Karnataka
          </Text>
          
          {/* Simple visualization of facility locations */}
          <View style={styles.mapVisualization}>
            {/* State boundary placeholder */}
            <View style={styles.stateBoundary}>
              {/* Facility markers */}
              {facilities.slice(0, 8).map((facility, index) => {
                const randomX = 20 + (index % 4) * 60;
                const randomY = 30 + Math.floor(index / 4) * 80;
                
                return (
                  <TouchableOpacity
                    key={facility.id}
                    style={[
                      styles.facilityMarker,
                      { left: `${randomX}%`, top: `${randomY}%` }
                    ]}
                    onPress={() => handleFacilityMarkerPress(facility)}
                  >
                    <View style={[
                      styles.markerDot,
                      facility.type === 'irca' && styles.ircaMarker,
                      facility.type === 'hospital' && styles.hospitalMarker,
                      facility.type === 'psychiatrist' && styles.psychiatristMarker,
                    ]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <Text style={styles.mapNote}>Tap to view interactive map</Text>
        </View>
      </TouchableOpacity>
      
      {/* Selected Facility Info */}
      {selectedFacility && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedName}>{selectedFacility.name}</Text>
          <Text style={styles.selectedDistrict}>{selectedFacility.district}</Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleFacilityMarkerPress(selectedFacility)}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#003366',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003366',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 20,
  },
  mapVisualization: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    position: 'relative',
    marginBottom: 16,
  },
  stateBoundary: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 2,
    borderColor: '#003366',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  facilityMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ircaMarker: {
    backgroundColor: '#003366',
  },
  hospitalMarker: {
    backgroundColor: '#2E8540',
  },
  psychiatristMarker: {
    backgroundColor: '#6C757D',
  },
  mapNote: {
    fontSize: 12,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  selectedInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#003366',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 4,
  },
  selectedDistrict: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: '#003366',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
