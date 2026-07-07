import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface WebMapComponentProps {
  selectedCenter?: any;
  onCenterSelect?: (center: any) => void;
  facilities?: any[];
  className?: string;
}

const WebMapComponent: React.FC<WebMapComponentProps> = ({
  selectedCenter,
  onCenterSelect,
  facilities = [],
  className,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize HTML content to prevent unnecessary reloads
  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Karnataka District Map</title>
      
      <!-- Leaflet CSS -->
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: #f8f9fa;
        }
        
        #map {
          width: 100%;
          height: 100vh;
          position: relative;
          z-index: 1;
          background: #f8f9fa;
        }

        /* Custom Zoom Control Styling */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
          margin-top: 10px !important;
          margin-left: 10px !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background-color: #fff !important;
          color: #003366 !important;
          border: 1px solid #e5e7eb !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          border-radius: 4px !important;
          font-size: 16px !important;
          cursor: pointer;
        }
        .leaflet-control-zoom-in {
          border-bottom: 1px solid #e5e7eb !important;
          border-bottom-left-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          margin-bottom: 0 !important;
        }
        .leaflet-control-zoom-out {
          border-top: none !important;
          border-top-left-radius: 0 !important;
          border-top-right-radius: 0 !important;
          margin-top: -1px !important;
        }
        
        .district-label {
          font-size: 10px;
          font-weight: 700;
          color: #003366;
          text-align: center;
          text-shadow: 0 0 2px #fff, 0 0 2px #fff; 
          background: rgba(255, 255, 255, 0.6);
          padding: 0 4px;
          border-radius: 2px;
          white-space: nowrap;
        }
        
        .district-label-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8f9fa;
          z-index: 2000;
          flex-direction: column;
        }
        
        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #003366;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body style="overflow: hidden;">
      <div id="loading" class="loading">
        <div class="spinner"></div>
        <div style="font-size: 12px; color: #003366; font-weight: 600;">Loading Map...</div>
      </div>
      
      <div id="map"></div>

      <!-- Leaflet JS -->
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      
      <script>
        // Initialize map
        window.onload = function() {
          const map = L.map('map', {
            center: [15.3173, 75.7139],
            zoom: 7,
            minZoom: 6,
            maxZoom: 18,
            zoomControl: true,
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true
          });

          // Zoom control to top left like the image
          map.zoomControl.setPosition('topleft');

          // Add clean light tiles
          L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // Fetch GeoJSON for Karnataka Districts
          fetch('https://raw.githubusercontent.com/civictech-India/INDIA-GEO-JSON-Datasets/master/Karnataka_District_Boundary.json')
            .then(response => response.json())
            .then(data => {
              // Add District Boundaries
              const geoJsonLayer = L.geoJSON(data, {
                style: function(feature) {
                  return {
                    fillColor: '#003366',
                    weight: 1.5,
                    opacity: 1,
                    color: '#003366', // District border color
                    dashArray: '',
                    fillOpacity: 0.1 // Slight tint
                  };
                },
                onEachFeature: function(feature, layer) {
                  // Add labels
                  if (feature.properties && feature.properties.District) {
                    const center = layer.getBounds().getCenter();
                    const name = feature.properties.District;
                    
                    const label = L.marker(center, {
                      icon: L.divIcon({
                        className: 'district-label-icon',
                        html: '<div class="district-label">' + name + '</div>',
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                      }),
                      interactive: false
                    }).addTo(map);
                  }
                  
                  // Highlight on hover/click (optional interaction)
                  layer.on({
                    click: function(e) {
                      map.fitBounds(e.target.getBounds());
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'district_selected',
                        data: feature.properties.District
                      }));
                    }
                  });
                }
              }).addTo(map);
              
              // Fit bounds to Karnataka
              map.fitBounds(geoJsonLayer.getBounds(), { padding: [10, 10] });
              
              const loadingEl = document.getElementById('loading');
              if(loadingEl) loadingEl.style.display = 'none';
            })
            .catch(err => {
              console.error('Error loading GeoJSON:', err);
              const loadingEl = document.getElementById('loading');
              if(loadingEl) {
                loadingEl.innerHTML = '<div style="color:red; text-align:center">Error loading map data.<br>Please check internet connection.</div>';
              }
            });
        };
      </script>
    </body>
    </html>
  `, []);

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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 480, // Increased height for better visibility
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#f8f9fa',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  webView: {
    flex: 1,
    opacity: 0.99, // Fix for some Android rendering glitches
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

export default WebMapComponent;
