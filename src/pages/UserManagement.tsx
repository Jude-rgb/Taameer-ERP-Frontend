import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, ToggleRight, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { UserModal } from '@/components/modals/UserModal';
import { useUserStore } from '@/store/useUserStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  contact_number?: string;
  status?: string;
  created_at?: string;
  avatar?: string;
}

export const UserManagement = () => {
  const { users, fetchUsers, isLoading } = useUserStore();
  const { toast } = useToast();
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number | string>>(new Set());

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch users",
          variant: "destructive",
        });
      }
    };

    loadUsers();
  }, [fetchUsers, toast]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('add');
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Implement delete functionality when API is available
    toast({
      title: "Info",
      description: "Delete functionality will be implemented when API is available",
      variant: "info",
    });
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Get role badge styling
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-500 text-white';
      case 'ADMIN':
        return 'bg-blue-500 text-white';
      case 'Marketing_Officer':
        return 'bg-green-500 text-white';
      case 'Accounts':
        return 'bg-yellow-500 text-black';
      case 'Warehouse':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get status badge styling
  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (fullName: string) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Table columns definition
  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-primary text-white font-medium">
              {getUserInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{user.full_name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <Badge className={getRoleBadgeColor(user.role)}>
          {user.role?.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user) => (
        user.contact_number ? (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {user.contact_number}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <Badge className={getStatusBadgeColor(user.status)}>
          {user.status || 'Active'}
        </Badge>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (user) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {user.created_at ? formatDate(user.created_at) : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
                     <ActionButton
             icon={ToggleRight}
             tooltip="Change status"
             color="green"
             onClick={() => {
               // TODO: Implement status change
             }}
           />
           <ActionButton
             icon={Edit}
             tooltip="Edit User"
             color="blue"
             onClick={() => handleEditUser(user)}
           />
           <ActionButton
             icon={Trash2}
             tooltip="Delete User"
             color="red"
             onClick={() => handleDeleteUser(user)}
           />
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage system users and permissions</p>
      </motion.div>

      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                System Users
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
            <Button 
              onClick={handleAddUser} 
              className="hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            searchKey="full_name"
            searchPlaceholder="Search users..."
            loading={isLoading}
            onRowSelect={setSelectedUserIds}
            emptyMessage="No users available."
            idKey="id"
          />
        </CardContent>
      </Card>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        mode={modalMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.full_name}? This action cannot be undone.`}
      />
    </div>
  );
};