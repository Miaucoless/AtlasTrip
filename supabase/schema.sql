-- AtlasTrip Supabase PostgreSQL Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  home_city     TEXT,
  home_country  TEXT,
  travel_style  TEXT[],            -- e.g. ['adventure','luxury']
  languages     TEXT[],
  preferences   JSONB DEFAULT '{}',
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DESTINATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.destinations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  city          TEXT NOT NULL,
  country       TEXT NOT NULL,
  country_code  TEXT,
  continent     TEXT,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  description   TEXT,
  image_url     TEXT,
  thumbnail_url TEXT,
  emoji         TEXT,
  tags          TEXT[],
  category      TEXT,             -- city, beach, mountain, cultural, etc.
  avg_temp_jan  DOUBLE PRECISION,
  avg_temp_jul  DOUBLE PRECISION,
  timezone      TEXT,
  currency      TEXT,
  language      TEXT,
  visa_required BOOLEAN DEFAULT FALSE,
  rating        DOUBLE PRECISION DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  is_trending   BOOLEAN DEFAULT FALSE,
  is_hidden_gem BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITIES (for globe markers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  country       TEXT NOT NULL,
  country_code  TEXT,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  population    BIGINT,
  is_capital    BOOLEAN DEFAULT FALSE,
  airport_code  TEXT,              -- IATA airport code
  marker_size   TEXT DEFAULT 'medium', -- small, medium, large
  destination_id UUID REFERENCES public.destinations(id)
);

