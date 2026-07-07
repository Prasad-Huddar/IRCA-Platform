import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Building, MapPin, Phone, Bed, Star } from 'lucide-react';
import { filterCenters } from '../data/centers';
import { filterCenters as filterCentersSupabase, FilterCriteria } from '../services/supabaseService';

const GovernmentCentersPage = () => {
  const [searchParams] = useSearchParams();
  const [filteredCenters, setFilteredCenters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const district = searchParams.get('district');
        const taluka   = searchParams.get('taluka');
        const village  = searchParams.get('village');

        const results = await filterCentersSupabase({
          district: district || undefined,
          taluka:   taluka   || undefined,
          village:  village  || undefined,
          serviceType: 'irca',
          category:    'government'
        });

        setFilteredCenters(results);
      } catch (error) {
        console.error('Error fetching government centers from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link to="/" className="flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </div>
          <div className="text-center">
            <Badge className="bg-white/20 text-white border border-white/40 mb-4">Government Initiative</Badge>
            <h1 className="text-4xl font-heading font-bold mb-4">Government IRCAs</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Official government-aided Integrated Rehabilitation Centres for Addicts (IRCA)
              providing comprehensive care and support across Karnataka.
            </p>
            {searchParams.get('district') && (
              <div className="mt-4">
                <Badge className="bg-white/10 text-white border border-white/30">
                  Filtered by: {searchParams.get('district')}
                  {searchParams.get('taluka') && ` > ${searchParams.get('taluka')}`}
                  {searchParams.get('village') && ` > ${searchParams.get('village')}`}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Centers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                <p className="mt-4 text-lg font-semibold text-primary">Loading centers...</p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCenters.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">No Government IRCAs Found</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  No government IRCAs match your current filter criteria.
                </p>
                <Button asChild>
                  <Link to="/centers/government">View All Government IRCAs</Link>
                </Button>
              </div>
            ) : (
              filteredCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-heading text-primary mb-2">
                        {center.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        📍 {center.district}
                      </Badge>
                    </div>
                    <Badge variant="success" className="text-xs font-bold">
                      ✓ Government
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{center.details}</p>

                  <div className="grid grid-cols-2 gap-4 py-3 px-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bed className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Beds</p>
                        <p className="text-sm font-bold text-primary">{center.beds}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Star className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Type</p>
                        <p className="text-sm font-bold text-success">{center.type}</p>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full btn-primary">
                    <Link to={center.center_id ? `/irca-center/${center.center_id}` : `/center/${center.id}`}>
                      View Details
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Link>
                  </Button>
                </CardContent>
                </Card>
              ))
            )}
          </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GovernmentCentersPage;