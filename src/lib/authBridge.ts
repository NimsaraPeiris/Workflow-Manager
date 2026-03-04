import { supabase } from './supabaseClient';

const BRIDGE_URL = import.meta.env.VITE_AUTH_BRIDGE_URL || 'http://localhost:3001';

export const authBridge = {
    /**
     * Exchanges an external JWT for a Supabase session via the Auth Bridge backend.
     * @param externalToken The JWT from the external IDP.
     */
    async signInWithExternalToken(externalToken: string) {
        try {
            const response = await fetch(`${BRIDGE_URL}/api/auth/bridge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ externalToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to authenticate via Bridge');
            }

            const { session, user } = await response.json();

            // Set the session in the Supabase client
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            });

            if (sessionError) throw sessionError;

            return { session, user };
        } catch (error) {
            console.error('Auth Bridge Error:', error);
            throw error;
        }
    },
};
