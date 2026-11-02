export const getStorage = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error("Storage read error:", error);
    return fallback;
  }
};

export const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Storage write error:", error);
    return false;
  }
};