-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  cover_image_url  TEXT,
  destination      TEXT,
  destinations     JSONB DEFAULT '[]',  -- array of destination objects
  start_date       DATE,
  end_date         DATE,
  status           TEXT DEFAULT 'planning', -- planning, active, completed, cancelled
  visibility       TEXT DEFAULT 'private',  -- private, shared, public
  budget           NUMERIC(12,2),
  currency         TEXT DEFAULT 'USD',
  budget_spent     NUMERIC(12,2) DEFAULT 0,
  total_distance   DOUBLE PRECISION,         -- miles
  notes            TEXT,
  tags             TEXT[],
  cover_color      TEXT DEFAULT '#1E3A5F',
  is_template      BOOLEAN DEFAULT FALSE,
  share_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIP ITINERARIES (activities, events per day)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_itineraries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number      INTEGER NOT NULL,
  date            DATE,
  title           TEXT,
  type            TEXT DEFAULT 'activity', -- activity, flight, hotel, restaurant, transport, note
  name            TEXT NOT NULL,
  description     TEXT,
  location        TEXT,
  address         TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  start_time      TIME,
  end_time        TIME,
  duration_minutes INTEGER,
  cost            NUMERIC(10,2),
  currency        TEXT DEFAULT 'USD',
  booking_ref     TEXT,
  booking_url     TEXT,
  status          TEXT DEFAULT 'planned',  -- planned, confirmed, cancelled, completed
  image_url       TEXT,
  notes           TEXT,
  sort_order      INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FLIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flights (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id          UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_number    TEXT,
  airline          TEXT,
  airline_code     TEXT,
  origin_airport   TEXT NOT NULL,        -- IATA code
  origin_city      TEXT,
  origin_country   TEXT,
  origin_lat       DOUBLE PRECISION,
  origin_lon       DOUBLE PRECISION,
  dest_airport     TEXT NOT NULL,         -- IATA code
  dest_city        TEXT,
  dest_country     TEXT,
  dest_lat         DOUBLE PRECISION,
  dest_lon         DOUBLE PRECISION,
  departure_time   TIMESTAMPTZ,
  arrival_time     TIMESTAMPTZ,
  duration_minutes INTEGER,
  distance_miles   DOUBLE PRECISION,
  cabin_class      TEXT DEFAULT 'economy',
  seat_number      TEXT,
  price            NUMERIC(10,2),
  currency         TEXT DEFAULT 'USD',
  booking_ref      TEXT,
  status           TEXT DEFAULT 'scheduled',
  is_return        BOOLEAN DEFAULT FALSE,
  amadeus_offer_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HOTELS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hotels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  country         TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  check_in        DATE,
  check_out       DATE,
  nights          INTEGER,
  room_type       TEXT,
  guests          INTEGER DEFAULT 1,
  price_per_night NUMERIC(10,2),
  total_price     NUMERIC(10,2),
  currency        TEXT DEFAULT 'USD',
  booking_ref     TEXT,
  booking_url     TEXT,
  rating          DOUBLE PRECISION,
  image_url       TEXT,
  amenities       TEXT[],
  status          TEXT DEFAULT 'planned',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  city         TEXT,
  country      TEXT,
  address      TEXT,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  cuisine      TEXT[],
  price_range  TEXT,              -- $, $$, $$$, $$$$
  rating       DOUBLE PRECISION,
  image_url    TEXT,
  phone        TEXT,
  website      TEXT,
  opening_hours JSONB,
  tags         TEXT[],
  is_trending  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  city         TEXT,
  country      TEXT,
  venue        TEXT,
  address      TEXT,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  start_date   TIMESTAMPTZ,
  end_date     TIMESTAMPTZ,
  category     TEXT,             -- music, sports, culture, food, etc.
  price        NUMERIC(10,2),
  currency     TEXT DEFAULT 'USD',
  image_url    TEXT,
  organizer    TEXT,
  ticket_url   TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  tags         TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIP COLLABORATORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_collaborators (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT DEFAULT 'viewer',    -- owner, editor, viewer
  status     TEXT DEFAULT 'pending',   -- pending, accepted, declined
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(trip_id, user_id)
);

-- ============================================================
-- TRIP COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trip_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id     UUID,                    -- optional: reference to itinerary item
  content     TEXT NOT NULL,
  parent_id   UUID REFERENCES public.trip_comments(id),
  reactions   JSONB DEFAULT '{}',      -- e.g. {"❤️": ["user1","user2"]}
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY VOTES (for collaborative planning)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  item_id    UUID NOT NULL REFERENCES public.trip_itineraries(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote       TEXT NOT NULL,           -- up, down
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

-- ============================================================
-- USER REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id  UUID REFERENCES public.destinations(id),
  restaurant_id   UUID REFERENCES public.restaurants(id),
  hotel_id        UUID REFERENCES public.hotels(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  content         TEXT,
  images          TEXT[],
  visited_at      DATE,
  helpful_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRAVEL HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.travel_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id        UUID REFERENCES public.trips(id),
  flight_id      UUID REFERENCES public.flights(id),
  destination_id UUID REFERENCES public.destinations(id),
  city           TEXT,
  country        TEXT,
  country_code   TEXT,
  continent      TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  visited_at     DATE NOT NULL,
  duration_days  INTEGER,
  miles_flown    DOUBLE PRECISION,
  notes          TEXT,
  photos         TEXT[],
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED / FAVOURITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_destinations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, destination_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_trips_user_id         ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status          ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_itineraries_trip_id   ON public.trip_itineraries(trip_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_day       ON public.trip_itineraries(trip_id, day_number);
CREATE INDEX IF NOT EXISTS idx_flights_user_id       ON public.flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_trip_id       ON public.flights(trip_id);
CREATE INDEX IF NOT EXISTS idx_hotels_trip_id        ON public.hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_trip    ON public.trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user    ON public.trip_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_trip_id      ON public.trip_comments(trip_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id       ON public.travel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_destinations_country  ON public.destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_trending ON public.destinations(is_trending);
CREATE INDEX IF NOT EXISTS idx_destinations_gem      ON public.destinations(is_hidden_gem);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_itineraries_updated_at
  BEFORE UPDATE ON public.trip_itineraries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.trip_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.user_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGN-UP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone if public"
  ON public.profiles FOR SELECT USING (is_public OR auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- DESTINATIONS (public read)
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are public"
  ON public.destinations FOR SELECT USING (TRUE);

-- CITIES (public read)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are public"
  ON public.cities FOR SELECT USING (TRUE);

-- TRIPS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trips"
  ON public.trips FOR SELECT
  USING (
    user_id = auth.uid()
    OR visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM public.trip_collaborators tc
      WHERE tc.trip_id = id AND tc.user_id = auth.uid() AND tc.status = 'accepted'
    )
  );
CREATE POLICY "Users can insert own trips"
  ON public.trips FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners and editors can update trips"
  ON public.trips FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trip_collaborators tc
      WHERE tc.trip_id = id AND tc.user_id = auth.uid()
        AND tc.role = 'editor' AND tc.status = 'accepted'
    )
  );
CREATE POLICY "Owners can delete trips"
  ON public.trips FOR DELETE USING (user_id = auth.uid());

-- TRIP ITINERARIES
ALTER TABLE public.trip_itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Itinerary access follows trip access"
  ON public.trip_itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
        AND (
          t.user_id = auth.uid()
          OR t.visibility = 'public'
          OR EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = t.id AND tc.user_id = auth.uid() AND tc.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "Owners and editors can insert itinerary items"
  ON public.trip_itineraries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
        AND (
          t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = t.id AND tc.user_id = auth.uid()
              AND tc.role = 'editor' AND tc.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "Owners and editors can update itinerary items"
  ON public.trip_itineraries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
        AND (
          t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = t.id AND tc.user_id = auth.uid()
              AND tc.role = 'editor' AND tc.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "Owners and editors can delete itinerary items"
  ON public.trip_itineraries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
        AND (
          t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = t.id AND tc.user_id = auth.uid()
              AND tc.role = 'editor' AND tc.status = 'accepted'
          )
        )
    )
  );

-- FLIGHTS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own flights"
  ON public.flights FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own flights"
  ON public.flights FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own flights"
  ON public.flights FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own flights"
  ON public.flights FOR DELETE USING (user_id = auth.uid());

-- HOTELS
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hotels"
  ON public.hotels FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own hotels"
  ON public.hotels FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own hotels"
  ON public.hotels FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own hotels"
  ON public.hotels FOR DELETE USING (user_id = auth.uid());

-- RESTAURANTS (public read)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurants are public"
  ON public.restaurants FOR SELECT USING (TRUE);

-- EVENTS (public read)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are public"
  ON public.events FOR SELECT USING (TRUE);

-- TRIP COLLABORATORS
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators can view trip members"
  ON public.trip_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Trip owners can invite collaborators"
  ON public.trip_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Trip owners can update collaborator roles"
  ON public.trip_collaborators FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Trip owners can remove collaborators"
  ON public.trip_collaborators FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND t.user_id = auth.uid()
    )
  );

-- TRIP COMMENTS
ALTER TABLE public.trip_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip members can view comments"
  ON public.trip_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
        AND (
          t.user_id = auth.uid()
          OR t.visibility = 'public'
          OR EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = t.id AND tc.user_id = auth.uid() AND tc.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "Trip members can add comments"
  ON public.trip_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
        AND (
          t.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = t.id AND tc.user_id = auth.uid() AND tc.status = 'accepted'
          )
        )
    )
  );
