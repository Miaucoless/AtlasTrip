import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

/**
 * useRealtimeTrip – subscribes to real-time changes on a trip's itinerary,
 * comments, and collaborators via Supabase Realtime.
 */
export function useRealtimeTrip(tripId) {
  const [itineraryItems, setItineraryItems] = useState([]);
  const [comments, setComments] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // Initial data fetch
  const fetchData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);

    const [itemsRes, commentsRes, collabRes] = await Promise.all([
      supabase
        .from('trip_itineraries')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true })
        .order('sort_order', { ascending: true }),
      supabase
        .from('trip_comments')
        .select('*, profiles(id, full_name, avatar_url)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true }),
      supabase
        .from('trip_collaborators')
        .select('*, profiles(id, full_name, avatar_url, username)')
        .eq('trip_id', tripId),
    ]);

    setItineraryItems(itemsRes.data || []);
    setComments(commentsRes.data || []);
    setCollaborators(collabRes.data || []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;

    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`trip-${tripId}`)
      // Itinerary items
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_itineraries', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setItineraryItems((prev) => [...prev, payload.new].sort((a, b) =>
            a.day_number !== b.day_number
              ? a.day_number - b.day_number
              : a.sort_order - b.sort_order,
          ));
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trip_itineraries', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setItineraryItems((prev) =>
            prev.map((item) => (item.id === payload.new.id ? payload.new : item)),
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'trip_itineraries', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setItineraryItems((prev) => prev.filter((item) => item.id !== payload.old.id));
        },
      )
      // Comments
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_comments', filter: `trip_id=eq.${tripId}` },
        async (payload) => {
          // Fetch with profile data
          const { data } = await supabase
            .from('trip_comments')
            .select('*, profiles(id, full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          if (data) setComments((prev) => [...prev, data]);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchData]);

  const addComment = useCallback(async (content, itemId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('trip_comments').insert({
      trip_id: tripId,
      user_id: user.id,
      content,
      item_id: itemId,
    });
    if (error) throw error;
  }, [tripId]);

  const addItem = useCallback(async (item) => {
    const { data, error } = await supabase
      .from('trip_itineraries')
      .insert({ ...item, trip_id: tripId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [tripId]);

  const updateItem = useCallback(async (itemId, updates) => {
    const { data, error } = await supabase
      .from('trip_itineraries')
      .update(updates)
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [tripId]);

  const deleteItem = useCallback(async (itemId) => {
    const { error } = await supabase
      .from('trip_itineraries')
      .delete()
      .eq('id', itemId)
      .eq('trip_id', tripId);
    if (error) throw error;
  }, [tripId]);

  const voteOnItem = useCallback(async (itemId, vote) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('activity_votes').upsert({
      trip_id: tripId,
      item_id: itemId,
      user_id: user.id,
      vote,
    }, { onConflict: 'item_id,user_id' });
    if (error) throw error;
  }, [tripId]);

  return {
    itineraryItems,
    comments,
    collaborators,
    loading,
    refresh: fetchData,
    addComment,
    addItem,
    updateItem,
    deleteItem,
    voteOnItem,
  };
}
