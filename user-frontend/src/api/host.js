import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const getHostDetail = async (uuid, accessToken) => {
  return axios.post(
    `${apiUrl}/api/merchant/get_host_detail`,
    { uuid },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const submitOrUpdateHost = async (data, accessToken, isUpdate = false) => {
  const endpoint = isUpdate ? "update_host_details" : "add_host_details";
  return axios.post(`${apiUrl}/api/merchant/${endpoint}`, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
