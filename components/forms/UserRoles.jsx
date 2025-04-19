'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserCog, Edit } from 'lucide-react';

/**
 * Component to display user roles
 * 
 * @param {Object} props
 * @param {string} props.userId - User ID
 * @param {Array} props.roles - Array of role objects
 * @param {boolean} props.showEditButton - Whether to show the edit button
 */
export default function UserRoles({ userId, roles = [], showEditButton = false }) {
  const [primaryRole, setPrimaryRole] = useState(null);
  const [otherRoles, setOtherRoles] = useState([]);

  useEffect(() => {
    if (roles && roles.length > 0) {
      // Find primary role
      const primary = roles.find(role => role.isPrimary);
      setPrimaryRole(primary || roles[0]);
      
      // Set other roles
      setOtherRoles(roles.filter(role => 
        primary ? role.id !== primary.id : role.id !== roles[0].id
      ));
    } else {
      setPrimaryRole(null);
      setOtherRoles([]);
    }
  }, [roles]);

  if (!roles || roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Tidak Ada Peran</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Pengguna ini belum memiliki peran yang ditetapkan.
        </p>
        {showEditButton && (
          <Link href={`/users/${userId}/roles`} passHref>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Tetapkan Peran
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Peran Pengguna</h3>
        {showEditButton && (
          <Link href={`/users/${userId}/roles`} passHref>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Peran
            </Button>
          </Link>
        )}
      </div>
      
      {primaryRole && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{primaryRole.name}</h4>
                  <Badge variant="secondary">Utama</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {primaryRole.description || `Kode: ${primaryRole.code || primaryRole.id}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {otherRoles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Peran Tambahan</h4>
          <div className="space-y-2">
            {otherRoles.map(role => (
              <Card key={role.id}>
                <CardContent className="p-4">
                  <h4 className="font-medium">{role.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {role.description || `Kode: ${role.code || role.id}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
