import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "../components/ui/accordion";
import {
 Search,
 Download,
 ExternalLink,
 BookOpen,
 HelpCircle,
 Phone,
 FileText,
 Users,
 Shield,
 Heart,
 AlertCircle
} from 'lucide-react';

interface FAQItem {
 id: string;
 question: string;
 answer: string;
 category: string;
}

interface ResourceItem {
 id: number;
 title: string;
 description: string;
 type: 'PDF' | 'Link' | 'Document';
 url?: string;
 downloadUrl?: string;
 category: string;
}

const faqData: FAQItem[] = [
 {
   id: 'faq-1',
   category: 'About IRCA Centers',
   question: 'What is an IRCA center?',
   answer: 'Integrated Rehabilitation Centre for Addicts (IRCA) centers are government-supported facilities that provide comprehensive treatment, rehabilitation, and support services for individuals struggling with substance abuse and addiction. These centers offer medical treatment, counseling, therapy, and aftercare support.'
 },
 {
   id: 'faq-2',
   category: 'About IRCA Centers',
   question: 'How many IRCA centers are there in Karnataka?',
   answer: 'Karnataka has 33 government-verified IRCA centers spread across all districts of the state, ensuring accessibility for people seeking help with addiction recovery.'
 },
 {
   id: 'faq-3',
   category: 'About IRCA Centers',
   question: 'Are IRCA centers free of cost?',
   answer: 'Most services at IRCA centers are either free or heavily subsidized by the government. Treatment costs are covered under various government schemes, though some premium services may have nominal charges.'
 },
 {
   id: 'faq-4',
   category: 'Treatment & Recovery',
   question: 'What types of treatment are available?',
   answer: 'IRCA centers offer comprehensive treatment including detoxification, medical management, individual and group counseling, therapy sessions, family support programs, and aftercare planning. Treatment approaches include evidence-based methods like Cognitive Behavioral Therapy (CBT), motivational interviewing, and 12-step programs.'
 },
 {
   id: 'faq-5',
   category: 'Treatment & Recovery',
   question: 'How long does treatment usually take?',
   answer: 'Treatment duration varies based on individual needs and addiction severity. Typical programs range from 28-day detoxification programs to 90-day comprehensive rehabilitation programs. Some centers also offer long-term aftercare support for up to a year or more.'
 },
 {
   id: 'faq-6',
   category: 'Treatment & Recovery',
   question: 'Is treatment confidential?',
   answer: 'Yes, all treatment at IRCA centers is completely confidential. Patient privacy is protected under medical confidentiality laws and government regulations. Information is only shared with explicit consent or in emergency situations.'
 },
 {
   id: 'faq-7',
   category: 'Government Schemes',
   question: 'What government schemes support addiction treatment?',
   answer: 'Several government schemes support addiction treatment including the National Action Plan for Drug Demand Reduction (NAPDDR), state health department initiatives, and various welfare programs. These schemes help cover treatment costs and provide rehabilitation support.'
 },
 {
   id: 'faq-8',
   category: 'Government Schemes',
   question: 'How can I access government financial assistance?',
   answer: 'Financial assistance can be accessed through various government schemes. Contact your local IRCA center or district health office for information about eligibility and application procedures. BPL card holders and economically weaker sections often receive priority support.'
 },
 {
   id: 'faq-9',
   category: 'Contact & Support',
   question: 'How do I contact an IRCA center?',
   answer: 'You can contact IRCA centers directly through the phone numbers provided on our platform, visit the center in person, or use the emergency helpline 1800-XXX-XXXX for immediate assistance. All centers have 24/7 emergency support available.'
 },
 {
   id: 'faq-10',
   category: 'Contact & Support',
   question: 'What should I do in case of an emergency?',
   answer: 'In case of a substance abuse emergency, immediately call the 24/7 helpline 1800-XXX-XXXX or take the person to the nearest IRCA center or hospital emergency department. Do not delay seeking help as timely intervention can be life-saving.'
 }
];

