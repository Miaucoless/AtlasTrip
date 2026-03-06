import { supabase } from './supabase';

/**
 * Register a new user with Supabase Auth.
 */
export async function register(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });
  if (error) throw error;

  // Create/update profile
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: name,
    });
  }

  return data.user;
}

/**
 * Sign in with email and password.
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

/**
 * Sign out the current user.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session (includes access_token).
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current access token for API calls.
 */
export async function getStoredToken() {
  const session = await getSession();
  return session?.access_token || null;
}

/**
 * Check if user is currently authenticated.
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

/**
 * Update the user's profile.
 */
export async function updateProfile(data) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

/**
 * Upload an avatar image to Supabase Storage.
 */
export async function uploadAvatar(uri) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = uri.split('.').pop();
  const filePath = `${user.id}/avatar.${fileExt}`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType: `image/${fileExt}`,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Reset password (sends email).
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });
  return subscription;
}

