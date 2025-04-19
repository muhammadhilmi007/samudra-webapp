'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Component to display user permissions
 * 
 * @param {Object} props
 * @param {Array} props.permissions - Array of permission objects grouped by category
 */
export default function UserPermissions({ permissions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [expandedCategories, setExpandedCategories] = useState([]);

  useEffect(() => {
    if (permissions && permissions.length > 0) {
      // Group permissions by category
      const grouped = permissions.reduce((acc, permission) => {
        const category = permission.category || 'Umum';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
      }, {});
      
      setGroupedPermissions(grouped);
      
      // Expand all categories by default
      setExpandedCategories(Object.keys(grouped));
    } else {
      setGroupedPermissions({});
      setExpandedCategories([]);
    }
  }, [permissions]);

  // Filter permissions based on search term
  const filteredPermissions = Object.entries(groupedPermissions).reduce((acc, [category, perms]) => {
    if (searchTerm) {
      const filtered = perms.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
    } else {
      acc[category] = perms;
    }
    return acc;
  }, {});

  if (!permissions || permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Tidak Ada Izin</h3>
        <p className="text-sm text-muted-foreground">
          Pengguna ini belum memiliki izin akses yang ditetapkan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari izin..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {Object.keys(filteredPermissions).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak Ada Hasil</h3>
          <p className="text-sm text-muted-foreground">
            Tidak ada izin yang cocok dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories}>
          {Object.entries(filteredPermissions).map(([category, perms]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-base font-medium">
                {category} <Badge className="ml-2">{perms.length}</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {perms.map((permission) => (
                    <Card key={permission.id || permission.code}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{permission.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {permission.code}
                            </p>
                            {permission.description && (
                              <p className="text-sm mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
