export async function updateProfile(data, token) {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/merchant/update_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    return await response.json();
  } catch (err) {
    console.error("updateProfile error:", err);
    throw err;
  }
}


export async function checkMerchant(token) {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/member/check_merchant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
     
    });

    if (!response.ok) {
      throw new Error("Failed to get merchant");
    }

    return await response.json();
  } catch (err) {
    console.error("check_merchant error:", err);
    throw err;
  }
}

