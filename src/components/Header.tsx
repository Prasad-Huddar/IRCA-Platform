/**
 * Karnataka IRCA Centers - Fixed Cascading Dropdown with Smart Navigation
 * - Scrollable Level 1 & 2
 * - Level 4 always fully visible with conditional redirects
 * - 0% gutter
 *
 * LEVEL 4 NAVIGATION LOGIC:
 * - If facility count === 1: Direct redirect to /center/{id}
 * - If facility count > 1: Redirect to listing page with filters
 *
 * CARD ALTERNATION LOGIC:
 * - Cards alternate left/right image placement for visual variety
 * - One card per row layout for better readability
 * - Parallax background effects for modern interactivity
 *
 * To update navigation logic:
 * 1. Modify the Link href in level 4 dropdown based on count checks
 * 2. Ensure facility counts in karnatakaData.ts are accurate
 * 3. Update center IDs in data files when adding new facilities
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Menu,
  X,
  MapPin,
  Phone,
  Calendar,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  LogIn,
  UserPlus,
  User,
  LogOut
} from 'lucide-react';
import { getCompleteGeographicData, filterCenters } from '../services/supabaseService';
import { ircaTalukCenters, ircaCenterIdMap } from '../data/centers';
import { ircaNavigation } from '../utils/irca-details-handler';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import kargovLogo from '../images/kargovlogo2.png';

// Helper function to check if village has facilities
const hasFacilities = (village: any): boolean => {
  return (
    village.facilities.governmentIRCA > 0 ||
    village.facilities.privateIRCA > 0 ||
    village.facilities.governmentHospital > 0 ||
    village.facilities.privateHospital > 0 ||
    village.facilities.psychiatrist > 0
  );
};

const Header = () => {
  // Always call hooks at the top level - this is critical for React
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ircaDropdownOpen, setIrcaDropdownOpen] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [hoveredVillage, setHoveredVillage] = useState<string | null>(null);
  const [hoveredIrcaTaluk, setHoveredIrcaTaluk] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get auth context - this should always be called within AuthProvider
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn('useAuth called outside AuthProvider context:', error);
    authContext = { user: null, logout: async () => {} };
  }
  
  const { user, logout } = authContext;
  
  // Supabase data state
  const [karnatakaDistricts, setKarnatakaDistricts] = useState<any[]>([]);
  
  // Fetch geographic data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCompleteGeographicData();
        setKarnatakaDistricts(data);
      } catch (error) {
        console.error('Error fetching geographic data:', error);
      }
    };
    fetchData();
  }, []);

  const districtsButtonRef = useRef<HTMLButtonElement | null>(null);
  const ircaButtonRef = useRef<HTMLButtonElement | null>(null);
  const districtsDropdownRef = useRef<HTMLDivElement | null>(null);
  const ircaDropdownRef = useRef<HTMLDivElement | null>(null);
  const districtRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const talukaRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const villageRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const ircaTalukRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [districtsDropdownPos, setDistrictsDropdownPos] = useState({ top: 84, left: 0 });
  const [ircaDropdownPos, setIrcaDropdownPos] = useState({ top: 84, left: 0 });
  const [positions, setPositions] = useState({
    district: { top: 0, left: 0 },
    taluka: { top: 0, left: 0 },
    village: { top: 0, left: 0 },
    ircaTaluk: { top: 0, left: 0 }
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = (ref: HTMLButtonElement | null) => {
    if (!ref) return { top: 0, left: 0 };
    const rect = ref.getBoundingClientRect();
    return { top: rect.top, left: rect.right };
  };

  useEffect(() => {
    if (districtsButtonRef.current) {
      const rect = districtsButtonRef.current.getBoundingClientRect();
      setDistrictsDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (ircaButtonRef.current) {
      const rect = ircaButtonRef.current.getBoundingClientRect();
      setIrcaDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [ircaDropdownOpen]);

  useEffect(() => {
    if (hoveredDistrict && districtRefs.current[hoveredDistrict]) {
      setPositions(prev => ({ ...prev, district: calculatePosition(districtRefs.current[hoveredDistrict]) }));
    }
  }, [hoveredDistrict]);

  useEffect(() => {
    if (hoveredTaluka && talukaRefs.current[hoveredTaluka]) {
      setPositions(prev => ({ ...prev, taluka: calculatePosition(talukaRefs.current[hoveredTaluka]) }));
    }
  }, [hoveredTaluka]);

  useEffect(() => {
    if (hoveredVillage && villageRefs.current[hoveredVillage]) {
      setPositions(prev => ({ ...prev, village: calculatePosition(villageRefs.current[hoveredVillage]) }));
    }
  }, [hoveredVillage]);

  useEffect(() => {
    if (hoveredIrcaTaluk && ircaTalukRefs.current[hoveredIrcaTaluk]) {
      setPositions(prev => ({ ...prev, ircaTaluk: calculatePosition(ircaTalukRefs.current[hoveredIrcaTaluk]) }));
    }
  }, [hoveredIrcaTaluk]);

  const clearAllTimeouts = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (mouseLeaveTimeoutRef.current) clearTimeout(mouseLeaveTimeoutRef.current);
  };

  const closeAll = () => {
    setHoveredDistrict(null);
    setHoveredTaluka(null);
    setHoveredVillage(null);
    setHoveredIrcaTaluk(null);
    setDropdownOpen(false);
    setIrcaDropdownOpen(false);
  };

  const delayedClose = () => {
    clearAllTimeouts();
    mouseLeaveTimeoutRef.current = setTimeout(closeAll, 150);
  };

  const keepOpen = () => {
    clearAllTimeouts();
  };

  const handleDistrictsClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIrcaDropdownOpen(false);
    setDropdownOpen(!dropdownOpen);
  };

  const handleIrcaClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen(false);
    setIrcaDropdownOpen(!ircaDropdownOpen);
  };

  const handleDistrictsMouseEnter = () => {
    clearAllTimeouts();
    setIrcaDropdownOpen(false);
    setDropdownOpen(true);
  };

  const handleIrcaMouseEnter = () => {
    clearAllTimeouts();
    setDropdownOpen(false);
    setIrcaDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    delayedClose();
  };

  // Handle clicks outside dropdown to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside both dropdown containers
      const districtsContainer = districtsDropdownRef.current;
      const ircaContainer = ircaDropdownRef.current;
      const districtsButton = districtsButtonRef.current;
      const ircaButton = ircaButtonRef.current;
      
      const isOutsideDistricts = districtsContainer && !districtsContainer.contains(target) &&
                                districtsButton && !districtsButton.contains(target);
      const isOutsideIrca = ircaContainer && !ircaContainer.contains(target) &&
                           ircaButton && !ircaButton.contains(target);
      
      if ((dropdownOpen && isOutsideDistricts) || (ircaDropdownOpen && isOutsideIrca)) {
        closeAll();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAll();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [dropdownOpen, ircaDropdownOpen]);

  const navigation = [
    { name: 'Home', href: '/', icon: MapPin },
    { name: 'Districts', href: '#', icon: MapPin, dropdown: true, districts: karnatakaDistricts },
    { name: "IRCA's", href: '#', icon: MapPin, ircaDropdown: true, ircaTaluks: ircaTalukCenters },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Avoidance', href: '/avoidance', icon: HelpCircle },
    { name: 'Contact', href: '/feedback', icon: MessageSquare },
    // { name: 'Faq', href: '/faq', icon: MessageSquare },
  ];

  // Authentication navigation (will be shown based on auth state)
  const authNavigation = [
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Register', href: '/register', icon: UserPlus },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-border">
      <div className="max-w-full mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
              <img src={kargovLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">IRCA Karnataka</h1>
              <p className="text-xs text-muted-foreground">Rehabilitation Centres</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              if (item.ircaDropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    ref={ircaDropdownRef}
                    onMouseEnter={handleIrcaMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <button
                      ref={ircaButtonRef}
                      onClick={handleIrcaClick}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        ircaDropdownOpen ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-primary/5'
                      }`}
                      aria-expanded={ircaDropdownOpen}
                      aria-haspopup="true"
                      aria-label="IRCA Centers dropdown"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${ircaDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {ircaDropdownOpen && (
                      <div className="fixed inset-0 z-40">
                        {/* Level 1: IRCA Taluks - Scrollable */}
                        <div
                          className="absolute w-64 bg-white rounded-lg shadow-xl border z-50 p-2 max-h-96 overflow-y-auto md:w-64 sm:w-48"
                          style={{ top: ircaDropdownPos.top, left: ircaDropdownPos.left }}
                          role="menu"
                          aria-label="IRCA Taluks"
                          onMouseEnter={keepOpen}
                          onMouseLeave={handleDropdownMouseLeave}
                        >
                          {item.ircaTaluks?.map((taluk) => (
                            <button
                              key={taluk.taluk}
                              ref={(el) => { ircaTalukRefs.current[taluk.taluk] = el; }}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                hoveredIrcaTaluk === taluk.taluk
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'hover:bg-primary/5'
                              }`}
                              onMouseEnter={() => {
                                keepOpen();
                                setHoveredIrcaTaluk(taluk.taluk);
                              }}
                              onFocus={() => {
                                keepOpen();
                                setHoveredIrcaTaluk(taluk.taluk);
                              }}
                              onBlur={() => {
                                setHoveredIrcaTaluk(null);
                              }}
                              role="menuitem"
                              tabIndex={0}
                            >
                              {taluk.taluk}
                            </button>
                          ))}
                        </div>

                        {/* Level 2: IRCA Centers - Scrollable */}
                        {hoveredIrcaTaluk && positions.ircaTaluk.left > 0 && (
                          <div
                            className="absolute bg-white rounded-lg shadow-xl border z-50 p-2 w-64 max-h-96 overflow-y-auto md:w-64 sm:w-48"
                            style={{
                              top: Math.min(positions.ircaTaluk.top, window.innerHeight - 400),
                              left: positions.ircaTaluk.left
                            }}
                            onMouseEnter={keepOpen}
                            onMouseLeave={handleDropdownMouseLeave}
                            role="menu"
                            aria-label={`IRCA Centers in ${hoveredIrcaTaluk}`}
                          >
                            {item.ircaTaluks?.find(t => t.taluk === hoveredIrcaTaluk)?.centers.map((center) => {
                              const centerId = ircaCenterIdMap[center];

                              return (
                                <button
                                  key={center}
                                  className="w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-primary/5 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  onClick={() => {
                                    if (centerId) {
                                      navigate(`/irca-center/${centerId}`);
                                    }
                                    closeAll();
                                  }}
                                  onFocus={() => keepOpen()}
                                  onBlur={() => setHoveredIrcaTaluk(null)}
                                  role="menuitem"
                                  tabIndex={0}
                                >
                                  {center}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              if (item.dropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    ref={districtsDropdownRef}
                    onMouseEnter={handleDistrictsMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <button
                      ref={districtsButtonRef}
                      onClick={handleDistrictsClick}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        dropdownOpen ? 'text-primary bg-primary/10' : 'hover:text-primary hover:bg-primary/5'
                      }`}
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                      aria-label="Districts dropdown"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="fixed inset-0 z-40">
                        {/* Level 1: Districts - Scrollable */}
                        <div
                          className="absolute w-64 bg-white rounded-lg shadow-xl border z-50 p-2 max-h-96 overflow-y-auto"
                          style={{ top: districtsDropdownPos.top, left: districtsDropdownPos.left }}
                          role="menu"
                          aria-label="Districts"
                          onMouseEnter={keepOpen}
                          onMouseLeave={handleDropdownMouseLeave}
                        >
                          {item.districts?.map((district) => (
                            <button
                              key={district.name}
                              ref={(el) => { districtRefs.current[district.name] = el; }}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                hoveredDistrict === district.name
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'hover:bg-primary/5'
                              }`}
                              onMouseEnter={() => {
                                keepOpen();
                                setHoveredDistrict(district.name);
                                setHoveredTaluka(null);
                                setHoveredVillage(null);
                              }}
                              role="menuitem"
                              tabIndex={0}
                            >
                              {district.name}
                            </button>
                          ))}
                        </div>

                        {/* Level 2: Talukas - Scrollable */}
                        {hoveredDistrict && positions.district.left > 0 && (
                          <div
                            className="absolute bg-white rounded-lg shadow-xl border z-50 p-2 w-64 max-h-96 overflow-y-auto"
                            style={{
                              top: Math.min(positions.district.top, window.innerHeight - 400),
                              left: positions.district.left
                            }}
                            onMouseEnter={keepOpen}
                            onMouseLeave={handleDropdownMouseLeave}
                            role="menu"
                            aria-label={`Talukas in ${hoveredDistrict}`}
                          >
                            {item.districts?.find((d: any) => d.name === hoveredDistrict)?.talukas.map((taluka: any) => (
                              <button
                                key={taluka.name}
                                ref={(el) => { talukaRefs.current[taluka.name] = el; }}
                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                  hoveredTaluka === taluka.name
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-primary/5'
                                }`}
                                onMouseEnter={() => {
                                  keepOpen();
                                  setHoveredTaluka(taluka.name);
                                  setHoveredVillage(null);
                                }}
                                role="menuitem"
                                tabIndex={0}
                              >
                                {taluka.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Level 3: Villages - Scrollable */}
                        {hoveredTaluka && positions.taluka.left > 0 && (
                          <div
                            className="absolute bg-white rounded-lg shadow-xl border z-50 p-2 w-64 max-h-96 overflow-y-auto"
                            style={{
                              top: Math.min(positions.taluka.top, window.innerHeight - 400),
                              left: positions.taluka.left
                            }}
                            onMouseEnter={keepOpen}
                            onMouseLeave={handleDropdownMouseLeave}
                            role="menu"
                            aria-label={`Villages in ${hoveredTaluka}`}
                          >
                            {item.districts
                              ?.find((d: any) => d.name === hoveredDistrict)
                              ?.talukas.find((t: any) => t.name === hoveredTaluka)
                              ?.villages.filter(hasFacilities)
                              .map((village: any) => (
                                <button
                                  key={village.name}
                                  ref={(el) => { villageRefs.current[village.name] = el; }}
                                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                    hoveredVillage === village.name
                                      ? 'bg-primary/10 text-primary font-semibold'
                                      : 'hover:bg-primary/5'
                                  }`}
                                  onMouseEnter={() => {
                                    keepOpen();
                                    setHoveredVillage(village.name);
                                  }}
                                  role="menuitem"
                                  tabIndex={0}
                                >
                                  {village.name}
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Level 4: Services - Always Fully Visible */}
                        {hoveredVillage && positions.village.left > 0 && (
                          <div
                            className="absolute bg-white rounded-lg shadow-xl border z-50 p-3 w-64 max-h-96 overflow-y-auto"
                            style={{
                              top: Math.min(positions.village.top, window.innerHeight - 500),
                              left: Math.min(positions.village.left, window.innerWidth - 280),
                              maxHeight: window.innerHeight - 100
                            }}
                            onMouseEnter={keepOpen}
                            onMouseLeave={handleDropdownMouseLeave}
                            role="menu"
                            aria-label={`Services in ${hoveredVillage}`}
                          >
                            {(() => {
                              const villageData = item.districts
                                ?.find((d: any) => d.name === hoveredDistrict)
                                ?.talukas.find((t: any) => t.name === hoveredTaluka)
                                ?.villages.find((v: any) => v.name === hoveredVillage);
                              if (!villageData) return null;

                              const district = hoveredDistrict!;
                              const taluka = hoveredTaluka!;
                              const village = hoveredVillage!;

                              return (
                                <div className="space-y-3">
                                  <div className="font-semibold text-primary text-center border-b pb-2">{village}</div>

                                  {/* IRCA */}
                                  {(villageData.facilities.governmentIRCA > 0 || villageData.facilities.privateIRCA > 0) && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-semibold text-muted-foreground uppercase">IRCA Centers</div>
                                      {villageData.facilities.governmentIRCA > 0 && (
                                        <Link
                                          to={`/centers/government?district=${district}&taluka=${taluka}&village=${village}`}
                                          className="flex justify-between text-green-600 hover:bg-green-50 px-3 py-2 rounded"
                                          onClick={closeAll}
                                        >
                                          <span>Government</span>
                                          <Badge className="bg-green-100 text-green-800">{villageData.facilities.governmentIRCA}</Badge>
                                        </Link>
                                      )}
                                      {villageData.facilities.privateIRCA > 0 && (
                                        <Link
                                          to={`/centers/private?district=${district}&taluka=${taluka}&village=${village}`}
                                          className="flex justify-between text-blue-600 hover:bg-blue-50 px-3 py-2 rounded"
                                          onClick={closeAll}
                                        >
                                          <span>Private</span>
                                          <Badge className="bg-blue-100 text-blue-800">{villageData.facilities.privateIRCA}</Badge>
                                        </Link>
                                      )}
                                    </div>
                                  )}

                                  {/* Hospitals */}
                                  {(villageData.facilities.governmentHospital > 0 || villageData.facilities.privateHospital > 0) && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-semibold text-muted-foreground uppercase">Hospitals</div>
                                      {villageData.facilities.governmentHospital > 0 && (
                                        <Link
                                          to={`/hospitals/government?district=${district}&taluka=${taluka}&village=${village}`}
                                          className="flex justify-between text-green-600 hover:bg-green-50 px-3 py-2 rounded"
                                          onClick={closeAll}
                                        >
                                          <span>Government</span>
                                          <Badge className="bg-green-100 text-green-800">{villageData.facilities.governmentHospital}</Badge>
                                        </Link>
                                      )}
                                      {villageData.facilities.privateHospital > 0 && (
                                        <Link
                                          to={`/hospitals/private?district=${district}&taluka=${taluka}&village=${village}`}
                                          className="flex justify-between text-orange-600 hover:bg-orange-50 px-3 py-2 rounded"
                                          onClick={closeAll}
                                        >
                                          <span>Private</span>
                                          <Badge className="bg-orange-100 text-orange-800">{villageData.facilities.privateHospital}</Badge>
                                        </Link>
                                      )}
                                    </div>
                                  )}

                                  {/* Psychiatrists */}
                                  {villageData.facilities.psychiatrist > 0 && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-semibold text-muted-foreground uppercase">Psychiatrists</div>
                                      <Link
                                        to={`/psychiatrists?district=${district}&taluka=${taluka}&village=${village}`}
                                        className="flex justify-between text-purple-600 hover:bg-purple-50 px-3 py-2 rounded"
                                        onClick={closeAll}
                                      >
                                        <span>Available</span>
                                        <Badge className="bg-purple-100 text-purple-800">{villageData.facilities.psychiatrist}</Badge>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Authentication Navigation */}
          <div className="hidden lg:flex items-center space-x-2 ml-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === '/profile'
                      ? 'text-primary bg-primary/10'
                      : 'hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await logout();
                      navigate('/');
                    } catch (err) {
                      console.error('Logout error:', err);
                    }
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              authNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === item.href
                        ? 'text-primary bg-primary/10'
                        : 'hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })
            )}
          </div>

          {/* Emergency & Mobile */}
          <div className="hidden xl:flex items-center space-x-4 ml-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-warning/10 rounded-lg">
              <Phone className="h-5 w-5 text-warning" />
              <div>
                <span className="text-xs text-muted-foreground">Emergency</span>
                <span className="text-sm font-bold text-warning block">1800-XXX-XXXX</span>
              </div>
            </div>
            <Badge variant="warning">24/7</Badge>
          </div>

          <div className="lg:hidden mr-2">
            <Button size="sm" className="bg-warning hover:bg-warning/90 text-white">
              <Phone className="h-4 w-4 mr-1" /> Help
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w--6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1 border-t">
            {navigation.map((item) => {
              const Icon = item.icon;
              if (item.dropdown) {
                return (
                  <div key={item.name} className="px-3 py-2 text-base font-medium text-muted-foreground">
                    <Icon className="h-5 w-5 inline mr-2" />
                    {item.name}
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile Auth Navigation */}
            {user ? (
              <div className="px-2 pt-2 pb-3 space-y-1 border-t mt-2">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  My Profile
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await logout();
                      setIsMobileMenuOpen(false);
                      navigate('/');
                    } catch (err) {
                      console.error('Logout error:', err);
                    }
                  }}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 w-full text-left"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 pt-2 pb-3 space-y-1 border-t mt-2">
                {authNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;