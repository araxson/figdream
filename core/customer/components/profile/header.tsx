'use client'

import { useState } from 'react'
import { Camera, Mail, Phone, MapPin, Calendar, Edit, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { CustomerProfile } from '../../types'

interface ProfileHeaderProps {
  profile: CustomerProfile
  onUpdateProfile: (updates: Partial<CustomerProfile>) => Promise<void>
  onUploadImage: (file: File) => Promise<string>
  isLoading?: boolean
}

export function ProfileHeader({
  profile,
  onUpdateProfile,
  onUploadImage,
  isLoading = false
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    phone: profile.phone || ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const handleSave = async () => {
    try {
      await onUpdateProfile({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        phone: editForm.phone || undefined
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setEditForm({
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      phone: profile.phone || ''
    })
    setIsEditing(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      await onUploadImage(file)
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Unknown'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} alt={`${profile.first_name || ''} ${profile.last_name || ''}`} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.first_name || '', profile.last_name || '')}
                </AvatarFallback>
              </Avatar>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    disabled={uploadingImage}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Photo</DialogTitle>
                    <DialogDescription>
                      Choose a new profile photo. Images should be square and under 5MB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={profile.avatar_url} alt="Profile preview" />
                        <AvatarFallback className="text-4xl">
                          {getInitials(profile.first_name || '', profile.last_name || '')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <Label htmlFor="image-upload">Select Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Badge variant="secondary">
              Member since {memberSince}
            </Badge>
          </div>

          {/* Profile Information */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                    </h1>
                    <p className="text-muted-foreground">Customer Profile</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {profile.address.city}, {profile.address.state}
                      </span>
                    </div>
                  )}
                  {profile.date_of_birth && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Born {new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}