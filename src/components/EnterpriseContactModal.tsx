"use client";

import React, { useState } from 'react';
import { X, Building2, Mail, Phone, FileText, Shield, MessageSquare } from 'lucide-react';
import * as motion from "motion/react-client";

interface EnterpriseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomRequirements {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  teamSize: string;
  budget: string;
  timeline: string;
  requirements: string;
  integrations: string;
  compliance: string;
  additionalNotes: string;
}

export default function EnterpriseContactModal({ isOpen, onClose }: EnterpriseContactModalProps) {
  const [requirements, setRequirements] = useState<CustomRequirements>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    teamSize: '',
    budget: '',
    timeline: '',
    requirements: '',
    integrations: '',
    compliance: '',
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof CustomRequirements, value: string) => {
    setRequirements(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    const requiredFields: Array<keyof CustomRequirements> = ['companyName', 'contactName', 'email', 'phone', 'requirements'];
    const missingFields = requiredFields.filter(field => !requirements[field].trim());
    
    if (missingFields.length > 0) {
      setError('Please fill in all required fields.');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requirements.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const emailSubject = `Feature Request - ${requirements.companyName}`;
      const emailBody = `New Enterprise Inquiry\n\nCOMPANY INFORMATION:\n- Company Name: ${requirements.companyName}\n- Contact Name: ${requirements.contactName}\n- Email: ${requirements.email}\n- Phone: ${requirements.phone}\n\nPROJECT DETAILS:\n- Team Size: ${requirements.teamSize || 'Not specified'}\n- Budget Range: ${requirements.budget || 'Not specified'}\n- Timeline: ${requirements.timeline || 'Not specified'}\n\nTECHNICAL REQUIREMENTS:\n${requirements.requirements}\n\nINTEGRATIONS NEEDED:\n${requirements.integrations || 'None specified'}\n\nCOMPLIANCE REQUIREMENTS:\n${requirements.compliance || 'None specified'}\n\nADDITIONAL NOTES:\n${requirements.additionalNotes || 'None'}`;

      const formData = new FormData();
      formData.append('_subject', emailSubject);
      formData.append('Company Name', requirements.companyName);
      formData.append('Contact Name', requirements.contactName);
      formData.append('Email', requirements.email);
      formData.append('Phone', requirements.phone);
      formData.append('Team Size', requirements.teamSize || 'Not specified');
      formData.append('Budget Range', requirements.budget || 'Not specified');
      formData.append('Timeline', requirements.timeline || 'Not specified');
      formData.append('Requirements', requirements.requirements);
      formData.append('Integrations Needed', requirements.integrations || 'None specified');
      formData.append('Compliance Requirements', requirements.compliance || 'None specified');
      formData.append('Additional Notes', requirements.additionalNotes || 'None');
      formData.append('Message', emailBody);

      const response = await fetch('https://formsubmit.co/ajax/support@cookin.io', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSuccess(true);
      setRequirements({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        teamSize: '',
        budget: '',
        timeline: '',
        requirements: '',
        integrations: '',
        compliance: '',
        additionalNotes: '',
      });
      setIsSubmitting(false);

    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Unable to submit request. Please try again or email support@cookin.io directly.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gray-900 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Custom Enterprise Solutions</h2>
            <p className="text-gray-400 text-sm mt-1">Tell us about your specific requirements</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-center font-semibold mb-2">
              ✓ Request submitted successfully!
            </p>
            <p className="text-green-300 text-center text-sm">
              Our team has received your feature request and will reach out soon.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-center text-sm">{error}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form id="enterprise-contact-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-yellow-400" />
                Company Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={requirements.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter your company name"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={requirements.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={requirements.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={requirements.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-yellow-400" />
                Project Details
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Size
                  </label>
                  <input
                    type="text"
                    value={requirements.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    placeholder="e.g., 10-50 employees"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Budget Range
                  </label>
                  <input
                    type="text"
                    value={requirements.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="e.g., $10,000 - $50,000"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={requirements.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    placeholder="e.g., 3-6 months"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Technical Requirements */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-yellow-400" />
                Technical Requirements
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specific Requirements <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={requirements.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Describe your specific AI needs, features, and functionality requirements..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Integrations Needed
                </label>
                <textarea
                  value={requirements.integrations}
                  onChange={(e) => handleInputChange('integrations', e.target.value)}
                  placeholder="List any third-party systems or APIs you need to integrate with..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compliance Requirements
                </label>
                <textarea
                  value={requirements.compliance}
                  onChange={(e) => handleInputChange('compliance', e.target.value)}
                  placeholder="e.g., HIPAA, SOC 2, GDPR, etc."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-yellow-400" />
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={requirements.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any other information that would help us understand your needs..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-white text-center">How It Works</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-lg mb-3">
                    1
                  </div>
                  <h4 className="text-white font-semibold mb-2">Submit Requirements</h4>
                  <p className="text-gray-400 text-sm">Fill out this form with your specific needs</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-lg mb-3">
                    2
                  </div>
                  <h4 className="text-white font-semibold mb-2">Team Review</h4>
                  <p className="text-gray-400 text-sm">Our team prepares a custom proposal</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-lg mb-3">
                    3
                  </div>
                  <h4 className="text-white font-semibold mb-2">Implementation</h4>
                  <p className="text-gray-400 text-sm">We begin implementing your solution</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white text-center mb-4">Need Immediate Help?</h3>
              <p className="text-gray-400 text-sm text-center mb-4">
                Contact our sales team directly for urgent inquiries
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="tel:+19499972097"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Phone size={20} />
                  <span>949-997-2097</span>
                </a>
                
                <a
                  href="mailto:support@cookin.io"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Mail size={20} />
                  <span>support@cookin.io</span>
                </a>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-900/80 shrink-0">
          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="enterprise-contact-form"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Requirements'}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

