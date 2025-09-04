import { Metadata } from 'next'
import { getSalons } from '@/lib/data-access/salons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const metadata: Metadata = {
  title: 'Salon Management',
  description: 'Manage all salons on the platform',
}

export default async function AdminSalonsPage() {
  const result = await getSalons()
  const salons = result.data || []
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Salon Management</h1>
        <p className="text-muted-foreground">
          Manage all registered salons on the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Salons</CardTitle>
          <CardDescription>
            {salons.length} salons registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salons.length > 0 ? (
                salons.map((salon) => (
                  <TableRow key={salon.id}>
                    <TableCell className="font-medium">{salon.name}</TableCell>
                    <TableCell>{salon.created_by || '-'}</TableCell>
                    <TableCell>{salon.email || '-'}</TableCell>
                    <TableCell>{salon.is_active ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>{new Date(salon.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No salons registered
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}