import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
 Calendar,
 MapPin,
 Clock,
 Users,
 ArrowRight,
 Filter,
 Search,
 ChevronLeft,
 ChevronRight
} from 'lucide-react';
import { ircaCenters, districts } from '../data/centers';

interface Event {
 id: number;
 title: string;
 date: string;
 time: string;
 district: string;
 centerId: number;
 type: 'Workshop' | 'Awareness Camp' | 'Counseling Session' | 'Support Group' | 'Training';
 description: string;
 attendees?: number;
 maxAttendees?: number;
 registrationRequired: boolean;
}

const eventTypes = ['Workshop', 'Awareness Camp', 'Counseling Session', 'Support Group', 'Training'];

const mockEvents: Event[] = [
 {
   id: 1,
   title: "Substance Abuse Prevention Workshop",
   date: "2024-01-15",
   time: "10:00 AM - 12:00 PM",
   district: "Bengaluru Urban",
   centerId: 7,
   type: "Workshop",
   description: "Educational workshop on substance abuse prevention strategies and early intervention methods for families and individuals.",
   attendees: 45,
   maxAttendees: 60,
   registrationRequired: true
 },
 {
   id: 2,
   title: "Recovery Support Group Meeting",
   date: "2024-01-18",
   time: "2:00 PM - 4:00 PM",
   district: "Mysuru",
   centerId: 3,
   type: "Support Group",
   description: "Weekly support group meeting for individuals in recovery and their families. Share experiences and gain strength from peers.",
   attendees: 23,
   maxAttendees: 30,
   registrationRequired: false
 },
 {
   id: 3,
   title: "Mental Health Awareness Camp",
   date: "2024-01-20",
   time: "9:00 AM - 5:00 PM",
   district: "Dakshina Kannada",
   centerId: 13,
   type: "Awareness Camp",
   description: "Comprehensive awareness camp covering mental health issues related to addiction, stress management, and coping strategies.",
   attendees: 120,
   maxAttendees: 150,
   registrationRequired: true
 },
 {
   id: 4,
   title: "Family Counseling Session",
   date: "2024-01-22",
   time: "3:00 PM - 5:00 PM",
   district: "Tumkur",
   centerId: 1,
   type: "Counseling Session",
   description: "Specialized counseling session for families dealing with addiction-related challenges. Learn effective communication and support techniques.",
   attendees: 18,
   maxAttendees: 25,
   registrationRequired: true
 },
 {
   id: 5,
   title: "Addiction Recovery Training Program",
   date: "2024-01-25",
   time: "10:00 AM - 4:00 PM",
   district: "Belagavi",
   centerId: 15,
   type: "Training",
   description: "Professional training program for healthcare workers and counselors on modern addiction recovery techniques and treatment methods.",
   attendees: 35,
   maxAttendees: 40,
   registrationRequired: true
 },
 {
   id: 6,
   title: "Youth Awareness Workshop",
   date: "2024-01-28",
   time: "11:00 AM - 1:00 PM",
   district: "Shivamogga",
   centerId: 6,
   type: "Workshop",
   description: "Interactive workshop designed for young adults to understand the risks of substance abuse and develop healthy coping mechanisms.",
   attendees: 55,
   maxAttendees: 70,
   registrationRequired: true
 }
];

