import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserX, ChevronLeft } from 'lucide-react';
import { adminApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Pagination, Badge } from '../../components/ui';
import { formatDate } from '../../utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => adminApi.getUsers(page, 20),
  });

  const pageData = data?.data?.data;
  const users = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const handleToggleUser = async (user) => {
    try {
      if (user.isActive) {
        await adminApi.deactivateUser(user.id);
        toast.success('User deactivated');
      } else {
        await adminApi.activateUser(user.id);
        toast.success('User activated');
      }
      queryClient.invalidateQueries(['admin', 'users']);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : (
          <>
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">User</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Roles</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Joined</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.map(role => (
                            <Badge key={role} variant={
                              role === 'ADMIN' ? 'danger' :
                              role === 'SELLER' ? 'warning' : 'primary'
                            }>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleUser(user)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {user.isActive ? (
                            <><UserX size={14} /> Deactivate</>
                          ) : (
                            <><UserCheck size={14} /> Activate</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsersPage;