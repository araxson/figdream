'use client'

import { UsersTableClient as UsersList } from './users-table'
import { UserActivity } from './activity'
import { UserPermissions } from './permissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { UserPlus, Download } from 'lucide-react'
import { useState } from 'react'

export function AdminUsers() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UsersList initialUsers={[]} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <UserActivity />
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-6">
          <UserPermissions initialPermissions={[]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}