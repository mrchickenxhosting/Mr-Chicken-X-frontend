import axios from '../utils/axios';

// =================== TRIPS ===========================

// Get trips assigned to logged-in driver
export const getassignedTrips = async () => {
  const response = await axios.get('driver/trips');
  return response.data;
};

// =================== CAGE LIFTING ===========================

// 1️⃣ Add / Update a cage entry (DEFAULT / RED / BLUE / BLACK)
export const addCageEntry = async ({
  tripId,
  cageNumber,
  color,
  bird_count,
  weight,
}) => {
  const response = await axios.post(
    `driver/trips/${tripId}/cages/${cageNumber}/entries`,
    {
      color,        // 'DEFAULT' | 'RED' | 'BLUE' | 'BLACK'
      bird_count,   // number
      weight,       // number
    }
  );

  return response.data;
};

// 2️⃣ Reset a particular cage (delete all entries of that cage)
export const resetCage = async ({ tripId, cageNumber }) => {
  const response = await axios.delete(
    `driver/trips/${tripId}/cages/${cageNumber}`
  );

  return response.data;
};

// 3️⃣ Complete / Lift trip (finalize totals & status)
export const completeTrip = async (tripId) => {
  const response = await axios.post(
    `driver/trips/${tripId}/complete`
  );

  return response.data;
};

export const getTripCages = async (tripId) => {
  const response = await axios.get(
    `driver/trips/${tripId}/cages`
  );
  return response.data;
};

export const sellToCustomer = async ({
  tripId,

  customer_id,
  target_driver_id,
  sale_target_type,

  cage_numbers,
  sell_type,
  bird_count,
  weight,
  rate,
  total_amount,
  payment_mode,
  cash_amount,
  upi_amount,
}) => {
  const response = await axios.post(
    `driver/trips/${tripId}/sell`,
    {
      customer_id,
      target_driver_id,
      sale_target_type,

      cage_numbers,
      sell_type,
      bird_count,
      weight,
      rate,
      total_amount,
      payment_mode,
      cash_amount,
      upi_amount,
    }
  );

  return response.data;
};