const resourcesData: ResourceItem[] = [
 {
   id: 1,
   title: 'National Action Plan for Drug Demand Reduction (NAPDDR)',
   description: 'Comprehensive government guidelines for drug demand reduction and rehabilitation services.',
   type: 'PDF',
   downloadUrl: '/resources/napddr-guidelines.pdf',
   category: 'Government Guidelines'
 },
 {
   id: 2,
   title: 'Ministry of Social Justice and Empowerment - Drug Prevention',
   description: 'Official website with resources and information about drug prevention programs.',
   type: 'Link',
   url: 'https://socialjustice.nic.in/',
   category: 'Government Resources'
 },
 {
   id: 3,
   title: 'Karnataka State Drug Control Department',
   description: 'State-level resources and regulations for drug control and rehabilitation.',
   type: 'Link',
   url: 'https://karnataka.gov.in/drugcontrol',
   category: 'Government Resources'
 },
 {
   id: 4,
   title: 'Treatment Protocols for Substance Use Disorders',
   description: 'Standard treatment protocols and best practices for addiction treatment.',
   type: 'PDF',
   downloadUrl: '/resources/treatment-protocols.pdf',
   category: 'Medical Guidelines'
 },
 {
   id: 5,
   title: 'Family Support Guide for Addiction Recovery',
   description: 'Comprehensive guide for families supporting loved ones through recovery.',
   type: 'PDF',
   downloadUrl: '/resources/family-support-guide.pdf',
   category: 'Support Materials'
 },
 {
   id: 6,
   title: 'List of Approved Medications for Addiction Treatment',
   description: 'Approved medications and treatment options for various substance use disorders.',
   type: 'Document',
   downloadUrl: '/resources/approved-medications.pdf',
   category: 'Medical Guidelines'
 }
];

const categories = ['All', 'About IRCA Centers', 'Treatment & Recovery', 'Government Schemes', 'Contact & Support'];

