import { fetchUsers as fetchUsersApi, createUser as createUserApi, updateUser as updateUserApi, deleteUser as deleteUserApi, setRoleUser as setRoleUserApi } from '@/lib/admin/users';
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';

export function useUsersAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho từng thao tác
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [settingRole, setSettingRole] = useState(false);

    // Fetch users
    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUsersApi();
            setUsers(data);
        } catch (err: any) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    // Create user
    const createUser = async (userData: User) => {
        setCreating(true);
        setError(null);
        try {
            const response = await createUserApi(userData);
            await fetchAllUsers();
            return response;
        } catch (err: any) {
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setCreating(false);
        }
    };

    // Update user
    const updateUser = async (userId: string, userData: Partial<User>) => {
        setUpdating(true);
        setError(null);
        try {
            const response = await updateUserApi(userId, userData);
            await fetchAllUsers();
            return response;
        } catch (err: any) {
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    // Delete user
    const deleteUser = async (userId: string) => {
        setDeleting(true);
        setError(null);
        try {
            const response = await deleteUserApi(userId);
            await fetchAllUsers();
            return response;
        } catch (err: any) {
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setDeleting(false);
        }
    };

    // Set user role
    const setUserRole = async (userId: string, role: string) => {
        setSettingRole(true);
        setError(null);
        try {
            const response = await setRoleUserApi(userId, role);
            await fetchAllUsers();
            return response;
        } catch (err: any) {
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setSettingRole(false);
        }
    };

    return {
        users, loading, error,
        creating, updating, deleting, settingRole,
        fetchAllUsers, createUser, updateUser, deleteUser, setUserRole
    };
}