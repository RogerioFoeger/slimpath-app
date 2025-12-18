'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [profileType, setProfileType] = useState('cortisol')
  const [plan, setPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTestSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': process.env.NEXT_PUBLIC_WEBHOOK_SECRET || 'test-secret-123'
        },
        body: JSON.stringify({
          email,
          password,
          name,
          profile_type: profileType,
          subscription_plan: plan,
          transaction_id: `TEST-${Date.now()}`,
          amount: 0 // Free test signup!
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">🧪 Test Signup (Free)</h1>
          <p className="text-gray-600 text-center mb-6">
            Create a test account with $0 payment to verify the app works
          </p>

          <form onSubmit={handleTestSignup} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use a real email to receive the magic link
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min 6 characters)"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Set a password so you can log in with email/password later
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Profile Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Metabolism Type</label>
              <select
                value={profileType}
                onChange={(e) => setProfileType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="cortisol">Cortisol Type</option>
                <option value="hormonal">Hormonal Type</option>
                <option value="inflammatory">Inflammatory Type</option>
                <option value="metabolic">Metabolic Type</option>
                <option value="retention">Retention Type</option>
                <option value="insulinic">Insulinic Type</option>
              </select>
            </div>

            {/* Subscription Plan */}
            <div>
              <label className="block text-sm font-medium mb-2">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="monthly">Monthly ($37/mo)</option>
                <option value="annual">Annual ($297/yr)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Don't worry - this is FREE for testing! No payment required.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="text-lg py-3"
            >
              {loading ? '⏳ Creating Test Account...' : '🚀 Create Free Test Account'}
            </Button>
          </form>

          {/* Success Result */}
          {result && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <h3 className="font-bold text-green-700 mb-2">✅ Success!</h3>
              <div className="text-sm space-y-1">
                <p><strong>User ID:</strong> {result.user_id}</p>
                <p><strong>Status:</strong> {result.message}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-green-600 font-semibold">
                    🎉 Account created! You can now log in using:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    <li>📧 Magic link (check your email)</li>
                    <li>🔑 Email & password at <a href="/login" className="text-primary-500 hover:underline">/login</a></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
              <h3 className="font-bold text-red-700 mb-2">❌ Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">📋 Testing Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Enter your real email address</li>
              <li>2. Set a password (you can use this to log in anytime)</li>
              <li>3. Choose a metabolism type and plan</li>
              <li>4. Click "Create Free Test Account"</li>
              <li>5. Log in using:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Magic link from your email, OR</li>
                  <li>Email & password at /login</li>
                </ul>
              </li>
              <li>6. Complete onboarding and access the dashboard!</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Testing Only:</strong> This page is for testing purposes only. 
              Remove it before going to production or add authentication to protect it.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

