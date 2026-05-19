'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Building,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUser, getPartnerByUserId, supabase } from '@/lib/supabase'
import { formatCurrency, getTierColor } from '@/lib/utils'
import { Partner } from '@/types'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
  })
  const [notifications, setNotifications] = useState({
    new_leads: true,
    deal_updates: true,
    commission_payments: true,
    product_updates: false,
    marketing_emails: false,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const user = await getUser()
      if (user) {
        const { data: partnerData } = await getPartnerByUserId(user.id)
        if (partnerData) {
          setPartner(partnerData)
          setFormData({
            company_name: partnerData.company_name || '',
            contact_name: partnerData.contact_name || '',
            email: partnerData.email || '',
            phone: partnerData.phone || '',
            website: partnerData.website || '',
          })
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNotificationChange = (key: string) => {
    setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })
  }

  const handleSave = async () => {
    if (!partner) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('partners')
        .update({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          phone: formData.phone,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partner.id)

      if (error) throw error

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Manage your profile, notifications, and payment preferences</p>
      </div>

      {/* Partner Status */}
      {partner && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-purple-100 text-sm">Partner Status</div>
              <div className="text-2xl font-bold">{partner.tier}</div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-purple-100 text-sm">Total Sales</div>
                <div className="text-xl font-semibold">{formatCurrency(partner.total_sales)}</div>
              </div>
              <div>
                <div className="text-purple-100 text-sm">Commission Rate</div>
                <div className="text-xl font-semibold">{partner.commission_rate}%</div>
              </div>
              <div>
                <div className="text-purple-100 text-sm">Total Earned</div>
                <div className="text-xl font-semibold">{formatCurrency(partner.total_commissions)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Contact Name
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
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

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          {[
            { key: 'new_leads', label: 'New Lead Assignments', description: 'Get notified when new leads are assigned to you' },
            { key: 'deal_updates', label: 'Deal Status Updates', description: 'Receive updates when deal statuses change' },
            { key: 'commission_payments', label: 'Commission Payments', description: 'Get notified when commission payments are processed' },
            { key: 'product_updates', label: 'Product Updates', description: 'Learn about new products and feature releases' },
            { key: 'marketing_emails', label: 'Marketing Communications', description: 'Receive tips, best practices, and partner success stories' },
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">{notification.label}</div>
                <div className="text-sm text-gray-500">{notification.description}</div>
              </div>
              <button
                onClick={() => handleNotificationChange(notification.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[notification.key as keyof typeof notifications]
                    ? 'bg-purple-600'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications[notification.key as keyof typeof notifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-1">Connect Payment Method</h4>
          <p className="text-sm text-gray-500 mb-4">
            Link your bank account or PayPal to receive commission payments
          </p>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors">
            Connect Payment Method
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>

        <div className="space-y-4">
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Change Password</div>
            <div className="text-sm text-gray-500">Update your account password</div>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Two-Factor Authentication</div>
            <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Active Sessions</div>
            <div className="text-sm text-gray-500">Manage devices where you&apos;re logged in</div>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}
