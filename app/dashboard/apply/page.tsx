'use client'

import { useState, useEffect } from 'react'
import {
  ClipboardList,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser, submitPartnerApplication, supabase } from '@/lib/supabase'
import { PartnerApplication, ApplicationStatus } from '@/types'

const targetMarkets = [
  'Small Business',
  'Enterprise',
  'Real Estate',
  'Food & Beverage',
  'Healthcare',
  'Finance',
  'Education',
  'Non-Profit',
  'Technology',
  'Retail',
  'Other',
]

const howHeardOptions = [
  'Google Search',
  'LinkedIn',
  'Referral',
  'Social Media',
  'Industry Event',
  'Email Campaign',
  'Other',
]

export default function ApplyPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingApplication, setExistingApplication] = useState<PartnerApplication | null>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    business_type: '',
    years_in_business: '',
    sales_experience: '',
    target_markets: [] as string[],
    expected_monthly_sales: '',
    how_heard_about_us: '',
    linkedin_url: '',
    references: '',
  })

  useEffect(() => {
    checkExistingApplication()
  }, [])

  const checkExistingApplication = async () => {
    try {
      const { user } = await getUser()
      if (user) {
        setFormData(prev => ({ ...prev, email: user.email || '' }))
        
        const { data } = await supabase
          .from('partner_applications')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setExistingApplication(data)
        }
      }
    } catch (error) {
      console.error('Error checking application:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMarketToggle = (market: string) => {
    const current = formData.target_markets
    if (current.includes(market)) {
      setFormData({ ...formData, target_markets: current.filter(m => m !== market) })
    } else {
      setFormData({ ...formData, target_markets: [...current, market] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.target_markets.length === 0) {
      toast.error('Please select at least one target market')
      return
    }

    setSubmitting(true)

    try {
      const { user } = await getUser()
      if (!user) {
        toast.error('Please sign in to submit an application')
        return
      }

      const applicationData = {
        user_id: user.id,
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || null,
        business_type: formData.business_type,
        years_in_business: parseInt(formData.years_in_business),
        sales_experience: formData.sales_experience,
        target_markets: formData.target_markets,
        expected_monthly_sales: parseInt(formData.expected_monthly_sales),
        how_heard_about_us: formData.how_heard_about_us,
        linkedin_url: formData.linkedin_url || null,
        references: formData.references || null,
        status: 'pending' as ApplicationStatus,
      }

      const { data, error } = await submitPartnerApplication(applicationData)

      if (error) throw error

      setExistingApplication(data)
      toast.success('Application submitted successfully!')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusDisplay = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          text: 'Pending Review',
          description: 'Your application is in the queue for review. We typically respond within 2-3 business days.',
        }
      case 'under_review':
        return {
          icon: ClipboardList,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          text: 'Under Review',
          description: 'Our team is currently reviewing your application. You may be contacted for additional information.',
        }
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          text: 'Approved',
          description: 'Congratulations! Your application has been approved. Check your dashboard for next steps.',
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          text: 'Not Approved',
          description: 'Unfortunately, your application was not approved at this time. You may reapply after 90 days.',
        }
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show status if application exists
  if (existingApplication) {
    const status = getStatusDisplay(existingApplication.status)
    const StatusIcon = status.icon

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full ${status.bg} flex items-center justify-center mx-auto mb-6`}>
            <StatusIcon className={`w-10 h-10 ${status.color}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application {status.text}</h2>
          <p className="text-gray-600 mb-8">{status.description}</p>

          <div className="bg-gray-50 rounded-xl p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Company:</span>
                <span className="ml-2 font-medium text-gray-900">{existingApplication.company_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Contact:</span>
                <span className="ml-2 font-medium text-gray-900">{existingApplication.contact_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium text-gray-900">{existingApplication.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(existingApplication.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {existingApplication.review_notes && (
            <div className="mt-6 bg-blue-50 rounded-xl p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">Reviewer Notes</h4>
              <p className="text-blue-700">{existingApplication.review_notes}</p>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-8">
            Questions? Contact us at{' '}
            <a href="mailto:partners@craudiovizai.com" className="text-purple-600 hover:underline">
              partners@craudiovizai.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Partner Application</h2>
          <p className="text-gray-600 mt-2">
            Complete the form below to apply for the CR AudioViz AI Partner Program
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Company Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="agency">Agency</option>
                  <option value="consultancy">Consultancy</option>
                  <option value="reseller">Reseller</option>
                  <option value="individual">Individual Sales Rep</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business *</label>
                <input
                  type="number"
                  name="years_in_business"
                  value={formData.years_in_business}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sales Experience */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Sales Experience
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your sales experience *
                </label>
                <textarea
                  name="sales_experience"
                  value={formData.sales_experience}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Tell us about your background in sales, including industries served, deal sizes, and notable achievements..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Monthly Sales Volume *
                </label>
                <select
                  name="expected_monthly_sales"
                  value={formData.expected_monthly_sales}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="">Select range...</option>
                  <option value="5000">$1,000 - $5,000</option>
                  <option value="10000">$5,000 - $10,000</option>
                  <option value="25000">$10,000 - $25,000</option>
                  <option value="50000">$25,000 - $50,000</option>
                  <option value="100000">$50,000+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Markets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Target Markets *
            </h3>
            <p className="text-sm text-gray-500 mb-4">Select all markets you plan to sell into</p>
            <div className="flex flex-wrap gap-2">
              {targetMarkets.map((market) => (
                <button
                  key={market}
                  type="button"
                  onClick={() => handleMarketToggle(market)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.target_markets.includes(market)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us? *</label>
            <select
              name="how_heard_about_us"
              value={formData.how_heard_about_us}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            >
              <option value="">Select option...</option>
              {howHeardOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">References (Optional)</label>
            <textarea
              name="references"
              value={formData.references}
              onChange={handleChange}
              rows={3}
              placeholder="List any professional references with contact information..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              By submitting, you agree to our{' '}
              <a href="#" className="text-purple-600 hover:underline">Partner Terms</a>
              {' '}and{' '}
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
