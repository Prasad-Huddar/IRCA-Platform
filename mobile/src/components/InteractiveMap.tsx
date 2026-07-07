import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import MapView, { Marker, Region, Circle } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface MapProps {
  facilities?: any[];
  style?: any;
  onFacilityPress?: (facility: any) => void;
}

// Karnataka center coordinates and bounds
const KARNATAKA_REGION: Region = {
  latitude: 15.3173,
  longitude: 75.7139,
  latitudeDelta: 7.0,
  longitudeDelta: 4.5,
};

export default function InteractiveMap({ facilities = [], style, onFacilityPress }: MapProps) {
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Generate coordinates for facilities (in real app, these would come from database)
  const getFacilityCoordinates = (facility: any, index: number) => {
    // Generate coordinates within Karnataka bounds
    const baseLat = 15.3173;
    const baseLng = 75.7139;
    const latVariation = 3.5;
    const lngVariation = 2.5;
    
    return {
      latitude: baseLat + (Math.sin(index) * latVariation),
      longitude: baseLng + (Math.cos(index) * lngVariation),
    };
  };

  const handleMarkerPress = (facility: any) => {
    setSelectedFacility(facility);
    setShowDetailModal(true);
    if (onFacilityPress) {
      onFacilityPress(facility);
    }
  };

  const handleViewDetails = () => {
    if (selectedFacility && onFacilityPress) {
      onFacilityPress(selectedFacility);
      setShowDetailModal(false);
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'irca': return '#003366';
      case 'hospital': return '#2E8540';
      case 'psychiatrist': return '#6C757D';
      default: return '#6C757D';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={KARNATAKA_REGION}
        minZoomLevel={6}
        maxZoomLevel={12}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsPointsOfInterests={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Karnataka boundary circle */}
        <Circle
          center={{
            latitude: KARNATAKA_REGION.latitude,
            longitude: KARNATAKA_REGION.longitude,
          }}
          radius={200000} // 200km radius to cover Karnataka
          strokeColor="#003366"
          fillColor="rgba(0, 51, 102, 0.1)"
          strokeWidth={2}
          lineDashPattern={[10, 5]}
        />

        {/* Facility markers */}
        {facilities.slice(0, 50).map((facility, index) => {
          const coords = getFacilityCoordinates(facility, index);
          return (
            <Marker
              key={facility.id}
              coordinate={coords}
              onPress={() => handleMarkerPress(facility)}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getMarkerColor(facility.type) }
              ]}>
                <View style={styles.markerDot} />
                <View style={styles.markerPulse} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Map Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Facility Types</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#003366' }]} />
          <Text style={styles.legendText}>IRCA Centers</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2E8540' }]} />
          <Text style={styles.legendText}>Hospitals</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6C757D' }]} />
          <Text style={styles.legendText}>Psychiatrists</Text>
        </View>
      </View>

      {/* Facility Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFacility && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedFacility.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Type:</Text>
                    <Text style={styles.infoValue}>{selectedFacility.type.toUpperCase()}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>District:</Text>
                    <Text style={styles.infoValue}>{selectedFacility.district}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Category:</Text>
                    <Text style={styles.infoValue}>
                      {selectedFacility.category || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Beds:</Text>
                    <Text style={styles.infoValue}>
                      {selectedFacility.beds || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>
                      {selectedFacility.address || 'No address available'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={handleViewDetails}
                >
                  <Text style={styles.viewDetailsButtonText}>View Full Details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#003366',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  markerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  legend: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#495057',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003366',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
    flex: 2,
    textAlign: 'right',
  },
  viewDetailsButton: {
    backgroundColor: '#003366',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewDetailsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
