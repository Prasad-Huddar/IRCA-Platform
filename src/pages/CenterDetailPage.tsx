import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Bed,
  Users,
  Calendar,
  Award,
  Shield,
  Heart,
  ArrowLeft,
  ExternalLink,
  Navigation,
  Mail,
  CheckCircle,
  AlertCircle,
  Info,
  Menu,
  X
} from 'lucide-react';
import { getCenterByIdFromDB } from '../services/supabaseService';

const CenterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [center, setCenter] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch center data from database
  useEffect(() => {
    const fetchCenter = async () => {
      // Add validation for the ID parameter
      if (!id || id === 'null' || id === 'undefined' || id === '') {
        console.warn('Invalid center ID provided:', id);
        setIsLoading(false);
        return;
      }

      try {
        const centerData = await getCenterByIdFromDB(id);
        setCenter(centerData);
      } catch (error) {
        console.error('Error fetching center details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCenter();
  }, [id]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setIsMobileSidebarOpen(false);
    }
  };

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = ['overview', 'services', 'gallery', 'staff', 'contact', 'testimonials'];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          <p className="mt-4 text-lg font-semibold text-primary">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Center Not Found</h1>
          <p className="text-gray-600 text-lg">The requested center could not be found in our database.</p>
          <Button asChild className="mt-6">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedCenters: any[] = [];

  // Navigation items for the sidebar
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'services', label: 'Services', icon: Heart },
    { id: 'gallery', label: 'Gallery', icon: ExternalLink },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'testimonials', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Layout Container */}
      <div className="flex w-full min-h-screen">
        {/* Sidebar - 25% width */}
        <aside className={`
          w-1/4 min-w-[280px] max-w-[320px] sticky top-20 h-[calc(100vh-5rem)] 
          overflow-y-auto border-r border-gray-200 bg-white p-6 z-40
          lg:block
          ${isMobileSidebarOpen ? 'fixed left-0 top-20 w-80 shadow-xl' : 'hidden'}
        `}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-primary mb-2">Quick Navigation</h2>
            <p className="text-sm text-muted-foreground">Jump to any section</p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200
                    ${activeSection === item.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${activeSection === item.id ? 'text-white' : 'text-primary'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions in Sidebar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content - 75% width */}
        <main className="flex-1 w-3/4 p-6 overflow-hidden scroll-smooth">
          {/* Overview Section */}
          <section id="overview" className="mb-16">
            <div className="mb-8">
              <Button variant="outline" asChild className="mb-6">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Centers
                </Link>
              </Button>
            </div>

            {/* Hero Content */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight">
                    {center?.name || center?.hospital || center?.specialty}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-semibold px-3 py-1">
                      📍 {center?.district}
                    </Badge>
                    <Badge className="bg-success/10 text-success border-success/20 font-semibold px-3 py-1">
                      <Shield className="mr-1 h-3 w-3" />
                      ✓ Verified
                    </Badge>
                  </div>

                  <p className="text-foreground text-lg leading-relaxed mb-6">
                    {center?.address || center?.city || center?.affiliation}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{center?.beds || 'N/A'} beds</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Est. 2015</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-warning/10 rounded-lg">
                      <Star className="h-5 w-5 text-warning fill-current" />
                      <span className="font-semibold text-foreground">4.5/5</span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-80">
                  <Card className="border-2 border-border shadow-lg">
                    <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                      <CardTitle className="flex items-center">
                        <Phone className="mr-2 h-5 w-5 text-warning" />
                        Contact Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="text-sm font-medium text-muted-foreground">Phone</span>
                        <span className="font-bold text-primary text-sm">+91 XXXXX XXXXX</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                        <span className="font-bold text-primary text-xs">info@center.org</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                        <span className="text-sm font-medium text-success">Hours</span>
                        <span className="font-bold text-success">24/7</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* About Section */}
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  About This Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {center?.name || center?.hospital || center?.specialty} is a government-verified rehabilitation center dedicated to
                  providing comprehensive care for individuals struggling with addiction.
                  Our evidence-based treatment programs are designed to support long-term recovery.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{center?.beds || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Treatment Beds</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">24/7</div>
                    <div className="text-sm text-muted-foreground">Medical Support</div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning">10+</div>
                    <div className="text-sm text-muted-foreground">Years of Service</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Licensed by Government of Karnataka</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">NAPDDR Accredited Programs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Experienced Medical Staff</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Services Section */}
          <section id="services" className="mb-16">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Heart className="mr-3 h-6 w-6" />
                  Our Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Detoxification & Medical Management",
                      description: "Safe, medically supervised detoxification with 24/7 monitoring",
                      icon: Heart,
                      available: true
                    },
                    {
                      title: "Individual Counseling",
                      description: "One-on-one therapy sessions with licensed counselors",
                      icon: Users,
                      available: true
                    },
                    {
                      title: "Group Therapy",
                      description: "Peer support groups and group counseling sessions",
                      icon: Users,
                      available: true
                    },
                    {
                      title: "Family Support Programs",
                      description: "Counseling and support for family members",
                      icon: Heart,
                      available: true
                    },
                    {
                      title: "Aftercare Planning",
                      description: "Comprehensive discharge planning and follow-up care",
                      icon: Calendar,
                      available: true
                    },
                    {
                      title: "Vocational Training",
                      description: "Skill development and employment assistance",
                      icon: Award,
                      available: false
                    }
                  ].map((service, index) => (
                    <Card key={index} className={`transition-all hover:shadow-md ${service.available ? '' : 'opacity-60'}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <service.icon className={`mr-2 h-5 w-5 ${service.available ? 'text-success' : 'text-muted-foreground'}`} />
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                        <Badge variant={service.available ? "outline" : "secondary"} className={service.available ? "bg-success/10 text-success" : ""}>
                          {service.available ? "Available" : "Coming Soon"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Gallery Section - Only show if center has images */}
          {center?.images && center.images.length > 0 && (
            <section id="gallery" className="mb-16">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <ExternalLink className="mr-3 h-6 w-6" />
                    Facility Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {center.images.map((image: string, index: number) => (
                      <div key={index} className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Heart className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">Facility Photo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Staff Section - Only show if center has staff data */}
          {center?.staff && center.staff.length > 0 && (
            <section id="staff" className="mb-16">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="mr-3 h-6 w-6" />
                    Our Medical Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {center.staff.map((staff: any, index: number) => (
                      <Card key={index} className="transition-all hover:shadow-md">
                        <CardHeader className="text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{staff.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                          <p className="font-medium text-primary">{staff.role}</p>
                          <p className="text-sm text-muted-foreground">{staff.qualification}</p>
                          <Badge variant="outline">Available</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Contact Section */}
          {(center?.phone || center?.email || center?.address) && (
            <section id="contact" className="mb-16">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Phone className="mr-3 h-6 w-6" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-muted-foreground">{center?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-muted-foreground">{center?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{center?.address || center?.city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Operating Hours</p>
                      <p className="text-muted-foreground">{center?.contact?.operating_hours || 'N/A'}</p>
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="h-5 w-5 text-warning" />
                          <span className="font-medium text-warning">Emergency Helpline</span>
                        </div>
                        <p className="text-lg font-bold text-warning">{center?.contact?.helpline || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">Available 24/7 for emergencies</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Reviews Section - Only show if center has testimonials */}
          {center?.testimonials && center.testimonials.length > 0 && (
            <section id="testimonials" className="mb-16">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Star className="mr-3 h-6 w-6" />
                    Patient Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {center.testimonials.map((testimonial: any, index: number) => (
                      <Card key={index} className="transition-all hover:shadow-md">
                        <CardHeader className="text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                          <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                          <div className="flex items-center justify-center space-x-2 mt-3">
                            <div className="flex">
                              {Array.from({ length: testimonial.rating }, (_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{testimonial.date}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </main>
      </div>

      {/* Related Centers */}
      {relatedCenters.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-primary mb-6">
              Other Centers in {center?.district}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCenters.map((relatedCenter: any) => (
                <Card key={relatedCenter.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {relatedCenter.hospital}
                    </CardTitle>
                    <Badge variant="outline">{relatedCenter.city}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedCenter.details}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Bed className="h-4 w-4" />
                        <span>N/A beds</span>
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/center/${relatedCenter.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CenterDetailPage;