const FAQPage = () => {
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('All');
 const [activeResourceTab, setActiveResourceTab] = useState('faqs');

 const filteredFAQs = faqData.filter(faq => {
   const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
   const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
   return matchesSearch && matchesCategory;
 });

 const getCategoryIcon = (category: string) => {
   switch (category) {
     case 'About IRCA Centers': return Users;
     case 'Treatment & Recovery': return Heart;
     case 'Government Schemes': return Shield;
     case 'Contact & Support': return Phone;
     default: return HelpCircle;
   }
 };

 const getResourceIcon = (type: string) => {
   switch (type) {
     case 'PDF': return FileText;
     case 'Link': return ExternalLink;
     case 'Document': return BookOpen;
     default: return FileText;
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
             ❓ Help & Support
           </Badge>
           <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
             FAQ & Resources
           </h1>
           <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light">
             Find answers to common questions about IRCA centers, treatment options,
             government schemes, and access helpful resources for addiction recovery.
           </p>
           <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl font-semibold px-8">
               <HelpCircle className="mr-2 h-5 w-5" />
               Browse FAQs
             </Button>
             <Button size="lg" className="glass text-white hover:bg-white/20 border border-white/40 font-semibold px-8">
               <BookOpen className="mr-2 h-5 w-5" />
               View Resources
             </Button>
           </div>
         </div>
       </div>
     </section>

     {/* Search and Filters */}
     <section className="py-16 bg-white">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <Card className="mb-10 border-2 border-border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
           <CardContent className="p-8 lg:p-10 relative">
             <div className="mb-8">
               <h3 className="text-3xl font-heading font-bold text-primary mb-3">Search Knowledge Base</h3>
               <p className="text-lg text-muted-foreground">Find answers quickly by searching or filtering by category</p>
             </div>
             <div className="flex flex-col md:flex-row gap-6 mb-6">
               <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/50 group-focus-within:text-primary transition-colors z-10" />
                 <input
                   type="text"
                   placeholder="Search FAQs and resources..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium shadow-sm hover:shadow-md bg-white"
                 />
               </div>
             </div>
             <div className="flex gap-3 overflow-x-auto pb-2">
               {categories.map((category) => (
                 <Button
                   key={category}
                   variant={selectedCategory === category ? "default" : "outline"}
                   size="lg"
                   onClick={() => setSelectedCategory(category)}
                   className={`whitespace-nowrap font-semibold transition-all duration-300 ${
                     selectedCategory === category 
                       ? 'btn-primary shadow-lg' 
                       : 'border-2 hover:border-primary hover:bg-primary/5'
                   }`}
                 >
                   {category}
                 </Button>
               ))}
             </div>
           </CardContent>
         </Card>

         {/* FAQ and Resources Tabs */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Sidebar */}
           <div className="lg:col-span-1">
             <Card className="sticky top-8 border-2 border-border shadow-lg">
               <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                 <CardTitle className="text-xl font-heading">Quick Access</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3 pt-6">
                 <Button
                   variant={activeResourceTab === 'faqs' ? 'default' : 'ghost'}
                   className={`w-full justify-start font-semibold transition-all ${
                     activeResourceTab === 'faqs' 
                       ? 'btn-primary shadow-md' 
                       : 'hover:bg-primary/10'
                   }`}
                   onClick={() => setActiveResourceTab('faqs')}
                 >
                   <HelpCircle className="mr-3 h-5 w-5" />
                   FAQs
                 </Button>
                 <Button
                   variant={activeResourceTab === 'resources' ? 'default' : 'ghost'}
                   className={`w-full justify-start font-semibold transition-all ${
                     activeResourceTab === 'resources' 
                       ? 'btn-primary shadow-md' 
                       : 'hover:bg-primary/10'
                   }`}
                   onClick={() => setActiveResourceTab('resources')}
                 >
                   <BookOpen className="mr-3 h-5 w-5" />
                   Resources
                 </Button>
                 <div className="pt-4 border-t border-border">
                   <Button
                     variant="outline"
                     className="w-full justify-start border-2 hover:bg-warning/10 hover:border-warning font-semibold"
                   >
                     <Phone className="mr-3 h-5 w-5 text-warning" />
                     Emergency
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </div>

           {/* Main Content */}
           <div className="lg:col-span-3">
             {activeResourceTab === 'faqs' ? (
               <Card className="border-2 border-border shadow-xl">
                 <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b border-border">
                   <CardTitle className="flex items-center text-2xl font-heading">
                     <HelpCircle className="mr-3 h-6 w-6 text-primary" />
                     Frequently Asked Questions
                   </CardTitle>
                   <p className="text-muted-foreground mt-2">
                     Browse through our comprehensive FAQ section to find answers to common questions
                   </p>
                 </CardHeader>
                 <CardContent className="p-8">
                   {filteredFAQs.length === 0 ? (
                     <div className="text-center py-20">
                       <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6 animate-pulse">
                         <HelpCircle className="h-12 w-12 text-primary" />
                       </div>
                       <h3 className="text-3xl font-heading font-bold text-foreground mb-4">No FAQs found</h3>
                       <p className="text-xl text-muted-foreground max-w-md mx-auto">
                         Try adjusting your search terms or category filter.
                       </p>
                     </div>
                   ) : (
                     <Accordion type="single" collapsible className="w-full space-y-4">
                       {filteredFAQs.map((faq, index) => {
                         const Icon = getCategoryIcon(faq.category);
                         return (
                           <AccordionItem 
                             key={faq.id} 
                             value={faq.id}
                             className="border-2 border-border rounded-xl px-6 hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
                             style={{ animationDelay: `${index * 50}ms` }}
                           >
                             <AccordionTrigger className="text-left hover:no-underline py-6">
                               <div className="flex items-start space-x-4 w-full">
                                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                   <Icon className="h-6 w-6 text-primary" />
                                 </div>
                                 <div className="flex-1">
                                   <Badge className="badge-primary mb-2 text-xs">
                                     {faq.category}
                                   </Badge>
                                   <div className="font-semibold text-lg text-foreground">
                                     {faq.question}
                                   </div>
                                 </div>
                               </div>
                             </AccordionTrigger>
                             <AccordionContent>
                               <div className="pl-16 pr-4 pb-4">
                                 <p className="text-muted-foreground leading-relaxed text-base">
                                   {faq.answer}
                                 </p>
                               </div>
                             </AccordionContent>
                           </AccordionItem>
                         );
                       })}
                     </Accordion>
                   )}
                 </CardContent>
               </Card>
             ) : (
               <Card className="border-2 border-border shadow-xl">
                 <CardHeader className="bg-gradient-to-br from-secondary/5 to-transparent border-b border-border">
                   <CardTitle className="flex items-center text-2xl font-heading">
                     <BookOpen className="mr-3 h-6 w-6 text-secondary" />
                     Resources & Documents
                   </CardTitle>
                   <p className="text-muted-foreground mt-2">
                     Download helpful resources, guidelines, and documents for addiction recovery
                   </p>
                 </CardHeader>
                 <CardContent className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {resourcesData.map((resource, index) => {
                       const Icon = getResourceIcon(resource.type);
                       return (
                         <Card 
                           key={resource.id} 
                           className="card-hover hover:shadow-2xl transition-all duration-300 border-2 border-border hover:border-secondary/30 overflow-hidden animate-fade-in-up relative"
                           style={{ animationDelay: `${index * 100}ms` }}
                         >
                           <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                           <CardHeader className="pb-4 relative">
                             <div className="flex items-start justify-between mb-3">
                               <div className="flex items-start space-x-3">
                                 <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                   <Icon className="h-6 w-6 text-secondary" />
                                 </div>
                                 <div className="flex-1">
                                   <Badge className="badge-secondary mb-2 text-xs">
                                     {resource.category}
                                   </Badge>
                                   <CardTitle className="text-lg font-heading leading-tight">
                                     {resource.title}
                                   </CardTitle>
                                 </div>
                               </div>
                               <Badge className={
                                 resource.type === 'PDF' ? 'badge-success' :
                                 resource.type === 'Link' ? 'badge-primary' : 'badge-warning'
                               }>
                                 {resource.type}
                               </Badge>
                             </div>
                           </CardHeader>
                           <CardContent className="relative">
                             <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                               {resource.description}
                             </p>
                             <Button
                               className={`w-full font-semibold shadow-md hover:shadow-lg transition-all ${
                                 resource.type === 'Link' 
                                   ? 'border-2 hover:bg-secondary/10 hover:border-secondary' 
                                   : 'btn-secondary'
                               }`}
                               size="lg"
                               variant={resource.type === 'Link' ? 'outline' : 'default'}
                               asChild={resource.type === 'Link'}
                             >
                               {resource.type === 'Link' ? (
                                 <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="mr-2 h-5 w-5" />
                                   Visit Resource
                                 </a>
                               ) : (
                                 <a href={resource.downloadUrl} download>
                                   <Download className="mr-2 h-5 w-5" />
                                   Download {resource.type}
                                 </a>
                               )}
                             </Button>
                           </CardContent>
                         </Card>
                       );
                     })}
                   </div>
                 </CardContent>
               </Card>
             )}
           </div>
         </div>

         {/* Emergency Contact Section */}
         <Card className="mt-12 bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30 shadow-2xl overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent"></div>
           <CardContent className="p-10 relative">
             <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
               <div className="flex-shrink-0">
                 <div className="w-20 h-20 bg-warning/20 rounded-2xl flex items-center justify-center animate-pulse">
                   <AlertCircle className="h-10 w-10 text-warning" />
                 </div>
               </div>
               <div className="flex-1">
                 <h3 className="text-3xl font-heading font-bold text-warning mb-3">
                   Need Immediate Help?
                 </h3>
                 <p className="text-lg text-foreground mb-6 leading-relaxed">
                   If you or someone you know needs immediate assistance, contact our 24/7 helpline.
                   Our trained professionals are ready to help.
                 </p>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                   <Button size="lg" className="bg-warning hover:bg-warning/90 text-white shadow-xl font-bold text-lg px-8">
                     <Phone className="mr-3 h-6 w-6" />
                     Call 1800-XXX-XXXX
                   </Button>
                   <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                     <span className="text-sm font-semibold text-foreground">
                       Available 24/7 • Confidential Support
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
     </section>
   </div>
 );
};

export default FAQPage;
