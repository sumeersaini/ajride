import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const saveNotificationToken = async (push_token, platform, token,browser) => {
    console.log("token",push_token, platform, token)
  return axios.post(
    `${apiUrl}/api/member/save_push_notification`,
    { push_token, platform, browser },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const removeNotificationToken = async (platform, browser, token) => {
    // console.log("token",push_token, platform, token)
  return axios.post(
    `${apiUrl}/api/member/remove_push_notification`,
    { platform, browser },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

