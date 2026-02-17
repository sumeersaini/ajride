import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const getDriverDetail = async (uuid, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/get_driver_detail`,
    { uuid },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateDriverDetail = async (payload, token) => {
  return axios.post(`${apiUrl}/api/merchant/update_driver_details`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addDriverDetail = async (payload, token) => {
  return axios.post(`${apiUrl}/api/merchant/add_driver_details`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getDriverStatus = async (payload, token) => {
  return axios.post(`${apiUrl}/api/merchant/get_driver_status`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addOrUpdateStatus = async (payload, token) => {
  return axios.post(`${apiUrl}/api/merchant/add_update_driver_status`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getRideDetailByIdMerchant = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/get_ride_detail_by_merchant`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getActiveRide = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/get_active_ride`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const startRide = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/start_ride`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const reachDriver = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/reach_driver`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const cancelRide = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/cancel_ride`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const endRide = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/end_ride`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getRideFareBytMerchant = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/merchant/get_driver_final_fare`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getRideHistoryDriver = async (payload, token) => {
  console.log("api--",payload)
  return axios.post(
    `${apiUrl}/api/merchant/get_ride_history_driver`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
 