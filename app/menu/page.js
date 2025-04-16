'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  Edit, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import MenuForm from '@/components/forms/MenuForm';
import api from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';

const MenuManagementPage = () => {
  const router = useRouter();
  const { user, checkPermission } = useAuth();
  const [menuTree, setMenuTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // Check if user has permission to manage menus
  useEffect(() => {
    if (user && !checkPermission('manage_menus') && !checkPermission('view_menus')) {
      toast.error('Anda tidak memiliki akses ke halaman ini');
      router.push('/dashboard');
    }
  }, [user, router, checkPermission]);
  
  // Fetch menu tree
  const fetchMenuTree = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menus/tree');
      setMenuTree(response.data.data);
    } catch (error) {
      console.error('Error fetching menu tree:', error);
      toast.error('Gagal mengambil data menu');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMenuTree();
  }, []);
  
  // Toggle expanded state for a menu
  const toggleExpand = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  // Handle edit menu
  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setIsFormDialogOpen(true);
  };
  
  // Handle delete menu
  const handleDeleteMenu = (menu) => {
    setSelectedMenu(menu);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete menu
  const confirmDeleteMenu = async () => {
    try {
      await api.delete(`/menus/${selectedMenu._id}`);
      toast.success('Menu berhasil dihapus');
      fetchMenuTree();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus menu');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMenu(null);
    }
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setSelectedMenu(null);
    fetchMenuTree();
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
            <TableCell>{menu.code}</TableCell>
            <TableCell>{menu.path}</TableCell>
            <TableCell>{menu.icon}</TableCell>
            <TableCell className="text-center">{menu.order}</TableCell>
            <TableCell className="text-center">
              {menu.isActive ? (
                <Eye className="h-4 w-4 text-green-500 mx-auto" />
              ) : (
                <EyeOff className="h-4 w-4 text-red-500 mx-auto" />
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditMenu(menu)}
                  disabled={!checkPermission('manage_menus')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMenu(menu)}
                  disabled={!checkPermission('manage_menus')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          
          {hasChildren && isExpanded && renderMenuItems(menu.children, level + 1)}
        </React.Fragment>
      );
    });
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Menu</h1>
          
          {checkPermission('manage_menus') && (
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Menu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                  </DialogTitle>
                </DialogHeader>
                <MenuForm
                  menu={selectedMenu}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsFormDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Menu</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Memuat data...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Menu</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead className="text-center">Urutan</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuTree.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Tidak ada data menu
                        </TableCell>
                      </TableRow>
                    ) : (
                      renderMenuItems(menuTree)
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Menu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Apakah Anda yakin ingin menghapus menu <strong>{selectedMenu?.name}</strong>?
            </p>
            <p className="text-sm text-red-500 mt-2">
              Perhatian: Menu yang memiliki sub-menu tidak dapat dihapus.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMenu}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MenuManagementPage;