import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

interface SimpleWebMapProps {
  selectedCenter?: any;
  onCenterSelect?: (center: any) => void;
  facilities?: any[];
  stats?: {
    totalCenters: number;
    availableBeds: number;
    districts: number;
    successRate: number;
  };
  className?: string;
}

const SimpleWebMap: React.FC<SimpleWebMapProps> = ({
  selectedCenter,
  onCenterSelect,
  facilities = [],
  stats = {
    totalCenters: 52,
    availableBeds: 360,
    districts: 31,
    successRate: 94,
  },
  className,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simplified HTML content focused on map display
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Karnataka IRCA Map</title>
      
      <!-- Leaflet CSS -->
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        #map-container {
          width: 100%;
          height: 400px;
          position: relative;
          background: #f8f9fa;
        }
        
        #map {
          width: 100%;
          height: 100%;
          border-radius: 14px;
        }
        
        .legend {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
          width: 150px;
          z-index: 1000;
          font-size: 10px;
        }
        
        .legend-title {
          font-size: 11px;
          font-weight: 700;
          color: #003366;
          margin-bottom: 6px;
          text-align: center;
        }
        
        .legend-section {
          margin-bottom: 6px;
        }
        
        .legend-section-title {
          font-size: 9px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 3px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          margin-bottom: 6px;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 11px;
          font-weight: 800;
          color: #003366;
          display: block;
        }
        
        .stat-label {
          font-size: 7px;
          color: #6c757d;
          display: block;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 2px;
        }
        
        .legend-color {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          margin-right: 6px;
        }
        
        .legend-text {
          font-size: 8px;
          color: #495057;
          font-weight: 500;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
          background: #f8f9fa;
          color: #003366;
          font-size: 16px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div id="map-container">
        <div id="loading" class="loading">Loading Map...</div>
        <div id="map"></div>
        
        <div class="legend">
          <div class="legend-title">Karnataka Map</div>
          
          <div class="legend-section">
            <div class="legend-section-title">Quick Stats</div>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">${stats.totalCenters}</span>
                <span class="stat-label">Centers</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${stats.availableBeds}</span>
                <span class="stat-label">Beds</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${stats.districts}</span>
                <span class="stat-label">Districts</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${stats.successRate}%</span>
                <span class="stat-label">Success</span>
              </div>
            </div>
          </div>
          
          <div class="legend-section">
            <div class="legend-section-title">Facilities</div>
            <div class="legend-item">
              <div class="legend-color" style="background: #003366;"></div>
              <span class="legend-text">IRCA Centers</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #2E8540;"></div>
              <span class="legend-text">Hospitals</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #6C757D;"></div>
              <span class="legend-text">Psychiatrists</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaflet JS -->
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      
      <script>
        // Karnataka configuration
        const KARNATAKA_CENTER = [15.3173, 75.7139];
        const KARNATAKA_BOUNDS = [
          [11.5, 74.0],
          [18.5, 78.5]
        ];
        
        const facilities = ${JSON.stringify(facilities)};
        
        // Initialize map
        function initMap() {
          try {
            // Hide loading
            const loadingEl = document.getElementById('loading');
            if (loadingEl) loadingEl.style.display = 'none';
            
            // Create map
            const map = L.map('map', {
              center: KARNATAKA_CENTER,
              zoom: 7.5,
              minZoom: 6,
              maxZoom: 10,
              zoomControl: false,
              attributionControl: false
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 10,
              minZoom: 6
            }).addTo(map);

            // Add Karnataka boundary
            L.rectangle(KARNATAKA_BOUNDS, {
              color: '#003366',
              weight: 2,
              fillOpacity: 0.1,
              fillColor: '#003366',
              dashArray: '5, 5'
            }).addTo(map);

            // Add facilities
            facilities.forEach((facility, index) => {
              if (!facility.id) return;
              
              // Generate coordinates within Karnataka
              const lat = 12.5 + Math.random() * 5;
              const lng = 74.5 + Math.random() * 3.5;
              
              const color = facility.type === 'irca' ? '#003366' : 
                           facility.type === 'hospital' ? '#2E8540' : '#6C757D';
              
              const marker = L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.7
              }).addTo(map);
              
              marker.bindPopup('<b>' + (facility.name || 'Facility') + '</b><br>' + 
                            'Type: ' + (facility.type || 'Unknown') + '<br>' +
                            'District: ' + (facility.district || 'N/A'));
              
              marker.on('click', function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'facility_selected',
                    data: facility
                  }));
                }
              });
            });

            // Fit map to bounds
            map.fitBounds(KARNATAKA_BOUNDS, { padding: [10, 10] });
            
            console.log('Map initialized successfully');
            
          } catch (error) {
            console.error('Error initializing map:', error);
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
              loadingEl.innerHTML = 'Error loading map';
              loadingEl.style.color = 'red';
            }
          }
        }
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initMap);
        } else {
          initMap();
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'facility_selected' && onCenterSelect) {
        onCenterSelect(data.data);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, className as ViewStyle]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        onLoad={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#003366" />
          </View>
        )}
        scalesPageToFit={Platform.OS === 'android'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
      />
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
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    zIndex: 999,
  },
});

export default SimpleWebMap;
