import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const getPriceDetail = async (token) => {
  return axios.post(
    `${apiUrl}/api/member/fetch_pricing`,
    { },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getNearbyDrivers = async (payload,token) => {
  return axios.post(
    `${apiUrl}/api/member/get_near_by_drivers`,
    payload, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const bookingRequestSend = async (payload,token) => {
  return axios.post(
    `${apiUrl}/api/member/book_ride`,
    payload, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const acceptRideApi = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/accept_ride`,
    payload, 
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const rejectRideApi = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/reject_ride`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getRideDetailById = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/get_ride_details_by_id`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
 
export const getDriverLocation = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/get_ride_details_by_id`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const getActiveRideLive = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/get_active_ride_passenger`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getRideDetailByIdPassenger = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/get_ride_details_by_id`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getRideFareByPassenger = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/get_passenger_final_fare`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getRideHistory = async (payload, token) => {
  return axios.post(
    `${apiUrl}/api/member/get_ride_history`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
// export const updateDriverDetail = async (payload, token) => {
//   return axios.post(`${apiUrl}/api/member/update_driver_details`, payload, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// export const addDriverDetail = async (payload, token) => {
//   return axios.post(`${apiUrl}/api/member/add_driver_details`, payload, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };
