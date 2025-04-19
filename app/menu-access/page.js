'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import PageHeader from '@/components/layout/header';
import AuthGuard from '@/components/auth/auth-guard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import API_URL from '@/lib/api';

export default function MenuAccessPage() {
  return (
    <AuthGuard requiredPermissions={['manage_menu_access']}>
      <MenuAccessContent />
    </AuthGuard>
  );
}

function MenuAccessContent() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuAccess, setMenuAccess] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await axios.get(`${API_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch menus
        const menusResponse = await axios.get(`${API_URL}/menus`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const roles = rolesResponse.data.data;
        const menus = menusResponse.data.data;
        
        setRoles(roles);
        setMenus(menus);
        
        // Set default active tab to first role
        if (roles.length > 0 && !activeTab) {
          setActiveTab(roles[0]._id);
          
          // Fetch menu access for the first role
          await fetchMenuAccess(roles[0]._id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data peran dan menu');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const fetchMenuAccess = async (roleId) => {
    try {
      // Fetch menu access for the role
      const response = await axios.get(`${API_URL}/menu-access/by-role/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Create a map of menu IDs to access rights
      const accessMap = {};
      response.data.data.forEach(access => {
        accessMap[access.menuId._id] = {
          canView: access.canView,
          canCreate: access.canCreate,
          canEdit: access.canEdit,
          canDelete: access.canDelete,
          _id: access._id
        };
      });
      
      setMenuAccess(accessMap);
    } catch (error) {
      console.error('Error fetching menu access:', error);
      toast.error('Gagal memuat data akses menu');
    }
  };

  const handleTabChange = async (roleId) => {
    setActiveTab(roleId);
    await fetchMenuAccess(roleId);
  };

  const toggleMenuExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleAccessChange = (menuId, accessType, checked) => {
    setMenuAccess(prev => {
      const current = prev[menuId] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
      
      // If turning off view access, also turn off all other access types
      if (accessType === 'canView' && !checked) {
        return {
          ...prev,
          [menuId]: {
            ...current,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false
          }
        };
      }
      
      // If turning on any other access type, also turn on view access
      if (accessType !== 'canView' && checked) {
        return {
          ...prev,
          [menuId]: {
            ...current,
            [accessType]: checked,
            canView: true
          }
        };
      }
      
      return {
        ...prev,
        [menuId]: {
          ...current,
          [accessType]: checked
        }
      };
    });
  };

  const saveMenuAccess = async () => {
    try {
      setSaving(true);
      
      // Prepare data for batch update
      const menuAccessData = Object.keys(menuAccess).map(menuId => ({
        menuId,
        ...menuAccess[menuId]
      }));
      
      // Send batch update request
      await axios.put(
        `${API_URL}/menu-access/batch/role/${activeTab}`,
        { menuAccess: menuAccessData },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Akses menu berhasil disimpan');
      setSaving(false);
    } catch (error) {
      console.error('Error saving menu access:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan akses menu');
      setSaving(false);
    }
  };

  // Function to render menu items recursively
  const renderMenuItems = (parentId = null, level = 0) => {
    const filteredMenus = menus.filter(menu => 
      (parentId === null && !menu.parentId) || 
      (menu.parentId && menu.parentId === parentId)
    );
    
    return filteredMenus.map(menu => {
      const hasChildren = menus.some(m => m.parentId === menu._id);
      const isExpanded = expandedMenus[menu._id];
      const access = menuAccess[menu._id] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
      
      return (
        <React.Fragment key={menu._id}>
          <TableRow className={level > 0 ? 'bg-muted/30' : ''}>
            <TableCell className="font-medium">
              <div 
                className="flex items-center" 
                style={{ paddingLeft: `${level * 1.5}rem` }}
              >
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 mr-1"
                    onClick={() => toggleMenuExpand(menu._id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {menu.name}
                <Badge variant="outline" className="ml-2">
                  {menu.code}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`view-${menu._id}`}
                  checked={access.canView}
                  onCheckedChange={(checked) => 
                    handleAccessChange(menu._id, 'canView', checked)
                  }
                />
                <Label htmlFor={`view-${menu._id}`}>Lihat</Label>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`create-${menu._id}`}
                  checked={access.canCreate}
                  disabled={!access.canView}
                  onCheckedChange={(checked) => 
                    handleAccessChange(menu._id, 'canCreate', checked)
                  }
                />
                <Label htmlFor={`create-${menu._id}`}>Tambah</Label>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`edit-${menu._id}`}
                  checked={access.canEdit}
                  disabled={!access.canView}
                  onCheckedChange={(checked) => 
                    handleAccessChange(menu._id, 'canEdit', checked)
                  }
                />
                <Label htmlFor={`edit-${menu._id}`}>Edit</Label>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`delete-${menu._id}`}
                  checked={access.canDelete}
                  disabled={!access.canView}
                  onCheckedChange={(checked) => 
                    handleAccessChange(menu._id, 'canDelete', checked)
                  }
                />
                <Label htmlFor={`delete-${menu._id}`}>Hapus</Label>
              </div>
            </TableCell>
          </TableRow>
          
          {/* Render children if expanded */}
          {hasChildren && isExpanded && renderMenuItems(menu._id, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Manajemen Akses Menu"
        subtitle="Kelola akses menu untuk setiap peran"
        actions={
          <Button 
            onClick={saveMenuAccess} 
            disabled={saving || !activeTab}
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
              </>
            )}
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Akses Menu berdasarkan Peran</CardTitle>
          <CardDescription>
            Pilih peran untuk mengatur akses menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              {roles.map(role => (
                <TabsTrigger key={role._id} value={role._id}>
                  {role.namaRole}
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map(role => (
              <TabsContent key={role._id} value={role._id}>
                <Card>
                  <CardHeader>
                    <CardTitle>Akses Menu untuk {role.namaRole}</CardTitle>
                    <CardDescription>
                      Atur hak akses untuk setiap menu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Menu</TableHead>
                          <TableHead>Lihat</TableHead>
                          <TableHead>Tambah</TableHead>
                          <TableHead>Edit</TableHead>
                          <TableHead>Hapus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {renderMenuItems()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}