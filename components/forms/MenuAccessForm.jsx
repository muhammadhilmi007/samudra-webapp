"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Button, 
  Card, 
  CardContent, 
  FormControl, 
  FormLabel, 
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  Switch
} from '@/components/ui';
import { 
  ChevronRight, 
  ChevronDown,
  Save
} from 'lucide-react';
import api from '@/lib/api';

const MenuAccessForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [menuAccesses, setMenuAccesses] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [menuTree, setMenuTree] = useState([]);
  
  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        setRoles(response.data.data);
        
        // Select first role by default
        if (response.data.data.length > 0 && !selectedRoleId) {
          setSelectedRoleId(response.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Gagal mengambil data role');
      }
    };
    
    fetchRoles();
  }, []);
  
  // Fetch menu access when role changes
  useEffect(() => {
    if (!selectedRoleId) return;
    
    const fetchMenuAccess = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/menu-access/by-role/${selectedRoleId}`);
        setMenuAccesses(response.data.data);
        
        // Build menu tree
        buildMenuTree(response.data.data);
      } catch (error) {
        console.error('Error fetching menu access:', error);
        toast.error('Gagal mengambil data akses menu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuAccess();
  }, [selectedRoleId]);
  
  // Build menu tree from flat menu access list
  const buildMenuTree = (accesses) => {
    // Create a map of menu IDs to menu objects
    const menuMap = {};
    accesses.forEach(access => {
      menuMap[access.menuId] = {
        ...access.menu,
        access: {
          _id: access._id,
          canView: access.canView,
          canCreate: access.canCreate,
          canEdit: access.canEdit,
          canDelete: access.canDelete
        }
      };
    });
    
    // Build tree structure
    const tree = [];
    Object.values(menuMap).forEach(menu => {
      if (!menu.parentId) {
        // This is a top-level menu
        tree.push(menu);
      } else {
        // This is a child menu
        const parent = menuMap[menu.parentId];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menu);
        }
      }
    });
    
    // Sort menus by order
    tree.sort((a, b) => a.order - b.order);
    tree.forEach(menu => {
      if (menu.children) {
        menu.children.sort((a, b) => a.order - b.order);
      }
    });
    
    setMenuTree(tree);
  };
  
  // Toggle expanded state for a menu
  const toggleExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  // Handle access change
  const handleAccessChange = (menuId, accessType, checked) => {
    setMenuAccesses(prev => {
      return prev.map(access => {
        if (access.menuId === menuId) {
          return {
            ...access,
            [accessType]: checked,
            // If canView is unchecked, uncheck all other permissions
            ...(accessType === 'canView' && !checked ? {
              canCreate: false,
              canEdit: false,
              canDelete: false
            } : {}),
            // If any other permission is checked, ensure canView is also checked
            ...(accessType !== 'canView' && checked ? {
              canView: true
            } : {})
          };
        }
        return access;
      });
    });
    
    // Update menu tree
    const updateMenuTreeAccess = (menus, menuId, accessType, checked) => {
      return menus.map(menu => {
        if (menu._id === menuId) {
          const updatedMenu = {
            ...menu,
            access: {
              ...menu.access,
              [accessType]: checked,
              // If canView is unchecked, uncheck all other permissions
              ...(accessType === 'canView' && !checked ? {
                canCreate: false,
                canEdit: false,
                canDelete: false
              } : {}),
              // If any other permission is checked, ensure canView is also checked
              ...(accessType !== 'canView' && checked ? {
                canView: true
              } : {})
            }
          };
          return updatedMenu;
        }
        
        if (menu.children) {
          return {
            ...menu,
            children: updateMenuTreeAccess(menu.children, menuId, accessType, checked)
          };
        }
        
        return menu;
      });
    };
    
    setMenuTree(prev => updateMenuTreeAccess(prev, menuId, accessType, checked));
  };
  
  // Save menu access changes
  const saveChanges = async () => {
    setSaving(true);
    try {
      // Prepare data for batch update
      const menuAccessesToUpdate = menuAccesses.map(access => ({
        menuId: access.menuId,
        canView: access.canView,
        canCreate: access.canCreate,
        canEdit: access.canEdit,
        canDelete: access.canDelete
      }));
      
      await api.put(`/menu-access/batch/role/${selectedRoleId}`, {
        menuAccesses: menuAccessesToUpdate
      });
      
      toast.success('Akses menu berhasil disimpan');
    } catch (error) {
      console.error('Error saving menu access:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan akses menu');
    } finally {
      setSaving(false);
    }
  };
  
  // Render menu items recursively
  const renderMenuItems = (menus, level = 0) => {
    return menus.map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus[menu._id];
      
      return (
        <React.Fragment key={menu._id}>
          <TableRow className={level > 0 ? 'bg-gray-50' : ''}>
            <TableCell className="font-medium">
              <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(menu._id)}
                    className="mr-2 p-1 rounded-full hover:bg-gray-200"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
                {!hasChildren && <span className="w-6 mr-2"></span>}
                {menu.name}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={menu.access.canView}
                onCheckedChange={(checked) => handleAccessChange(menu._id, 'canView', checked)}
              />
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={menu.access.canCreate}
                disabled={!menu.access.canView}
                onCheckedChange={(checked) => handleAccessChange(menu._id, 'canCreate', checked)}
              />
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={menu.access.canEdit}
                disabled={!menu.access.canView}
                onCheckedChange={(checked) => handleAccessChange(menu._id, 'canEdit', checked)}
              />
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={menu.access.canDelete}
                disabled={!menu.access.canView}
                onCheckedChange={(checked) => handleAccessChange(menu._id, 'canDelete', checked)}
              />
            </TableCell>
          </TableRow>
          
          {hasChildren && isExpanded && renderMenuItems(menu.children, level + 1)}
        </React.Fragment>
      );
    });
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <FormControl>
            <FormLabel htmlFor="roleId">Pilih Role</FormLabel>
            <Select
              id="roleId"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={loading || saving}
            >
              <option value="">Pilih Role</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>
                  {role.namaRole}
                </option>
              ))}
            </Select>
          </FormControl>
          
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Menu</TableHead>
                      <TableHead className="text-center">Lihat</TableHead>
                      <TableHead className="text-center">Tambah</TableHead>
                      <TableHead className="text-center">Edit</TableHead>
                      <TableHead className="text-center">Hapus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuTree.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Tidak ada data menu
                        </TableCell>
                      </TableRow>
                    ) : (
                      renderMenuItems(menuTree)
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={saveChanges} 
                  disabled={saving || !selectedRoleId}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  {!saving && <Save className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuAccessForm;