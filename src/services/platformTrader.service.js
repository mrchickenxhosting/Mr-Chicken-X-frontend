import axios from '../utils/axios';

export const getPlatformTraders = async () => {
  const response = await axios.get('platform/traders');
  return response.data;
};

export const createPlatformTrader = async (payload) => {
  const response = await axios.post('platform/traders', payload);
  return response.data;
}

export const updatePlatformTrader = async (traderId, payload) => {
  const response = await axios.patch(`platform/traders/${traderId}`, payload);
  return response.data;
};

export const disablePlatformTrader = async (traderId) => {
  const response = await axios.patch(
    `platform/traders/${traderId}/status`,
    { status: false }
  );
  return response.data;
};


export const enablePlatformTrader = async (traderId) => {
  const response = await axios.patch(
    `platform/traders/${traderId}/status`,
    { status: true }
  );
  return response.data;
};


export const deletePlatformTrader = async (traderId) => {
  const response = await axios.delete(`platform/traders/${traderId}`);
  return response.data;
}
