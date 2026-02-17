import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const getAdditionalDetails = async (uuid, accessToken) => {
  const response = await axios.post(
    `${apiUrl}/api/merchant/get_additional_detail`,
    { uuid },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data?.data;
};

export const submitAdditionalDetails = async (payload, accessToken) => {
  const url = payload.id
    ? `${apiUrl}/api/merchant/update_additional_details`
    : `${apiUrl}/api/merchant/add_additional_details`;

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};