const EventsPage = () => {
 const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
 const [selectedType, setSelectedType] = useState<string>('all');
 const [searchTerm, setSearchTerm] = useState('');
 const [currentMonth, setCurrentMonth] = useState(new Date());
 const [districts, setDistricts] = useState<string[]>([]);

 useEffect(() => {
   const fetchDistricts = async () => {
     try {
       const districtNames = await getDistrictNames();
       setDistricts(districtNames);
     } catch (error) {
       console.error('Error fetching districts:', error);
     }
   };
   fetchDistricts();
 }, []);

 const filteredEvents = mockEvents.filter(event => {
   const matchesDistrict = selectedDistrict === 'all' || event.district === selectedDistrict;
   const matchesType = selectedType === 'all' || event.type === selectedType;
   const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchTerm.toLowerCase());
   return matchesDistrict && matchesType && matchesSearch;
 });

 const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date());
 const pastEvents = filteredEvents.filter(event => new Date(event.date) < new Date());

 const formatDate = (dateString: string) => {
   const date = new Date(dateString);
   return date.toLocaleDateString('en-IN', {
     day: 'numeric',
     month: 'short',
     year: 'numeric'
   });
 };

 const getEventTypeColor = (type: string) => {
   switch (type) {
     case 'Workshop': return 'bg-primary';
     case 'Awareness Camp': return 'bg-success';
     case 'Counseling Session': return 'bg-warning';
     case 'Support Group': return 'bg-accent';
     case 'Training': return 'bg-muted';
     default: return 'bg-primary';
   }
 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      {/* Header */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 gradient-overlay"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="text-center animate-fade-in-up">
            <Badge className="glass text-white border border-white/40 font-semibold mb-6 px-4 py-2 text-sm">
              📅 Upcoming Events & Workshops
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
              Events & Workshops
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light">
              Join our educational events, workshops, and support groups designed to promote awareness,
              provide education, and support recovery across Karnataka.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl font-semibold px-8">
                <Calendar className="mr-2 h-5 w-5" />
                View Calendar
              </Button>
              <Button size="lg" className="glass text-white hover:bg-white/20 border border-white/40 font-semibold px-8">
                <Users className="mr-2 h-5 w-5" />
                Register for Event
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-10 border-2 border-border shadow-xl hover:shadow-2xl transition-all duration-300 card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
            <CardContent className="p-8 lg:p-10 relative">
              <div className="mb-8">
                <h3 className="text-3xl font-heading font-bold text-primary mb-3">Find Events</h3>
                <p className="text-lg text-muted-foreground">Filter events by location, type, or search by keyword</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50 group-focus-within:text-primary transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium shadow-sm hover:shadow-md bg-white"
                  />
                </div>

                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="h-14 border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-14 border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-all">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="btn-primary font-semibold shadow-lg hover:shadow-xl h-14 text-base transition-all duration-300 hover:scale-105">
                  <Filter className="mr-2 h-5 w-5" />
                  Apply Filters
                </Button>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <p className="text-base font-semibold text-foreground">
                    Showing <span className="font-bold text-primary text-lg">{filteredEvents.length}</span> of <span className="font-bold text-primary text-lg">{mockEvents.length}</span> events
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="badge-primary">
                    {upcomingEvents.length} Upcoming
                  </Badge>
                  <Badge className="badge-secondary">
                    {pastEvents.length} Past
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

         {/* Upcoming Events */}
         <div className="mb-20">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
             <div>
               <div className="inline-block mb-3">
                 <Badge className="badge-primary text-sm px-4 py-1.5">Upcoming</Badge>
               </div>
               <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary mb-3">
                 Upcoming Events
               </h2>
               <p className="text-lg text-muted-foreground">Join us for these upcoming events and workshops</p>
             </div>
             <Badge className="badge-primary text-lg px-6 py-3 shadow-lg">
               {upcomingEvents.length} Events
             </Badge>
           </div>
           {upcomingEvents.length === 0 ? (
             <Card className="border-2 border-border shadow-xl">
               <CardContent className="p-20 text-center">
                 <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6 animate-pulse">
                   <Calendar className="h-12 w-12 text-primary" />
                 </div>
                 <h3 className="text-3xl font-heading font-bold text-foreground mb-4">No upcoming events</h3>
                 <p className="text-xl text-muted-foreground max-w-md mx-auto">
                   Check back later for new events and workshops in your area.
                 </p>
                 <Button className="btn-primary mt-8" size="lg">
                   <Calendar className="mr-2 h-5 w-5" />
                   Subscribe to Updates
                 </Button>
               </CardContent>
             </Card>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {upcomingEvents.map((event, index) => (
                 <Card key={event.id} className="group card-hover hover:shadow-2xl transition-all duration-300 border-2 border-border hover:border-primary/30 overflow-hidden animate-fade-in-up relative" style={{ animationDelay: `${index * 100}ms` }}>
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   <CardHeader className="pb-4 relative">
                     <div className="flex items-start justify-between mb-3 gap-2">
                       <Badge className={`${getEventTypeColor(event.type)} text-white font-semibold px-3 py-1.5 shadow-md`}>
                         {event.type}
                       </Badge>
                       <Badge className="badge-secondary">{event.district}</Badge>
                     </div>
                     <CardTitle className="text-xl font-heading text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
                       {event.title}
                     </CardTitle>
                   </CardHeader>

                   <CardContent className="space-y-5 relative">
                     <div className="space-y-3 text-sm text-muted-foreground bg-background/50 rounded-lg p-4">
                       <div className="flex items-center font-medium">
                         <Calendar className="mr-3 h-5 w-5 text-primary" />
                         {formatDate(event.date)}
                       </div>
                       <div className="flex items-center font-medium">
                         <Clock className="mr-3 h-5 w-5 text-primary" />
                         {event.time}
                       </div>
                       <div className="flex items-center font-medium">
                         <MapPin className="mr-3 h-5 w-5 text-primary" />
                         {event.district}
                       </div>
                     </div>

                     <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                       {event.description}
                     </p>

                     {event.attendees && event.maxAttendees && (
                       <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
                         <div className="flex items-center justify-between text-sm font-medium">
                           <div className="flex items-center text-foreground">
                             <Users className="mr-2 h-4 w-4 text-primary" />
                             {event.attendees}/{event.maxAttendees} attending
                           </div>
                           <span className="text-primary font-bold">
                             {Math.round((event.attendees / event.maxAttendees) * 100)}%
                           </span>
                         </div>
                         <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                           <div
                             className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500"
                             style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                           ></div>
                         </div>
                       </div>
                     )}

                     <div className="flex space-x-3 pt-3">
                       <Button className="flex-1 btn-primary font-semibold shadow-md hover:shadow-lg group-hover:scale-105 transition-all">
                         {event.registrationRequired ? 'Register Now' : 'Learn More'}
                         <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                       </Button>
                       <Button variant="outline" size="icon" className="border-2 hover:bg-primary/10 hover:border-primary transition-all">
                         <Calendar className="h-5 w-5" />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
         </div>

         {/* Past Events */}
         {pastEvents.length > 0 && (
           <div className="pt-12 border-t border-border">
             <div className="mb-10">
               <div className="inline-block mb-3">
                 <Badge className="badge-secondary text-sm px-4 py-1.5">Past Events</Badge>
               </div>
               <h2 className="text-4xl font-heading font-bold text-primary mb-3">
                 Past Events
               </h2>
               <p className="text-lg text-muted-foreground">View summaries of our previous events and workshops</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {pastEvents.map((event, index) => (
                 <Card key={event.id} className="opacity-80 hover:opacity-100 transition-all duration-300 hover:shadow-lg border-2 border-border" style={{ animationDelay: `${index * 100}ms` }}>
                   <CardHeader className="pb-4">
                     <div className="flex items-start justify-between mb-3 gap-2">
                       <Badge className="bg-muted text-muted-foreground font-semibold px-3 py-1.5">
                         {event.type}
                       </Badge>
                       <Badge className="badge-secondary">{event.district}</Badge>
                     </div>
                     <CardTitle className="text-xl font-heading text-primary line-clamp-2">
                       {event.title}
                     </CardTitle>
                   </CardHeader>

                   <CardContent className="space-y-5">
                     <div className="space-y-3 text-sm text-muted-foreground bg-background/50 rounded-lg p-4">
                       <div className="flex items-center font-medium">
                         <Calendar className="mr-3 h-5 w-5 text-muted" />
                         {formatDate(event.date)}
                       </div>
                       <div className="flex items-center font-medium">
                         <Clock className="mr-3 h-5 w-5 text-muted" />
                         {event.time}
                       </div>
                     </div>

                     <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                       {event.description}
                     </p>

                     <Button variant="outline" className="w-full border-2 hover:bg-primary/5 hover:border-primary font-semibold transition-all">
                       View Summary
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         )}
       </div>
     </section>
   </div>
 );
};

export default EventsPage;
