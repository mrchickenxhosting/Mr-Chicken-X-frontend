  import axios from '../utils/axios';

  // ===================Dashboard Data ===========================

  export const getDashboardData = async () => {
    const response = await axios.get('trader/dashboard');
    return response.data;
  }

  // =================== Managers, Drivers, Customers, Farmers  Masters===========================
  export const getallManager = async () => {
    const response = await axios.get('trader/managers');
    return response.data;
  };

  export const getallDriver = async () => {
    const response = await axios.get('trader/drivers');
    return response.data;
  };

  export const getallCustomer = async () => {
    const response = await axios.get('trader/customers');
    return response.data;
  };

  export const getallFarmer = async () => {
    const response = await axios.get('trader/farmers');
    return response.data;
  };

  // =================== Add/Update Managers, Drivers, Customers, Farmers  Masters===========================


  export const createManager = async (payload) => {
    const response = await axios.post('trader/managers', payload);
    return response.data;
  };

  export const createDriver = async (payload) => {
    const response = await axios.post('trader/drivers', payload);
    return response.data;
  }

  export const createCustomer = async (payload) => {
    const response = await axios.post('trader/customers', payload);
    return response.data;
  };

  export const createFarmer = async (payload) => {
    const response = await axios.post('trader/farmers', payload);
    return response.data;
  }



  // ========================= Customer Outstanding ============================

  export const getCustomerOutstanding = async () => {
    const response = await axios.get('trader/customers/outstanding');
    return response.data;
  }

  export const creditCustomer = async (customerId, amount) => {
  const res = await axios.post(
    `/trader/customers/${customerId}/credit`,
    { amount }
  );
  return res.data;
};



  // ======================= Trip Data ===========================

  export const CreateTrip = async (payload) => {
    const response = await axios.post('trader/trips', payload);
    return response.data;
  }

  export const getallTrips = async () => {
    const response = await axios.get('trader/trips');
    return response.data;
  }

  export const updateTrip = async (tripId, payload) => {
    const response = await axios.patch(`trader/trips/${tripId}`, payload);
    return response.data;
  }

  export const deleteTrip = async (tripId) => {
    const response = await axios.delete(`trader/trips/${tripId}`);
    return response.data;
  }
// ======================= Trip Sales ===========================

export const getTripSales = async (tripId) => {
  const response = await axios.get(`trader/trips/${tripId}/sales`);
  return response.data;
};

export const closeTripDay = async (tripId, payload = {}) => {
  const response = await axios.post(
    `trader/trips/${tripId}/close-day`,
    payload
  );
  return response.data;
};


// ======================= Report Data ===========================

export const getReportData = async (filters) => {
  const response = await axios.post('trader/reports', filters);
  return response.data;
};

export const getTripReportData = async (tripId) => {
  const response = await axios.get(`trader/trips/${tripId}`);
  return response.data;
}

export const getCustomerReportData = async (customerId) => {
  const response = await axios.post(`trader/reports/customer-ledger`);
  return response.data;
}

export const getTripReport = async () => {
  const response = await axios.post(`trader/reports/trips`);
  return response.data;
}

// ======================= Update Data ===========================

export const UpdateManager = async (managerId, payload) => {
  const response = await axios.patch(`trader/managers/${managerId}`, payload);
  return response.data;
}

export const deleteManager = async (managerId) => {
  const response = await axios.delete(`trader/managers/${managerId}`);
  return response.data;
}

export const disableManager = async (managerId, status) => {
  const response = await axios.patch(
    `trader/managers/${managerId}/status`,
    { status }
  );
  return response.data;
};


export const UpdateDriver = async (driverId, payload) => {
  const response = await axios.patch(`trader/drivers/${driverId}`, payload);
  return response.data;
}

export const deleteDriver = async (driverId) => {
  const response = await axios.delete(`trader/drivers/${driverId}`);
  return response.data;
}

export const disableDriver = async (driverId, status) => {
  const response = await axios.patch(
    `trader/drivers/${driverId}/status`,
    { status }
  );
  return response.data;
}

export const UpdateCustomer = async (customerId, payload) => {
  const response = await axios.patch(`trader/customers/${customerId}`, payload);
  return response.data;
}

export const deleteCustomer = async (customerId) => {
  const response = await axios.delete(`trader/customers/${customerId}`);
  return response.data;
} 

export const disableCustomer = async (customerId, status) => {
  const response = await axios.patch(
    `trader/customers/${customerId}/status`,
    { status }
  );
  return response.data;
}

export const UpdateFarmer = async (farmerId, payload) => {
  const response = await axios.patch(`trader/farmers/${farmerId}`, payload);
  return response.data;
}

export const deleteFarmer = async (farmerId) => {
  const response = await axios.delete(`trader/farmers/${farmerId}`);
  return response.data;
}

export const disableFarmer = async (farmerId, status) => {
  const response = await axios.patch(
    `trader/farmers/${farmerId}/status`,
    { status }
  );
  return response.data;
}