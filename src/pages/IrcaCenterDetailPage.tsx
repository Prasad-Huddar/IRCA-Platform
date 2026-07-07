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
  ChevronLeft,
  ChevronRight,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { getIRCACenterDetails } from '../services/supabaseService';

const IrcaCenterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [center, setCenter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch center details from Supabase
  useEffect(() => {
    const fetchCenterDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const details = await getIRCACenterDetails(id);
        setCenter(details);
      } catch (error) {
        console.error('Error fetching center details from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCenterDetails();
  }, [id]);

  // Get images from center data (fetched from Supabase)
  const centerImages = center?.images || [];

  // Auto-slide functionality
  useEffect(() => {
    if (centerImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === centerImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [centerImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === centerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? centerImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

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

    const sections = ['overview', 'services', 'gallery', 'staff', 'contact', 'reviews'];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          <p className="mt-4 text-lg font-semibold text-primary">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Center Not Found</h1>
          <p className="text-gray-600 mb-8">The IRCA center you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Navigation items for the sidebar
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'services', label: 'Services', icon: Heart },
    { id: 'gallery', label: 'Gallery', icon: ExternalLink },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'reviews', label: 'Reviews', icon: Star },
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
                    {center.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-semibold px-3 py-1">
                      📍 Location
                    </Badge>
                    <Badge className="bg-success/10 text-success border-success/20 font-semibold px-3 py-1">
                      <Shield className="mr-1 h-3 w-3" />
                      ✓ Verified IRCA
                    </Badge>
                  </div>

                  <p className="text-foreground text-lg leading-relaxed mb-6">
                    {center.location}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{center.beds}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Est. {center.established_year}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-warning/10 rounded-lg">
                      <Star className="h-5 w-5 text-warning fill-current" />
                      <span className="font-semibold text-foreground">{center.rating}/5</span>
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
                        <span className="font-bold text-primary text-sm">{center.phone[0]}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                        <span className="font-bold text-primary text-xs">{center.email}</span>
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
                  {center.title} is a government-verified rehabilitation center dedicated to
                  providing comprehensive care for individuals struggling with addiction.
                  Our evidence-based treatment programs are designed to support long-term recovery.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{center.beds.split(' ')[0]}</div>
                    <div className="text-sm text-muted-foreground">Treatment Beds</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">24/7</div>
                    <div className="text-sm text-muted-foreground">Medical Support</div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning">{new Date().getFullYear() - center.established_year}+</div>
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
                  {center.services.map((service: any, index: number) => (
                    <Card key={index} className="transition-all hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Heart className="mr-2 h-5 w-5 text-success" />
                          {service}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Comprehensive {service.toLowerCase()} services provided by our expert team.
                        </p>
                        <Badge variant="outline" className="bg-success/10 text-success">
                          Available
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Gallery Section */}
          <section id="gallery" className="mb-16">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <ExternalLink className="mr-3 h-6 w-6" />
                  {center.id === 'irca_dharwad_maitri' ? 'Sri Maitri Association Gallery' : 'Center Gallery'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {centerImages.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-primary mb-2">
                        {center.id === 'irca_dharwad_maitri' ? 'Sri Maitri Association Gallery' : 'Center Gallery'}
                      </h3>
                      <p className="text-muted-foreground">Explore our facility through these images</p>
                    </div>
                    
                    {/* Main Image Carousel */}
                    <div className="relative w-full max-w-4xl mx-auto">
                      <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg shadow-lg">
                        <img
                          src={centerImages[currentImageIndex]}
                          alt={`${center.title} ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out cursor-pointer"
                          onClick={() => openImageModal(centerImages[currentImageIndex])}
                        />

                        {/* Navigation Arrows */}
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {centerImages.length}
                        </div>
                      </div>

                      {/* Thumbnail Navigation */}
                      <div className="flex justify-center space-x-2 mt-4">
                        {centerImages.map((_: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>

                      <div className="text-center mt-2 text-sm text-gray-600">
                        Auto-playing every 4 seconds • Click image to view full size
                      </div>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                      {centerImages.map((image: any, index: number) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => openImageModal(image)}
                        >
                          <img
                            src={image}
                            alt={`${center.title} ${index + 1}`}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                <ExternalLink className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Heart className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Facility Photo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Staff Section */}
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
                        <p className="font-medium text-primary">{staff.designation}</p>
                        <p className="text-sm text-muted-foreground">{staff.qualification}</p>
                        <Badge variant="outline">Available</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Section */}
          <section id="contact" className="mb-16">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Phone className="mr-3 h-6 w-6" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Phone Number</p>
                          {center.phone.map((phone: any, index: number) => (
                            <p key={index} className="text-muted-foreground">{phone}</p>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-muted-foreground">{center.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-muted-foreground">{center.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Operating Hours</p>
                          <p className="text-muted-foreground">{center.contact.operating_hours}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Website</p>
                          <a href={center.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                            {center.contact.website}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
                        <p className="text-lg font-bold text-warning">{center.contact.helpline.split(' ')[0]}</p>
                        <p className="text-sm text-muted-foreground">{center.contact.helpline}</p>
                      </div>

                      <Button className="w-full" size="lg">
                        Call Emergency Line
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Reviews Section */}
          <section id="reviews" className="mb-16">
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Star className="mr-3 h-6 w-6" />
                  Patient Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "Anonymous",
                      rating: 5,
                      comment: "The care and support I received here changed my life. The staff is compassionate and professional.",
                      date: "2 months ago"
                    },
                    {
                      name: "Anonymous",
                      rating: 5,
                      comment: "Excellent facilities and medical care. The therapy programs are very effective.",
                      date: "1 month ago"
                    },
                    {
                      name: "Anonymous",
                      rating: 4,
                      comment: "Grateful for the support during my recovery journey. Highly recommend this center.",
                      date: "3 weeks ago"
                    }
                  ].map((testimonial, index) => (
                    <Card key={index} className="transition-all hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-1 mb-3">
                          {Array.from({ length: testimonial.rating }, (_, i) => (
                            <Star key={i} className="h-4 w-4 text-warning fill-current" />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-4">"{testimonial.comment}"</p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{testimonial.name}</span>
                          <span className="text-sm text-muted-foreground">{testimonial.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close full image view"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IrcaCenterDetailPage;