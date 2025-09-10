import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CustomerProfileHeader() {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src="" />
            <AvatarFallback>JC</AvatarFallback>
          </Avatar>
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jane Customer</h1>
          <p className="text-muted-foreground">customer@demo.com</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">Loyal Customer</Badge>
            <span className="text-sm text-muted-foreground">Member since January 2025</span>
          </div>
        </div>
      </div>
      <Button>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  )
}