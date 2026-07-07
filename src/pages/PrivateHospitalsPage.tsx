/**
 * Private Hospitals Page - Enhanced Card Layout
 * - One card per row with alternating image sides
 * - Modern animations: card-enter, card-hover-lift, card-parallax-bg
 * - Large, easy-to-read text for accessibility
 * - Parallax background effects for interactivity
 *
 * CARD ALTERNATION LOGIC:
 * - index % 2 === 0: Image on left, content on right
 * - index % 2 !== 0: Image on right, content on left (lg:grid-flow-col-dense)
 * - Staggered animation delays for entrance effects
 *
 * To modify card layout:
 * 1. Adjust grid-cols and grid-flow for different layouts
 * 2. Modify animation classes for different effects
 * 3. Update content structure while maintaining accessibility
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Hospital, MapPin, Phone, Users, Star } from 'lucide-react';
import { hospitals_private, filterCenters, FilterCriteria } from '../data/centers';
import { filterCenters as filterCentersSupabase, FilterCriteria as SupabaseFilterCriteria } from '../services/supabaseService';

const PrivateHospitalsPage = () => {
  const [searchParams] = useSearchParams();
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract URL parameters for filtering - check both query params and route params
  const district = searchParams.get('district') || window.location.pathname.split('/')[2];
  const taluka = searchParams.get('taluka') || window.location.pathname.split('/')[4];
  const village = searchParams.get('village') || window.location.pathname.split('/')[6];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Apply contextual filtering based on URL parameters
        if (district || taluka || village) {
          const criteria: SupabaseFilterCriteria = {
            district: district || undefined,
            taluka: taluka || undefined,
            village: village || undefined,
            serviceType: 'hospital',
            category: 'private'
          };
          const filtered = await filterCentersSupabase(criteria);
          setFilteredHospitals(filtered);
        } else {
          // Show all private hospitals if no filters
          const allPrivateHospitals = await filterCentersSupabase({ serviceType: 'hospital', category: 'private' });
          setFilteredHospitals(allPrivateHospitals);
        }
      } catch (error) {
        console.error('Error fetching private hospitals from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [district, taluka, village]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-warning to-warning/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
            {district && (
              <Link to="/hospitals/private" className="flex items-center text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
                View All Private Hospitals
              </Link>
            )}
          </div>
          <div className="text-center">
            <Badge className="bg-white/20 text-white border border-white/40 mb-4">Private Healthcare</Badge>
            <h1 className="text-4xl font-heading font-bold mb-4">
              {district ? `Private Hospitals in ${district}` : 'Private Hospitals'}
              {village && ` - ${village}`}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {district ?
                `Showing ${filteredHospitals.length} private hospital${filteredHospitals.length !== 1 ? 's' : ''} ${village ? `in ${village}` : `in ${district} district`}.` :
                'Premium private healthcare facilities offering specialized psychiatric care, advanced treatment options, and personalized recovery programs.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Hospitals Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-warning"></div>
                <p className="mt-4 text-lg font-semibold text-warning">Loading hospitals...</p>
              </div>
            </div>
          ) : (
          <div className="space-y-8">
            {filteredHospitals.map((hospital, index) => (
              <Card key={hospital.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden card-enter card-hover-lift card-parallax-bg" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}>
                  {/* Image Side */}
                  <div className={`relative ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} bg-gradient-to-br from-warning/20 to-warning/10 p-8 flex items-center justify-center min-h-[300px]`}>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-warning/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Hospital className="h-12 w-12 text-warning" />
                      </div>
                      <h3 className="text-2xl font-bold text-warning mb-2">Medical Center</h3>
                      <p className="text-warning/80">Professional Healthcare</p>
                    </div>
                    {/* Parallax background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-warning/5 transform translate-x-2 translate-y-2"></div>
                  </div>

                  {/* Content Side */}
                  <div className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} p-8`}>
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-heading text-warning mb-2">
                            {hospital.hospital}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-sm">
                            📍 {hospital.city}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-sm font-bold border-warning text-warning">
                          Private
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 space-y-6">
                      <p className="text-muted-foreground text-lg leading-relaxed">{hospital.details}</p>

                      <div className="grid grid-cols-2 gap-4 py-4 px-4 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-warning/10 rounded-lg">
                            <Hospital className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Type</p>
                            <p className="text-lg font-bold text-warning">Private</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Services</p>
                            <p className="text-lg font-bold text-primary">Specialized</p>
                          </div>
                        </div>
                      </div>

                      <Button asChild className="w-full bg-warning hover:bg-warning/90 text-white text-lg py-3">
                        <Link to={`/center/${hospital.id}`}>
                          View Details
                          <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                        </Link>
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PrivateHospitalsPage;