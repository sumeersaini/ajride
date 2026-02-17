import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const fetchVehicleDetails = async (uuid, accessToken) => {
  return axios.post(
    `${apiUrl}/api/merchant/get_vehicle_detail`,
    { uuid },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const addVehicleDetails = async (payload, accessToken) => {
  return axios.post(
    `${apiUrl}/api/merchant/add_vehicle_details`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const updateVehicleDetails = async (payload, accessToken) => {
  return axios.post(
    `${apiUrl}/api/merchant/update_vehicle_details`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
