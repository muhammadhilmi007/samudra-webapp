'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, User, Users, Settings, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import PermissionGuard from '@/components/auth/permission-guard';
import { getPermissionDisplayName } from '@/lib/rbac';

export default function ExampleRbacPage() {
  const { user, hasPermission, hasRole, hasAccess } = useAuth();
  const [activeTab, setActiveTab] = useState('permissions');

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Authenticated</AlertTitle>
          <AlertDescription>
            You need to be logged in to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">RBAC System Example</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="permissions">
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="components">
            <Settings className="mr-2 h-4 w-4" />
            Protected Components
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Your Permissions</CardTitle>
              <CardDescription>
                These are the permissions assigned to your account through your roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {user.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">{getPermissionDisplayName(permission)}</p>
                        <p className="text-xs text-muted-foreground">{permission}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No permissions found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Your Roles</CardTitle>
              <CardDescription>
                These are the roles assigned to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-4 p-4 border rounded-md">
                      <User className="h-5 w-5 mt-1" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{role.name}</h3>
                          <Badge variant="outline">{role.code}</Badge>
                          {role.isPrimary && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No roles found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Example with single permission */}
            <Card>
              <CardHeader>
                <CardTitle>View Dashboard Permission</CardTitle>
                <CardDescription>
                  This component requires the "view_dashboard" permission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard 
                  permissions={['view_dashboard']}
                  fallback={
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>
                        You need the "view_dashboard" permission to see this content.
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <div className="p-4 bg-green-50 rounded-md">
                    <p className="text-green-700">
                      You have the "view_dashboard" permission!
                    </p>
                  </div>
                </PermissionGuard>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Current status: {hasPermission('view_dashboard') ? 'Granted' : 'Denied'}
                </div>
              </CardFooter>
            </Card>
            
            {/* Example with role */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Role</CardTitle>
                <CardDescription>
                  This component requires the "admin" role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard 
                  roles={['admin']}
                  fallback={
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>
                        You need the "admin" role to see this content.
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <div className="p-4 bg-green-50 rounded-md">
                    <p className="text-green-700">
                      You have the "admin" role!
                    </p>
                  </div>
                </PermissionGuard>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Current status: {hasRole('admin') ? 'Granted' : 'Denied'}
                </div>
              </CardFooter>
            </Card>
            
            {/* Example with multiple permissions (any) */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  This component requires any of these permissions: "manage_employees", "view_employees"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard 
                  permissions={['manage_employees', 'view_employees']}
                  fallback={
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>
                        You need either "manage_employees" or "view_employees" permission.
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <div className="p-4 bg-green-50 rounded-md">
                    <p className="text-green-700">
                      You have employee management permissions!
                    </p>
                  </div>
                </PermissionGuard>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Current status: {
                    hasPermission('manage_employees') || hasPermission('view_employees') 
                      ? 'Granted' 
                      : 'Denied'
                  }
                </div>
              </CardFooter>
            </Card>
            
            {/* Example with resource access */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Management</CardTitle>
                <CardDescription>
                  This component requires access to manage branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard
                  resourceAccess={{
                    resource: 'branch',
                    action: 'manage',
                    data: { cabangId: user?.cabangId }
                  }}
                  fallback={
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>
                        You need branch management access to see this content.
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <div className="p-4 bg-green-50 rounded-md">
                    <p className="text-green-700">
                      You have branch management access!
                    </p>
                  </div>
                </PermissionGuard>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Current status: {hasAccess('branch', 'manage', { cabangId: user?.cabangId }) ? 'Granted' : 'Denied'}
                </div>
              </CardFooter>
            </Card>
            
            {/* Example with owner-based access */}
            <Card>
              <CardHeader>
                <CardTitle>Owner-Based Access</CardTitle>
                <CardDescription>
                  This component requires owner-specific permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard
                  resourceAccess={{
                    resource: 'document',
                    action: 'edit',
                    data: {
                      userId: user?.id,
                      createdBy: user?.id
                    }
                  }}
                  fallback={
                    <Alert>
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>
                        You need owner-specific permissions to see this content.
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <div className="p-4 bg-green-50 rounded-md">
                    <p className="text-green-700">
                      You have owner-based access to edit your documents!
                    </p>
                  </div>
                </PermissionGuard>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Current status: {
                    hasAccess('document', 'edit', { userId: user?.id }) ? 'Granted' : 'Denied'
                  }
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}