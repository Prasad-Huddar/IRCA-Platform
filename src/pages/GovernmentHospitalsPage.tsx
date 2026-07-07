import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Hospital, MapPin, Phone, Users, Star } from 'lucide-react';
import { filterCenters } from '../data/centers';
import { filterCenters as filterCentersSupabase, FilterCriteria } from '../services/supabaseService';

const GovernmentHospitalsPage = () => {
  const [searchParams] = useSearchParams();
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
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
          serviceType: 'hospital',
          category:    'government'
        });

        setFilteredHospitals(results);
      } catch (error) {
        console.error('Error fetching government hospitals from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-success to-success/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link to="/" className="flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </div>
          <div className="text-center">
            <Badge className="bg-white/20 text-white border border-white/40 mb-4">Government Healthcare</Badge>
            <h1 className="text-4xl font-heading font-bold mb-4">Government Hospitals</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Public healthcare facilities providing comprehensive medical care,
              psychiatric services, and addiction treatment across Karnataka.
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

      {/* Hospitals Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-success"></div>
                <p className="mt-4 text-lg font-semibold text-success">Loading hospitals...</p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredHospitals.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Hospital className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">No Government Hospitals Found</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  No government hospitals match your current filter criteria.
                </p>
                <Button asChild>
                  <Link to="/hospitals/government">View All Government Hospitals</Link>
                </Button>
              </div>
            ) : (
              filteredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-heading text-success mb-2">
                        {hospital.hospital}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        📍 {hospital.city}
                      </Badge>
                    </div>
                    <Badge variant="success" className="text-xs font-bold">
                      ✓ Government
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{hospital.details}</p>

                  <div className="grid grid-cols-2 gap-4 py-3 px-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Hospital className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Type</p>
                        <p className="text-sm font-bold text-success">Public</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Services</p>
                        <p className="text-sm font-bold text-primary">Multiple</p>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-success hover:bg-success/90">
                    <Link to={`/center/${hospital.id}`}>
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

export default GovernmentHospitalsPage;