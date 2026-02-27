'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setEmail(user.email || '')
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

          if (profile?.full_name) {
            setFullName(profile.full_name)
          }
        }
      } catch (err) {
        console.error('[v0] Failed to load profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('[v0] Failed to update profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 mt-1">Loading your profile information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account information</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
          <CardDescription className="text-slate-400">
            Update your profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-slate-800 border-slate-700 text-slate-300"
              />
              <p className="text-xs text-slate-500">Email cannot be changed from here</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                disabled={saving}
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Account Status</CardTitle>
          <CardDescription className="text-slate-400">
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-white font-medium">{email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Account Created</p>
            <p className="text-white font-medium">Confirmed & Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
