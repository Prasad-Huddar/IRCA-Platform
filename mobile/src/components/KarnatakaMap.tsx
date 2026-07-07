import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Polygon, Region, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Karnataka center coordinates and bounds
const KARNATAKA_REGION: Region = {
  latitude: 15.3173,
  longitude: 75.7139,
  latitudeDelta: 7.0,
  longitudeDelta: 4.5,
};

// Simplified Karnataka district boundaries (in real app, this would come from GeoJSON)
const KARNATAKA_DISTRICTS = [
  {
    name: 'Bengaluru',
    coordinates: [
      { latitude: 12.9716, longitude: 77.5946 },
      { latitude: 13.1716, longitude: 77.5946 },
      { latitude: 13.1716, longitude: 77.7946 },
      { latitude: 12.9716, longitude: 77.7946 },
    ],
  },
  {
    name: 'Mysuru',
    coordinates: [
      { latitude: 12.2958, longitude: 76.6394 },
      { latitude: 12.4958, longitude: 76.6394 },
      { latitude: 12.4958, longitude: 76.8394 },
      { latitude: 12.2958, longitude: 76.8394 },
    ],
  },
  {
    name: 'Mangaluru',
    coordinates: [
      { latitude: 12.9141, longitude: 74.8560 },
      { latitude: 13.1141, longitude: 74.8560 },
      { latitude: 13.1141, longitude: 75.0560 },
      { latitude: 12.9141, longitude: 75.0560 },
    ],
  },
  {
    name: 'Hubballi',
    coordinates: [
      { latitude: 15.3647, longitude: 75.1240 },
      { latitude: 15.5647, longitude: 75.1240 },
      { latitude: 15.5647, longitude: 75.3240 },
      { latitude: 15.3647, longitude: 75.3240 },
    ],
  },
  {
    name: 'Belagavi',
    coordinates: [
      { latitude: 15.8497, longitude: 74.4977 },
      { latitude: 16.0497, longitude: 74.4977 },
      { latitude: 16.0497, longitude: 74.6977 },
      { latitude: 15.8497, longitude: 74.6977 },
    ],
  },
];

interface KarnatakaMapProps {
  selectedCenter?: any;
  onCenterSelect?: (center: any) => void;
  facilities?: any[];
  className?: string;
  stats?: {
    totalCenters: number;
    availableBeds: number;
    districts: number;
    successRate: number;
  };
}

const KarnatakaMap: React.FC<KarnatakaMapProps> = ({
  selectedCenter,
  onCenterSelect,
  facilities = [],
  className,
  stats = {
    totalCenters: 52,
    availableBeds: 360,
    districts: 31,
    successRate: 94,
  },
}) => {
  const mapRef = useRef<MapView>(null);
  const [zoomLevel, setZoomLevel] = useState(8);

  const handleZoomIn = () => {
    if (zoomLevel < 11) {
      const newZoom = zoomLevel + 1;
      setZoomLevel(newZoom);
      mapRef.current?.animateToRegion({
        ...KARNATAKA_REGION,
        latitudeDelta: KARNATAKA_REGION.latitudeDelta / Math.pow(2, newZoom - 8),
        longitudeDelta: KARNATAKA_REGION.longitudeDelta / Math.pow(2, newZoom - 8),
      });
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 7) {
      const newZoom = zoomLevel - 1;
      setZoomLevel(newZoom);
      mapRef.current?.animateToRegion({
        ...KARNATAKA_REGION,
        latitudeDelta: KARNATAKA_REGION.latitudeDelta * Math.pow(2, 8 - newZoom),
        longitudeDelta: KARNATAKA_REGION.longitudeDelta * Math.pow(2, 8 - newZoom),
      });
    }
  };

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

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'irca': return '#003366';
      case 'hospital': return '#2E8540';
      case 'psychiatrist': return '#6C757D';
      default: return '#6C757D';
    }
  };

  const getDistrictCenter = (district: any) => {
    const lat = district.coordinates.reduce((sum: number, coord: any) => sum + coord.latitude, 0) / district.coordinates.length;
    const lng = district.coordinates.reduce((sum: number, coord: any) => sum + coord.longitude, 0) / district.coordinates.length;
    return { latitude: lat, longitude: lng };
  };

  return (
    <View style={[styles.container, className]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={KARNATAKA_REGION}
        minZoomLevel={7}
        maxZoomLevel={11}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsPointsOfInterest={false}
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

        {/* District boundaries */}
        {KARNATAKA_DISTRICTS.map((district, index) => (
          <Polygon
            key={district.name}
            coordinates={district.coordinates}
            strokeColor="#003366"
            strokeWidth={2}
            fillColor="rgba(0, 51, 102, 0.1)"
            tappable
            onPress={() => Alert.alert(`${district.name} District`, 'District information')}
          />
        ))}

        {/* District labels */}
        {KARNATAKA_DISTRICTS.map((district) => {
          const center = getDistrictCenter(district);
          return (
            <Marker
              key={`label-${district.name}`}
              coordinate={center}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.districtLabel}>
                <Text style={styles.districtLabelText}>{district.name}</Text>
              </View>
            </Marker>
          );
        })}

        {/* Facility markers */}
        {facilities.slice(0, 50).map((facility, index) => {
          const coords = getFacilityCoordinates(facility, index);
          return (
            <Marker
              key={facility.id}
              coordinate={coords}
              onPress={() => onCenterSelect?.(facility)}
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

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomButton, zoomLevel >= 11 && styles.zoomButtonDisabled]}
          onPress={handleZoomIn}
          disabled={zoomLevel >= 11}
        >
          <Ionicons name="add" size={20} color="#003366" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, zoomLevel <= 7 && styles.zoomButtonDisabled]}
          onPress={handleZoomOut}
          disabled={zoomLevel <= 7}
        >
          <Ionicons name="remove" size={20} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* Map Legend and Stats */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>District Map Legend</Text>
        
        <View style={styles.legendSection}>
          <Text style={styles.legendSectionTitle}>District Boundaries</Text>
          <View style={[styles.legendColorBox, { backgroundColor: '#003366' }]} />
        </View>

        <View style={styles.legendSection}>
          <Text style={styles.legendSectionTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCenters}</Text>
              <Text style={styles.statLabel}>Total Centers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.availableBeds}</Text>
              <Text style={styles.statLabel}>Available Beds</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.districts}</Text>
              <Text style={styles.statLabel}>Districts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.legendSection}>
          <Text style={styles.legendSectionTitle}>Facility Types</Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#003366',
    backgroundColor: '#f8f9fa',
  },
  map: {
    flex: 1,
  },
  districtLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#003366',
  },
  districtLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#003366',
    textAlign: 'center',
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
  zoomControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'column',
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  zoomButtonDisabled: {
    opacity: 0.5,
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
    minWidth: 180,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 12,
    textAlign: 'center',
  },
  legendSection: {
    marginBottom: 12,
  },
  legendSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  legendColorBox: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 8,
    width: '45%',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#003366',
  },
  statLabel: {
    fontSize: 10,
    color: '#6C757D',
    marginTop: 2,
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
});

export default KarnatakaMap;
