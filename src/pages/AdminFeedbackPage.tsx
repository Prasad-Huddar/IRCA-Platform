import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { 
  getAllFeedback, 
  updateFeedbackStatus, 
  getFeedbackStats, 
  Feedback 
} from '../services/feedbackService';
import {
  MessageSquare,
  AlertTriangle,
  Heart,
  Lightbulb,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  Download
} from 'lucide-react';

const AdminFeedbackPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    closed: 0,
    byType: {} as Record<string, number>
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');

  // Load feedback data
  useEffect(() => {
    loadFeedback();
    loadStats();
  }, []);

  // Filter feedback based on search and filters
  useEffect(() => {
    let filtered = feedback;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.feedback_type === typeFilter);
    }

    setFilteredFeedback(filtered);
  }, [feedback, searchTerm, statusFilter, typeFilter]);

  const loadFeedback = async () => {
    try {
      const data = await getAllFeedback();
      setFeedback(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getFeedbackStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: Feedback['status']) => {
    try {
      const success = await updateFeedbackStatus(feedbackId, newStatus, adminNotes);
      if (success) {
        await loadFeedback();
        await loadStats();
        setSelectedFeedback(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'feedback': return MessageSquare;
      case 'complaint': return AlertTriangle;
      case 'testimonial': return Heart;
      case 'suggestion': return Lightbulb;
      case 'appreciation': return Star;
      default: return MessageSquare;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = [
      'Reference ID', 'Name', 'Email', 'Phone', 'Type', 'Subject', 
      'Status', 'Created At', 'Anonymous', 'Testimonial Consent'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredFeedback.map(item => [
        item.reference_id,
        item.name,
        item.email,
        item.phone,
        item.feedback_type,
        `"${item.subject.replace(/"/g, '""')}"`,
        item.status,
        new Date(item.created_at).toLocaleString(),
        item.anonymous,
        item.testimonial_consent
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600 mt-1">View and manage user feedback submissions</p>
            </div>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviewed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feedback">General Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="testimonial">Success Story</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Submissions ({filteredFeedback.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFeedback.map((item) => {
                    const Icon = getFeedbackIcon(item.feedback_type);
                    return (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {item.feedback_type.charAt(0).toUpperCase() + item.feedback_type.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{item.reference_id}</span>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">{item.subject}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-gray-500">
                                {item.anonymous ? 'Anonymous' : item.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredFeedback.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No feedback found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Details */}
          <div className="lg:col-span-1">
            {selectedFeedback ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = getFeedbackIcon(selectedFeedback.feedback_type);
                      return <Icon className="h-5 w-5" />;
                    })()}
                    Feedback Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reference ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedFeedback.reference_id}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedFeedback.status)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <p className="text-sm text-gray-900">
                      {selectedFeedback.anonymous ? 'Anonymous' : selectedFeedback.name}
                    </p>
                    <p className="text-sm text-gray-600">{selectedFeedback.email}</p>
                    <p className="text-sm text-gray-600">{selectedFeedback.phone}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-sm text-gray-900">{selectedFeedback.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
                  </div>

                  {selectedFeedback.testimonial_consent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✓ User consented to this being used as a testimonial
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this feedback..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    {selectedFeedback.status !== 'reviewed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'reviewed')}
                      >
                        Mark as Reviewed
                      </Button>
                    )}
                    {selectedFeedback.status !== 'resolved' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                    {selectedFeedback.status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedFeedback.id, 'closed')}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a feedback item to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
