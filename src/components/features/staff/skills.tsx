'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

export function Skills() {
  const [skills, setSkills] = useState([
    'Hair Cutting',
    'Hair Coloring',
    'Balayage',
    'Highlights',
    'Perms',
    'Keratin Treatment',
    'Hair Extensions',
    'Bridal Styling',
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Specializations</CardTitle>
        <CardDescription>Services you can provide</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="pr-1">
                {skill}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => setSkills(skills.filter((_, index) => index !== i))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}