CREATE POLICY "Users can update own comments"
  ON public.trip_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments"
  ON public.trip_comments FOR DELETE USING (user_id = auth.uid());

-- ACTIVITY VOTES
ALTER TABLE public.activity_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip members can view votes"
  ON public.activity_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND (
        t.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.trip_collaborators tc
          WHERE tc.trip_id = t.id AND tc.user_id = auth.uid() AND tc.status = 'accepted'
        )
      )
    )
  );
CREATE POLICY "Trip members can vote"
  ON public.activity_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own votes"
  ON public.activity_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own votes"
  ON public.activity_votes FOR DELETE USING (user_id = auth.uid());

-- USER REVIEWS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public"
  ON public.user_reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own reviews"
  ON public.user_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews"
  ON public.user_reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reviews"
  ON public.user_reviews FOR DELETE USING (user_id = auth.uid());

-- TRAVEL HISTORY
ALTER TABLE public.travel_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own travel history"
  ON public.travel_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own travel history"
  ON public.travel_history FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own travel history"
  ON public.travel_history FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own travel history"
  ON public.travel_history FOR DELETE USING (user_id = auth.uid());

-- SAVED DESTINATIONS
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved destinations"
  ON public.saved_destinations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can save destinations"
  ON public.saved_destinations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove saved destinations"
  ON public.saved_destinations FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS (run via Supabase Dashboard or CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-documents', 'trip-documents', false);

-- Storage RLS (example for trip-photos bucket)
-- CREATE POLICY "Users can upload own trip photos"
--   ON storage.objects FOR INSERT WITH CHECK (
--     bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]
--   );
-- CREATE POLICY "Users can view own trip photos"
--   ON storage.objects FOR SELECT USING (
--     bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]
--   );
-- CREATE POLICY "Avatars are public"
--   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT WITH CHECK (
--     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================
-- REALTIME PUBLICATIONS
-- ============================================================
-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_itineraries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
