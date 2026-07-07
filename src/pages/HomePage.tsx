import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation, Variants } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Search,
  MapPin,
  Star,
  Bed,
  Filter,
  ArrowRight,
  Building,
  Hospital,
  User,
  Sparkles,
  Shield,
  Target,
  Award,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import {
  getGovernmentIRCACenters,
  getPrivateIRCACenters,
  getGovernmentHospitals,
  getPrivateHospitals,
  getAllPsychiatrists,
  getDistrictNames,
  getDynamicIRCAMapping
} from '../services/supabaseService';
import MapComponent from '../components/MapComponent';

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

// Fade in up animation
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Scale in animation
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Container variants for staggered animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Animated card component
const AnimatedCard = ({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Simple card component
const CardWrapper = ({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stats card component
const StatsCard = ({ icon: Icon, value, subtitle, color }: {
  icon: any;
  value: string | number;
  subtitle: string;
  color: string;
}) => {
  return (
    <CardWrapper>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex items-center relative z-10">
          <div className={`p-3 rounded-lg ${color} mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">{value}</p>
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{subtitle}</p>
          </div>
        </div>
        {/* Animated glow border */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </CardWrapper>
  );
};

// Facility card component with clean, professional design
const FacilityCard = ({ center, ircaCenterMapping }: { center: any; ircaCenterMapping: { [key: string]: string } }) => {
  const getTypeIcon = () => {
    switch (center.type) {
      case 'irca': return <Building className="h-4 w-4" />;
      case 'hospital': return <Hospital className="h-4 w-4" />;
      case 'psychiatrist': return <User className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (center.type) {
      case 'irca': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'hospital': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'psychiatrist': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getButtonColor = () => {
    switch (center.type) {
      case 'irca': return 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600';
      case 'hospital': return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'psychiatrist': return 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600';
      default: return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
    }
  };

  return (
    <CardWrapper>
      <div className="flex flex-col h-full bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5 group">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-50">
          {/* Subtle accent line */}
          <div className={`absolute top-0 left-6 right-6 h-0.5 ${center.type === 'irca' ? 'bg-slate-200' : center.type === 'hospital' ? 'bg-blue-100' : center.type === 'psychiatrist' ? 'bg-purple-100' : 'bg-gray-200'}`}></div>
          
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-slate-600 transition-colors duration-300">
                {(center as any).name || (center as any).hospital || (center as any).city}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <span>{(center as any).district || ((center as any).city?.split(',')[0].trim())}</span>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getTypeColor()}`}>
              {center.type === 'irca' ? 'IRCA' : center.type.charAt(0).toUpperCase() + center.type.slice(1)}
            </div>
          </div>
          
          {center.category && (
            <div className="mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${center.category === 'government' ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-purple-50 text-purple-600 border border-purple-200'}`}>
                {center.category === 'government' ? 'Government' : 'Private'}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 flex-grow">
          <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
            {(center as any).address || (center as any).details || (center as any).affiliation || 'No description available'}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="p-2 bg-slate-100 rounded-lg mr-3">
                <Bed className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Capacity</p>
                <p className="text-sm font-semibold text-gray-900">{(center as any).beds || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="p-2 bg-amber-50 rounded-lg mr-3">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Rating</p>
                <p className="text-sm font-semibold text-gray-900">4.8/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Button
            asChild
            className={`w-full ${getButtonColor()} border font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group`}
            aria-label={`View details for ${(center as any).name || (center as any).hospital || (center as any).city}`}
          >
            <Link to={
              (center as any).type === 'irca' 
                ? `/irca-center/${ircaCenterMapping[(center as any).name] || (center as any).id}`
                : `/center/${center.id}`
            } className="flex items-center justify-center text-sm">
              View Details
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </CardWrapper>
  );
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [visibleCenters, setVisibleCenters] = useState<number>(6);
  const [scrollY, setScrollY] = useState(0);
  
  // Supabase data state
  const [ircasGovernment, setIrcasGovernment] = useState<any[]>([]);
  const [ircasPrivate, setIrcasPrivate] = useState<any[]>([]);
  const [hospitalsGov, setHospitalsGov] = useState<any[]>([]);
  const [hospitalsPrivate, setHospitalsPrivate] = useState<any[]>([]);
  const [psychiatristsList, setPsychiatristsList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [ircaCenterMapping, setIrcaCenterMapping] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [govIRCAs, privIRCAs, govHospitals, privHospitals, psych, districts, ircaMapping] = await Promise.all([
          getGovernmentIRCACenters(),
          getPrivateIRCACenters(),
          getGovernmentHospitals(),
          getPrivateHospitals(),
          getAllPsychiatrists(),
          getDistrictNames(),
          getDynamicIRCAMapping()
        ]);
        
        setIrcasGovernment(govIRCAs);
        setIrcasPrivate(privIRCAs);
        setHospitalsGov(govHospitals);
        setHospitalsPrivate(privHospitals);
        setPsychiatristsList(psych);
        setDistrictsList(districts);
        setIrcaCenterMapping(ircaMapping);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Parallax effect for video background
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allFacilities = useMemo(() => [
    ...ircasGovernment.map((center: any) => ({ ...center, type: 'irca', category: 'government' })),
    ...ircasPrivate.map((center: any) => ({ ...center, type: 'irca', category: 'private' })),
    ...hospitalsGov.map((hospital: any) => ({ ...hospital, type: 'hospital', category: 'government' })),
    ...hospitalsPrivate.map((hospital: any) => ({ ...hospital, type: 'hospital', category: 'private' })),
    ...psychiatristsList.map((psychiatrist: any) => ({ ...psychiatrist, type: 'psychiatrist', category: null }))
  ], [ircasGovernment, ircasPrivate, hospitalsGov, hospitalsPrivate, psychiatristsList]);

  const filteredAndSortedCenters = useMemo(() => {
    let filtered = allFacilities;

    if (searchTerm) {
      filtered = filtered.filter(center => {
        const nameToSearch = (center as any).name || (center as any).hospital || (center as any).city || '';
        const districtToSearch = (center as any).district || (center as any).city?.split(',')[0].trim() || '';
        const addressToSearch = (center as any).address || (center as any).details || (center as any).affiliation || '';
        return nameToSearch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                districtToSearch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addressToSearch.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(center =>
        (center as any).district === selectedDistrict ||
        ((center as any).city && (center as any).city.includes(selectedDistrict))
      );
    }

    filtered.sort((a, b) => {
      const aName = (a as any).name || (a as any).hospital || (a as any).city || '';
      const bName = (b as any).name || (b as any).hospital || (b as any).city || '';
      switch (sortBy) {
        case 'name':
          return aName.localeCompare(bName);
        case 'district':
          const aDistrict = (a as any).district || ((a as any).city?.split(',')[0].trim()) || '';
          const bDistrict = (b as any).district || ((b as any).city?.split(',')[0].trim()) || '';
          return aDistrict.localeCompare(bDistrict);
        case 'beds':
          return ((b as any).beds || 0) - ((a as any).beds || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedDistrict, sortBy, allFacilities]);

  const stats = useMemo(() => ({
    centers: allFacilities.length,
    beds: allFacilities.reduce((total, center) => total + ((center as any).beds || 0), 0),
    districts: districtsList.length,
  }), [allFacilities, districtsList]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('.dropdown-container')) {
      setDropdownOpen(null);
    }
  };

  return (
    <div className="min-h-screen bg-background" onClick={handleClickOutside}>
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            <p className="mt-4 text-lg font-semibold text-primary">Loading facilities...</p>
          </div>
        </div>
      )}
      
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden text-white">
        {/* Video Background */}
        <video
          src="/src/images/hero1.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform z-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>
        
        {/* Content Container */}
        <div className="relative z-20 text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge className="bg-white/20 text-white border border-white/30 font-semibold px-6 py-2 text-sm backdrop-blur-sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Government of Karnataka Initiative
                  </Badge>
                </motion.div>
                
                <motion.h1
                  className="text-5xl lg:text-7xl font-heading font-bold leading-tight tracking-tight drop-shadow-2xl"
                  variants={fadeInUp}
                >
                  Rebuilding Lives,
                  <br />
                  <motion.span
                    className="text-[#FFC72C]"
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(255, 199, 44, 0.5)",
                        "0 0 40px rgba(255, 199, 44, 0.8)",
                        "0 0 20px rgba(255, 199, 44, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    One Step at a Time
                  </motion.span>
                </motion.h1>
                
                <motion.p
                  className="text-lg lg:text-xl text-white/95 max-w-2xl leading-relaxed drop-shadow-lg"
                  variants={fadeInUp}
                >
                  Karnataka's official network of rehabilitation centers, hospitals, and psychiatrists,
                  providing evidence-based treatment and compassionate care across the state.
                </motion.p>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatsCard
                icon={Building}
                value={stats.centers}
                subtitle="Total Facilities"
                color="bg-blue-500"
              />
              <StatsCard
                icon={Bed}
                value={stats.beds.toLocaleString()}
                subtitle="Available Nationwide"
                color="bg-green-500"
              />
              <StatsCard
                icon={MapPin}
                value={stats.districts}
                subtitle="Covered Areas"
                color="bg-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white z-30"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium mb-2 drop-shadow-lg">Scroll to explore</span>
            <ChevronDownIcon className="h-6 w-6" strokeWidth={2.5} />
          </div>
        </motion.div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Badge className="bg-[#003366]/10 text-[#003366] border border-[#003366]/20 font-semibold px-4 py-2">
                <Target className="mr-2 h-4 w-4" />
                District Map
              </Badge>
            </motion.div>
            <h2 className="text-4xl font-heading font-bold text-[#003366] mb-6">
              Explore Karnataka Districts
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore the interactive map of Karnataka districts. Click on districts to view district names and boundaries.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              className="lg:col-span-2 relative"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <MapComponent className="h-[500px] lg:h-[600px] rounded-xl shadow-2xl border border-border relative z-10 overflow-hidden" />
            </motion.div>

            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <AnimatedCard delay={0.1} className="group">
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-[#003366]">
                      <MapPin className="mr-2 h-5 w-5" />
                      District Map Legend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { color: 'bg-[#003366]', text: 'District Boundaries' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <div className={`w-4 h-4 ${item.color} rounded-full shadow-sm`}></div>
                        <span className="text-sm font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={0.2} className="group">
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[#003366]">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Total Centers', value: stats.centers, color: 'text-primary' },
                      { label: 'Available Beds', value: stats.beds, color: 'text-green-600' },
                      { label: 'Districts', value: stats.districts, color: 'text-amber-600' },
                      { label: 'Success Rate', value: '94%', color: 'text-purple-600' }
                    ].map((stat, index) => (
                      <motion.div 
                        key={index}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                        <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedCard>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-20 bg-gradient-to-b from-background to-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="bg-white rounded-2xl p-8 lg:p-12 shadow-2xl border border-gray-100 relative overflow-hidden"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            
            <div className="mb-8 relative z-10">
              <motion.div 
                className="inline-block mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Badge className="bg-[#003366]/10 text-[#003366] border border-[#003366]/20 font-semibold px-4 py-2">
                  <Search className="mr-2 h-4 w-4" />
                  Find Centers
                </Badge>
              </motion.div>
              <h3 className="text-3xl font-heading font-bold text-[#003366] mb-3">
                Find Your Center
              </h3>
              <p className="text-muted-foreground text-lg">
                Search and filter government-approved rehabilitation centers across Karnataka
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
              <div className="lg:col-span-2">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search by center name, district, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                  />
                </div>
              </div>

              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtsList.map((district: string) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="beds">Bed Capacity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <motion.div 
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-base font-semibold text-gray-700">
                  Showing <span className="text-primary font-bold">{filteredAndSortedCenters.length}</span> of <span className="text-primary font-bold">{allFacilities.length}</span> facilities
                </p>
              </div>
              <Button 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
              >
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Centers Grid with Professional Design */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-b border-border">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Badge className="bg-[#003366]/10 text-[#003366] border border-[#003366]/20 font-bold px-8 py-3 text-xl rounded-full">
                <Award className="mr-3 h-6 w-6" />
                Our Network
              </Badge>
            </motion.div>
            <h2 className="text-5xl lg:text-6xl font-heading font-bold text-[#003366] mb-6">
              Healthcare Facilities
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-5xl mx-auto leading-relaxed font-medium">
              Discover our official network of government-approved rehabilitation centers, hospitals,
              and psychiatrists across Karnataka, each providing specialized care and support for
              addiction recovery and mental health services.
            </p>
          </motion.div>

          {filteredAndSortedCenters.length === 0 ? (
            <motion.div
              className="text-center py-20"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <MapPin className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">No centers found</h3>
              <p className="text-muted-foreground text-xl">
                Try adjusting your search criteria or browse all centers.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCenters.slice(0, visibleCenters).map((center, index) => (
                <FacilityCard key={`${center.id}-${index}`} center={center} ircaCenterMapping={ircaCenterMapping} />
              ))}
            </div>
          )}
          
          {filteredAndSortedCenters.length > visibleCenters && (
            <motion.div
              className="text-center mt-16"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Button
                onClick={() => setVisibleCenters(prev => prev + 6)}
                className="bg-gradient-to-r from-[#003366] to-[#001A33] hover:from-[#001A33] hover:to-[#000D1A] text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 px-16 py-7 text-xl rounded-2xl group"
                size="lg"
                aria-label="Load more healthcare facilities"
              >
                <Sparkles className="mr-4 h-6 w-6 group-hover:animate-pulse" />
                View More Healthcare Facilities
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Section - Can be added later with real data from database */}
      {/* <section className="py-20 bg-gradient-to-b from-white to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Badge className="bg-[#F5F8FA]/10 text-[#1C3F5E] border border-[#F5F8FA]/20 font-semibold px-6 py-2 text-lg">
                <Heart className="mr-2 h-5 w-5" />
                Success Stories
              </Badge>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-[#003366] mb-6">
              Stories of Hope & Recovery
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Real stories from individuals who have successfully overcome addiction
              and rebuilt their lives through our government-approved IRCA centers.
            </p>
          </motion.div>

          <motion.div
            className="text-center py-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground">
              Success stories will be displayed here once real data is available from the database.
            </p>
            <Button
              asChild
              className="mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 px-12 py-6 text-lg rounded-xl"
              size="lg"
            >
              <Link to="/feedback">
                <MessageSquare className="mr-3 h-6 w-6" />
                Share Your Story
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Events Section - Can be added later with real data from database */}
      {/* <section className="py-20 bg-gradient-to-b from-background to-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-block mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Badge className="bg-[#003366]/10 text-[#003366] border border-[#003366]/20 font-semibold px-6 py-2 text-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Events
                </Badge>
              </motion.div>
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-[#003366] mb-6">
                Upcoming Events & Workshops
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Join our government-organized educational workshops, awareness camps, and support group meetings
                designed to promote recovery and community support across Karnataka.
              </p>

              <motion.div
                className="space-y-4 mb-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    title: "Substance Abuse Prevention Workshop",
                    date: "Jan 15, 2024",
                    location: "Bengaluru Urban",
                    type: "Workshop",
                    icon: <Target className="h-5 w-5" />
                  },
                  {
                    title: "Recovery Support Group Meeting",
                    date: "Jan 18, 2024",
                    location: "Mysuru",
                    type: "Support Group",
                    icon: <Users className="h-5 w-5" />
                  },
                  {
                    title: "Mental Health Awareness Camp",
                    date: "Jan 20, 2024",
                    location: "Dakshina Kannada",
                    type: "Awareness Camp",
                    icon: <Heart className="h-5 w-5" />
                  }
                ].map((event, index) => (
                  <AnimatedCard key={index} delay={index * 0.1} className="group">
                    <motion.div
                      className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div
                        className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      >
                        <div className="text-primary">
                          {event.icon}
                        </div>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#003366] text-lg group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center font-medium">
                            <Clock className="mr-1 h-4 w-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center font-medium">
                            <MapPin className="mr-1 h-4 w-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={
                          event.type === 'Workshop'
                            ? 'bg-blue-100 text-blue-800'
                            : event.type === 'Support Group'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }
                      >
                        {event.type}
                      </Badge>
                    </motion.div>
                  </AnimatedCard>
                ))}
              </motion.div>

              <AnimatedCard delay={0.3}>
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#003366] to-[#001A33] hover:from-[#001A33] hover:to-[#000D1A] text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg"
                  size="lg"
                >
                  <Link to="/events">
                    <Calendar className="mr-3 h-5 w-5" />
                    View All Events
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </AnimatedCard>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-[#003366] mb-8 text-center flex items-center justify-center">
                <Award className="mr-3 h-6 w-6 text-primary" />
                This Month's Highlights
              </h3>

              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    title: "Prevention Workshop",
                    date: "15",
                    location: "Bengaluru",
                    color: "green",
                    badge: "Free"
                  },
                  {
                    title: "Support Group",
                    date: "18",
                    location: "Mysuru",
                    color: "blue",
                    badge: "Weekly"
                  },
                  {
                    title: "Awareness Camp",
                    date: "20",
                    location: "Mangalore",
                    color: "amber",
                    badge: "All Day"
                  }
                ].map((event, index) => (
                  <AnimatedCard key={index} delay={index * 0.1} className="group">
                    <motion.div
                      className="flex items-center justify-between p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className={`w-12 h-12 bg-${event.color}-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          {event.date}
                        </motion.div>
                        <div>
                          <p className="font-semibold text-[#003366] group-hover:text-primary transition-colors">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">{event.location}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          event.badge === 'Free'
                            ? 'bg-green-100 text-green-800'
                            : event.badge === 'Weekly'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }
                      >
                        {event.badge}
                      </Badge>
                    </motion.div>
                  </AnimatedCard>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 pt-6 border-t border-gray-200"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <p className="text-muted-foreground mb-4 font-medium">
                    Want to stay updated?
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold transition-all duration-300 py-3"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Subscribe to Newsletter
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Government Info Section */}
      <section className="py-20 bg-gradient-to-r from-[#003366] via-[#001A33] to-[#000D1A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFC72C] rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div>
                <motion.div
                  className="inline-block mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge className="bg-white/20 text-white border border-white/30 font-semibold px-6 py-2 text-lg backdrop-blur-sm">
                    <Shield className="mr-2 h-5 w-5" />
                    Government Initiative
                  </Badge>
                </motion.div>
                <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight">
                  Government Partnership
                </h2>
              </motion.div>
              
              <motion.p
                className="text-xl text-white/90 leading-relaxed font-medium"
                variants={fadeInUp}
              >
                Our centers are established under the Ministry of Social Justice and Empowerment,
                Government of India, in partnership with the Government of Karnataka.
              </motion.p>
              
              {/* Features section can be added later with database-driven content */}
              <div className="text-center mt-8">
                <p className="text-white/80">
                  Additional features and certifications will be displayed here.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-10 border border-white/20 hover:bg-white/15 transition-all duration-500"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-heading font-bold mb-8 text-white text-center">
                Quick Access
              </h3>
              {/* Features section can be added later with database-driven content */}
              <div className="text-center mt-8">
                <p className="text-white/80">
                  Additional features and resources will be available here.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
