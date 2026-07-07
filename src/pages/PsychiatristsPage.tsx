/**
 * Psychiatrists Page - Enhanced Card Layout
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
import { ArrowLeft, User, MapPin, Phone, Award, Star } from 'lucide-react';
import { psychiatrists, filterCenters, FilterCriteria } from '../data/centers';
import { getAllPsychiatrists, filterCenters as filterCentersSupabase, FilterCriteria as SupabaseFilterCriteria } from '../services/supabaseService';

const PsychiatristsPage = () => {
  const [searchParams] = useSearchParams();
  const [filteredPsychiatrists, setFilteredPsychiatrists] = useState<any[]>([]);
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
            serviceType: 'psychiatrist',
            category: undefined
          };
          const filtered = await filterCentersSupabase(criteria);
          setFilteredPsychiatrists(filtered);
        } else {
          // Show all psychiatrists if no filters
          const allPsych = await getAllPsychiatrists();
          setFilteredPsychiatrists(allPsych);
        }
      } catch (error) {
        console.error('Error fetching psychiatrists from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [district, taluka, village]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-accent to-accent/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
            {district && (
              <Link to="/psychiatrists" className="flex items-center text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
                View All Psychiatrists
              </Link>
            )}
          </div>
          <div className="text-center">
            <Badge className="bg-white/20 text-white border border-white/40 mb-4">Mental Health Experts</Badge>
            <h1 className="text-4xl font-heading font-bold mb-4">
              {district ? `Psychiatrists in ${district}` : 'Psychiatrists'}
              {village && ` - ${village}`}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {district ?
                `Showing ${filteredPsychiatrists.length} psychiatrist${filteredPsychiatrists.length !== 1 ? 's' : ''} ${village ? `in ${village}` : `in ${district} district`}.` :
                'Connect with experienced psychiatrists and mental health professionals specializing in addiction treatment and recovery support.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Psychiatrists Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
                <p className="mt-4 text-lg font-semibold text-accent">Loading psychiatrists...</p>
              </div>
            </div>
          ) : (
          <div className="space-y-8">
            {filteredPsychiatrists.map((psychiatrist, index) => (
              <Card key={psychiatrist.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden card-enter card-hover-lift card-parallax-bg" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}>
                  {/* Image Side */}
                  <div className={`relative ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} bg-gradient-to-br from-accent/20 to-accent/10 p-8 flex items-center justify-center min-h-[300px]`}>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-12 w-12 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-accent mb-2">Mental Health Expert</h3>
                      <p className="text-accent/80">Professional Care</p>
                    </div>
                    {/* Parallax background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 transform translate-x-2 translate-y-2"></div>
                  </div>

                  {/* Content Side */}
                  <div className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} p-8`}>
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-heading text-accent mb-2">
                            {psychiatrist.name}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 text-sm">
                            📍 {psychiatrist.city}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-sm font-bold border-accent text-accent">
                          MD
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-accent/10 rounded-lg">
                            <Award className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Affiliation</p>
                            <p className="text-lg font-bold text-accent">{psychiatrist.affiliation}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Specialty</p>
                            <p className="text-lg font-bold text-primary">{psychiatrist.specialty}</p>
                          </div>
                        </div>
                      </div>

                      <Button asChild className="w-full bg-accent hover:bg-accent/90 text-lg py-3">
                        <Link to={`/center/${psychiatrist.id}`}>
                          View Profile
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

export default PsychiatristsPage;