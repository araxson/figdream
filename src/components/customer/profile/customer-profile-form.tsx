'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, User, Phone, Mail, CheckCircle2, Camera, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { updateCustomer } from '@/lib/data-access/customers/client';
import type { Database } from '@/types/database.types';
import { cn } from '@/lib/utils';
type Customer = Database['public']['Tables']['customers']['Row'];
interface ProfileFormProps {
  customer: Customer;
}
function ProfileForm({ customer }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    date_of_birth: customer.date_of_birth || '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  
  // Calculate profile completion percentage
  useEffect(() => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field !== '').length;
    const completion = Math.round((filledFields / fields.length) * 100);
    setProfileComplete(completion);
  }, [formData]);
  
  // Track changes
  useEffect(() => {
    const hasAnyChanges = 
      formData.first_name !== (customer.first_name || '') ||
      formData.last_name !== (customer.last_name || '') ||
      formData.phone !== (customer.phone || '') ||
      formData.email !== (customer.email || '') ||
      formData.date_of_birth !== (customer.date_of_birth || '');
    setHasChanges(hasAnyChanges);
  }, [formData, customer]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCustomer(customer.id, formData);
      toast.success('Profile updated successfully');
    } catch (_error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  const initials = `${formData.first_name[0] || ''}${formData.last_name[0] || ''}`.toUpperCase() || 'UN';
  
  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={customer.avatar_url || ''} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {formData.first_name || 'Guest'} {formData.last_name || 'User'}
                </h2>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Loyal Customer
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Member since {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profile Completion</span>
                  <span className="font-medium">{profileComplete}%</span>
                </div>
                <Progress value={profileComplete} className="h-2" />
                {profileComplete < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Complete your profile to unlock rewards and personalized recommendations
                  </p>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground">Loyalty Points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {profileComplete === 100 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-400">
            Congratulations! Your profile is 100% complete. You&apos;ve earned 50 bonus loyalty points!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-sm font-medium">
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
              <p className="text-xs text-muted-foreground">
                Get special birthday rewards and offers!
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <div className="h-2 w-2 bg-orange-600 rounded-full animate-pulse" />
                You have unsaved changes
              </span>
            ) : (
              'All changes saved'
            )}
          </p>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={!hasChanges || loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !hasChanges}
              className={cn(
                "min-w-[120px] transition-all duration-200",
                hasChanges && "shadow-lg shadow-primary/25"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

ProfileForm.displayName = 'ProfileForm'

export default ProfileForm
