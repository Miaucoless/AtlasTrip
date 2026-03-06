const express = require('express');
const axios = require('axios');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Cache Amadeus token (in-memory for simplicity; use Redis in production)
let amadeusToken = null;
let amadeusTokenExpiry = 0;

async function getAmadeusToken() {
  if (amadeusToken && Date.now() < amadeusTokenExpiry) return amadeusToken;

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await axios.post(
    'https://test.api.amadeus.com/v1/security/oauth2/token',
    `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  amadeusToken = response.data.access_token;
  amadeusTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return amadeusToken;
}

// All flight routes require authentication
router.use(protect);

// GET /api/flights/search?origin=&destination=&departureDate=&adults=&returnDate=
router.get('/search', async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, adults = 1, travelClass = 'ECONOMY' } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ success: false, message: 'origin, destination, departureDate are required' });
    }

    const token = await getAmadeusToken();
    if (!token) {
      return res.status(503).json({ success: false, message: 'Flight search service not configured' });
    }

    const params = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults: Number(adults),
      travelClass,
      max: 10,
      currencyCode: 'USD',
    };
    if (returnDate) params.returnDate = returnDate;

    const { data } = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const offers = (data.data || []).map((offer) => ({
      id: offer.id,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      itineraries: offer.itineraries.map((itin) => ({
        duration: itin.duration,
        segments: itin.segments.map((seg) => ({
          departure: {
            iataCode: seg.departure.iataCode,
            at: seg.departure.at,
          },
          arrival: {
            iataCode: seg.arrival.iataCode,
            at: seg.arrival.at,
          },
          carrierCode: seg.carrierCode,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          duration: seg.duration,
          numberOfStops: seg.numberOfStops,
        })),
      })),
      numberOfBookableSeats: offer.numberOfBookableSeats,
      lastTicketingDate: offer.lastTicketingDate,
    }));

    res.json({ success: true, offers, meta: data.meta });
  } catch (err) {
    if (err.response?.status === 400) {
      return res.status(400).json({ success: false, message: 'Invalid search parameters', details: err.response.data });
    }
    next(err);
  }
});

// GET /api/flights – list user's saved flights
router.get('/', async (req, res, next) => {
  try {
    const { trip_id } = req.query;
    let query = supabase
      .from('flights')
      .select('*')
      .eq('user_id', req.user.id)
      .order('departure_time', { ascending: true });

    if (trip_id) query = query.eq('trip_id', trip_id);

    const { data: flights, error } = await query;
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, flights });
  } catch (err) {
    next(err);
  }
});

// POST /api/flights – save a flight to a trip
router.post('/', async (req, res, next) => {
  try {
    const { data: flight, error } = await supabase
      .from('flights')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, flight });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/flights/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Flight removed' });
  } catch (err) {
    next(err);
  }
});

// GET /api/flights/history – user's travel history for flight map
router.get('/history/map', async (req, res, next) => {
  try {
    const { data: flights, error } = await supabase
      .from('flights')
      .select('origin_airport, origin_city, origin_lat, origin_lon, dest_airport, dest_city, dest_lat, dest_lon, departure_time, airline, distance_miles')
      .eq('user_id', req.user.id)
      .eq('status', 'completed')
      .order('departure_time', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: error.message });

    const totalMiles = flights.reduce((sum, f) => sum + (f.distance_miles || 0), 0);
    const countries = [...new Set(flights.map((f) => f.dest_city?.split(',')[1]?.trim()).filter(Boolean))];

    res.json({
      success: true,
      flights,
      stats: {
        totalFlights: flights.length,
        totalMiles: Math.round(totalMiles),
        countriesVisited: countries.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
