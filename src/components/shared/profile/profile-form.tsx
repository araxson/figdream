"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Building, Calendar, Shield, Award, Camera, Briefcase } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import type { Database } from "@/types/database.types"

type UserRole = Database["public"]["Enums"]["user_role_type"]

interface ProfileData {
  id: string
  full_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  bio?: string
  created_at: string
  display_name?: string
  title?: string
  specialties?: string[]
  certifications?: string[]
  years_experience?: number
  license_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
}

interface OrganizationData {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  license_number?: string
}

interface ProfileFormProps {
  userRole: UserRole
  profileData: ProfileData
  organizationData?: OrganizationData
  stats?: {
    label: string
    value: string | number
    icon?: React.ReactNode
  }[]
  onSaveProfile?: (data: Partial<ProfileData>) => Promise<void>
  onSaveOrganization?: (data: Partial<OrganizationData>) => Promise<void>
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>
  onUploadAvatar?: (file: File) => Promise<void>
}

export function ProfileForm({
  userRole,
  profileData,
  organizationData,
  stats = [],
  onSaveProfile,
  onSaveOrganization,
  onChangePassword,
  onUploadAvatar
}: ProfileFormProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingOrganization, setIsEditingOrganization] = useState(false)
  const [profileForm, setProfileForm] = useState(profileData)
  const [organizationForm, setOrganizationForm] = useState(organizationData)
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  const canEditOwnProfile = hasPermission(userRole, "settings.edit_own")
  const canEditOrganization = hasPermission(userRole, "settings.edit_all")

  const handleSaveProfile = async () => {
    if (onSaveProfile) {
      await onSaveProfile(profileForm)
      setIsEditingProfile(false)
    }
  }

  const handleSaveOrganization = async () => {
    if (onSaveOrganization && organizationForm) {
      await onSaveOrganization(organizationForm)
      setIsEditingOrganization(false)
    }
  }

  const handleChangePassword = async () => {
    if (onChangePassword && passwordForm.new === passwordForm.confirm) {
      await onChangePassword(passwordForm.current, passwordForm.new)
      setPasswordForm({ current: "", new: "", confirm: "" })
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal and professional information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {canEditOwnProfile && !isEditingProfile && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input 
                    id="full-name" 
                    value={profileForm.full_name || ""}
                    onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                    disabled={!isEditingProfile}
                  />
                </div>
                {profileForm.display_name !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      value={profileForm.display_name || ""}
                      onChange={(e) => setProfileForm({...profileForm, display_name: e.target.value})}
                      disabled={!isEditingProfile}
                      placeholder="How customers see your name"
                    />
                  </div>
                )}
                {profileForm.display_name === undefined && profileForm.title !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={profileForm.title || ""}
                      onChange={(e) => setProfileForm({...profileForm, title: e.target.value})}
                      disabled={!isEditingProfile}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileForm.email || ""}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profileForm.phone || ""}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              {profileForm.bio !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={profileForm.bio || ""}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    disabled={!isEditingProfile}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
              )}

              {isEditingProfile && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => {
                    setProfileForm(profileData)
                    setIsEditingProfile(false)
                  }}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Details (for staff) */}
          {profileForm.specialties !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>Your specialties and qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileForm.specialties && (
                  <div className="space-y-2">
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileForm.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                      {isEditingProfile && (
                        <Button size="sm" variant="outline">Add Specialty</Button>
                      )}
                    </div>
                  </div>
                )}

                {profileForm.certifications && (
                  <div className="space-y-2">
                    <Label>Certifications</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileForm.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                      {isEditingProfile && (
                        <Button size="sm" variant="outline">Add Certification</Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {profileForm.years_experience !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input 
                        id="experience" 
                        type="number"
                        value={profileForm.years_experience || ""}
                        onChange={(e) => setProfileForm({...profileForm, years_experience: parseInt(e.target.value)})}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  )}
                  {profileForm.license_number !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor="license">License Number</Label>
                      <Input 
                        id="license" 
                        value={profileForm.license_number || ""}
                        onChange={(e) => setProfileForm({...profileForm, license_number: e.target.value})}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Information (for owners/managers) */}
          {organizationData && canEditOrganization && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organization Information</CardTitle>
                    <CardDescription>Your business details</CardDescription>
                  </div>
                  {!isEditingOrganization && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingOrganization(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input 
                      value={organizationForm?.name || ""}
                      onChange={(e) => setOrganizationForm({...organizationForm!, name: e.target.value})}
                      disabled={!isEditingOrganization}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Email</Label>
                    <Input 
                      type="email"
                      value={organizationForm?.email || ""}
                      onChange={(e) => setOrganizationForm({...organizationForm!, email: e.target.value})}
                      disabled={!isEditingOrganization}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Business Phone</Label>
                    <Input 
                      type="tel"
                      value={organizationForm?.phone || ""}
                      onChange={(e) => setOrganizationForm({...organizationForm!, phone: e.target.value})}
                      disabled={!isEditingOrganization}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Number</Label>
                    <Input 
                      value={organizationForm?.license_number || ""}
                      onChange={(e) => setOrganizationForm({...organizationForm!, license_number: e.target.value})}
                      disabled={!isEditingOrganization}
                    />
                  </div>
                </div>

                {organizationForm?.address !== undefined && (
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input 
                      value={organizationForm.address || ""}
                      onChange={(e) => setOrganizationForm({...organizationForm, address: e.target.value})}
                      disabled={!isEditingOrganization}
                    />
                  </div>
                )}

                {isEditingOrganization && (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveOrganization}>Save Changes</Button>
                    <Button variant="outline" onClick={() => {
                      setOrganizationForm(organizationData)
                      setIsEditingOrganization(false)
                    }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={!passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your account at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profileData.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold">
                    {profileData.display_name || profileData.full_name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profileData.title || organizationData?.name || ""}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  {organizationData && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{organizationData.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(profileData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {onUploadAvatar && (
                  <Button className="w-full" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Profile Photo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {stats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your performance at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-sm">{stat.label}</span>
                      </div>
                      <Badge variant="secondary">{stat.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Auth
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Download Account Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                Close Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}