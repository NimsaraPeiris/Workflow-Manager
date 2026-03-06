import { supabase } from '../lib/supabaseClient';
import { hasPermission } from '../lib/permissions';
import type { PermissionKey } from '../lib/permissions';
import { useEffect, useState } from 'react';

export function usePermissions() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Database error fetching profile:', error);
                return;
            }

            if (data) {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile in usePermissions:', err);
        }
    };

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    await fetchProfile(currentUser.id);
                }
            } catch (err) {
                console.error('Error in usePermissions hook:', err);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const check = (permission: PermissionKey) => {
        // Prefer database profile for fresh permissions, fallback to auth metadata
        return hasPermission(profile || user, permission);
    };

    return { user: profile || user, loading, check, hasPermission: check };
}
