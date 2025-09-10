import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

export function AppointmentHistory() {
  const history = [
    { date: 'Jan 5', customer: 'Rachel Green', service: 'Hair Cut', rating: 5, tip: 15 },
    { date: 'Jan 4', customer: 'Monica Geller', service: 'Hair Color', rating: 5, tip: 25 },
    { date: 'Jan 4', customer: 'Ross Geller', service: 'Haircut', rating: 4, tip: 10 },
    { date: 'Jan 3', customer: 'Chandler Bing', service: 'Beard Trim', rating: 5, tip: 8 },
    { date: 'Jan 3', customer: 'Joey Tribbiani', service: 'Haircut', rating: 5, tip: 12 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent History</CardTitle>
        <CardDescription>Your completed appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((apt, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">{apt.customer}</p>
                <p className="text-sm text-muted-foreground">{apt.service}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span className="text-sm">{apt.rating}</span>
                </div>
                {apt.tip > 0 && (
                  <Badge variant="secondary">${apt.tip} tip</Badge>
                )}
                <span className="text-sm text-muted-foreground">{apt.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}