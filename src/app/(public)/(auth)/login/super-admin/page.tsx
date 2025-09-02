import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui'
import { LoginForm } from '@/components/auth/login-form'
import { Shield, AlertTriangle, Lock, Server, Database } from 'lucide-react'

export default function SuperAdminLoginPage() {
  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <Alert className="border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
          <strong>Restricted Access</strong>
          <br />
          This portal is for system administrators only. All login attempts are monitored and logged.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">System Administration</h1>
        <p className="text-muted-foreground">
          Super Admin authentication portal
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Sign In</CardTitle>
          <CardDescription>
            Enter your super admin credentials to access system controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm role="super_admin" redirectTo="/super-admin" />
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            <p>Security Notice:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication when available</li>
              <li>Never share your credentials</li>
              <li>Log out when finished</li>
            </ul>
          </div>
        </CardFooter>
      </Card>

      {/* Admin Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Administration Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Database Management</p>
                <p className="text-sm text-muted-foreground">
                  Full access to system database and configurations
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Server className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">System Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  Monitor system health, performance, and security
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Security Controls</p>
                <p className="text-sm text-muted-foreground">
                  Manage access controls, audit logs, and security policies
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Need assistance?</p>
        <Link href="/support" className="text-primary hover:underline">
          Contact System Support
        </Link>
      </div>
    </div>
  )
}