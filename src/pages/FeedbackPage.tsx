import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { submitFeedback, FeedbackSubmission } from '../services/feedbackService';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Heart,
  AlertTriangle,
  Lightbulb,
  Star
} from 'lucide-react';

const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  feedbackType: z.string().min(1, 'Please select a feedback type'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  testimonialConsent: z.boolean().optional(),
  anonymous: z.boolean().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackPage = () => {
 const [isSubmitted, setIsSubmitted] = useState(false);
 const [referenceId, setReferenceId] = useState('');

 const form = useForm<FeedbackFormData>({
   resolver: zodResolver(feedbackSchema),
   defaultValues: {
     name: '',
     email: '',
     phone: '',
     feedbackType: '',
     subject: '',
     message: '',
     testimonialConsent: false,
     anonymous: false,
   },
 });

 const feedbackTypes = [
   { value: 'feedback', label: 'General Feedback', icon: MessageSquare, description: 'Share your thoughts and suggestions' },
   { value: 'complaint', label: 'Complaint', icon: AlertTriangle, description: 'Report an issue or concern' },
   { value: 'testimonial', label: 'Success Story', icon: Heart, description: 'Share your recovery journey' },
   { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, description: 'Propose improvements' },
   { value: 'appreciation', label: 'Appreciation', icon: Star, description: 'Express gratitude or praise' },
 ];

 const onSubmit = async (data: FeedbackFormData) => {
   try {
     // Prepare feedback data for submission
     const feedbackData: FeedbackSubmission = {
       name: data.anonymous ? 'Anonymous' : data.name,
       email: data.anonymous ? 'anonymous@irca.karnataka.gov.in' : data.email,
       phone: data.anonymous ? '0000000000' : data.phone,
       feedbackType: data.feedbackType,
       subject: data.subject,
       message: data.message,
       testimonialConsent: data.testimonialConsent,
       anonymous: data.anonymous
     };

     // Submit feedback to backend
     const result = await submitFeedback(feedbackData);

     if (result.success && result.referenceId) {
       setReferenceId(result.referenceId);
       setIsSubmitted(true);
     } else {
       console.error('Feedback submission failed:', result.error);
       // You could show an error message to the user here
       alert('Failed to submit feedback. Please try again later.');
     }
   } catch (error) {
     console.error('Error submitting feedback:', error);
     alert('An unexpected error occurred. Please try again later.');
   }
 };

 const resetForm = () => {
   setIsSubmitted(false);
   setReferenceId('');
   form.reset();
 };

 if (isSubmitted) {
 return (
 <div className="min-h-screen bg-gradient-to-b from-background to-white flex items-center justify-center py-16">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <Card className="text-center border-2 border-border shadow-2xl overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent"></div>
 <CardContent className="p-16 relative">
 <div className="w-24 h-24 bg-gradient-to-br from-success/30 to-success/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-scale-in">
 <CheckCircle className="h-12 w-12 text-success" />
 </div>
 
 <h1 className="text-4xl lg:text-5xl font-heading font-bold text-primary mb-6">
 Thank You for Your Feedback!
 </h1>
 
 <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
 Your feedback has been successfully submitted. We truly appreciate you taking the time
 to share your thoughts with us.
 </p>
 
 <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-8 mb-10 shadow-lg">
 <p className="text-sm font-semibold text-muted-foreground mb-3">Reference ID:</p>
 <p className="font-mono font-bold text-primary text-2xl mb-2">{referenceId}</p>
 <p className="text-sm text-muted-foreground">
 Please save this reference ID for your records
 </p>
 </div>

             <div className="space-y-6 mb-10">
             <p className="text-lg font-semibold text-foreground">
             What happens next?
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
             <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border-2 border-border shadow-md">
             <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
             <div className="w-3 h-3 bg-primary rounded-full"></div>
             </div>
             <div>
             <p className="font-bold text-foreground mb-2">Review</p>
             <p className="text-sm text-muted-foreground">We'll review your feedback within 24 hours</p>
             </div>
             </div>
             <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border-2 border-border shadow-md">
             <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
             <div className="w-3 h-3 bg-secondary rounded-full"></div>
             </div>
             <div>
             <p className="font-bold text-foreground mb-2">Action</p>
             <p className="text-sm text-muted-foreground">We'll take appropriate action if needed</p>
             </div>
             </div>
             <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border-2 border-border shadow-md">
             <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
             <div className="w-3 h-3 bg-success rounded-full"></div>
             </div>
             <div>
             <p className="font-bold text-foreground mb-2">Follow-up</p>
             <p className="text-sm text-muted-foreground">We'll contact you if more information is needed</p>
             </div>
             </div>
             </div>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button onClick={resetForm} size="lg" className="btn-primary font-semibold shadow-lg px-8">
             Submit Another Feedback
             </Button>
             <Button variant="outline" size="lg" className="border-2 hover:bg-primary/5 hover:border-primary font-semibold px-8" asChild>
             <a href="/">Back to Home</a>
             </Button>
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }

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
             💬 Get in Touch
           </Badge>
           <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
             Contact & Feedback
           </h1>
           <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light">
             We value your feedback and are here to help. Share your thoughts, suggestions,
             or concerns to help us improve our services.
           </p>
           <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl font-semibold px-8">
               <MessageSquare className="mr-2 h-5 w-5" />
               Share Feedback
             </Button>
             <Button size="lg" className="glass text-white hover:bg-white/20 border border-white/40 font-semibold px-8">
               <Phone className="mr-2 h-5 w-5" />
               Emergency Contact
             </Button>
           </div>
         </div>
       </div>
     </section>

     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Contact Information */}
         <div className="lg:col-span-1 space-y-6">
           <Card className="border-2 border-border shadow-xl card-hover">
             <CardHeader className="bg-gradient-to-br from-warning/10 to-transparent border-b border-border">
               <CardTitle className="flex items-center text-xl font-heading">
                 <Phone className="mr-3 h-6 w-6 text-warning" />
                 Emergency Contacts
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 pt-6">
               <div className="bg-gradient-to-br from-warning/20 to-warning/10 border-2 border-warning/30 rounded-xl p-6 shadow-lg">
                 <div className="flex items-center space-x-3 mb-3">
                   <div className="w-10 h-10 bg-warning/30 rounded-lg flex items-center justify-center">
                     <Phone className="h-6 w-6 text-warning" />
                   </div>
                   <span className="font-bold text-warning text-lg">24/7 Helpline</span>
                 </div>
                 <p className="text-2xl font-bold text-warning mb-2">1800-XXX-XXXX</p>
                 <p className="text-sm text-foreground font-medium">For immediate assistance</p>
               </div>

               <div className="space-y-4">
                 <div className="flex items-start space-x-4 p-3 bg-primary/5 rounded-lg">
                   <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                     <Mail className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">Email Support</p>
                     <p className="text-sm text-muted-foreground">support@irca.karnataka.gov.in</p>
                   </div>
                 </div>
                 <div className="flex items-start space-x-4 p-3 bg-primary/5 rounded-lg">
                   <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                     <MapPin className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">Address</p>
                     <p className="text-sm text-muted-foreground">Department of Health and Family Welfare<br />Government of Karnataka</p>
                   </div>
                 </div>
                 <div className="flex items-start space-x-4 p-3 bg-success/5 rounded-lg">
                   <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                     <Clock className="h-5 w-5 text-success" />
                   </div>
                   <div>
                     <p className="font-semibold text-foreground">Response Time</p>
                     <p className="text-sm text-muted-foreground">Within 24 hours</p>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="border-2 border-border shadow-xl">
             <CardHeader className="bg-gradient-to-br from-secondary/10 to-transparent border-b border-border">
               <CardTitle className="text-xl font-heading">Feedback Types</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="space-y-3">
                 {feedbackTypes.map((type) => {
                   const Icon = type.icon;
                   return (
                     <div key={type.value} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-secondary/5 transition-all duration-300 border border-transparent hover:border-secondary/20">
                       <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                         <Icon className="h-5 w-5 text-secondary" />
                       </div>
                       <div>
                         <p className="font-semibold text-foreground">{type.label}</p>
                         <p className="text-xs text-muted-foreground">{type.description}</p>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Feedback Form */}
         <div className="lg:col-span-2">
           <Card className="border-2 border-border shadow-2xl">
             <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b border-border">
               <CardTitle className="flex items-center text-2xl font-heading">
                 <MessageSquare className="mr-3 h-6 w-6 text-primary" />
                 Share Your Feedback
               </CardTitle>
               <p className="text-muted-foreground mt-2">
                 Your feedback helps us improve our services and better serve the community
               </p>
             </CardHeader>
             <CardContent className="p-8">
               <Form {...form}>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="name"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Full Name *</FormLabel>
                           <FormControl>
                             <Input placeholder="Enter your full name" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="email"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Email Address *</FormLabel>
                           <FormControl>
                             <Input placeholder="your.email@example.com" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="phone"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Phone Number *</FormLabel>
                           <FormControl>
                             <Input placeholder="+91 XXXXX XXXXX" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="feedbackType"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Feedback Type *</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Select feedback type" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {feedbackTypes.map((type) => (
                                 <SelectItem key={type.value} value={type.value}>
                                   {type.label}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>

                   <FormField
                     control={form.control}
                     name="subject"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Subject *</FormLabel>
                         <FormControl>
                           <Input placeholder="Brief description of your feedback" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   <FormField
                     control={form.control}
                     name="message"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Message *</FormLabel>
                         <FormControl>
                           <Textarea
                             placeholder="Please provide detailed information about your feedback, suggestion, or concern..."
                             className="min-h-32"
                             {...field}
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   <div className="space-y-4">
                     <FormField
                       control={form.control}
                       name="testimonialConsent"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                             />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                             <FormLabel className="text-sm">
                               I consent to my feedback being used as a testimonial (optional)
                             </FormLabel>
                             <p className="text-xs text-muted-foreground">
                               Your story can inspire others. We'll only use it with your explicit permission.
                             </p>
                           </div>
                         </FormItem>
                       )}
                     />

                     <FormField
                       control={form.control}
                       name="anonymous"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                             />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                             <FormLabel className="text-sm">
                               Submit anonymously (optional)
                             </FormLabel>
                             <p className="text-xs text-muted-foreground">
                               Your contact information will not be shared or displayed publicly.
                             </p>
                           </div>
                         </FormItem>
                       )}
                     />
                   </div>

                   <Button
                     type="submit"
                     className="w-full btn-primary font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                     size="lg"
                     disabled={form.formState.isSubmitting}
                   >
                     {form.formState.isSubmitting ? (
                       <>
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                         Submitting...
                       </>
                     ) : (
                       <>
                         <Send className="mr-3 h-5 w-5" />
                         Submit Feedback
                       </>
                     )}
                   </Button>
                 </form>
               </Form>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>
   </div>
 );
};

export default FeedbackPage;
