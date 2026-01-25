const PROFILE_PHOTO_KEY = "org.profile.photo";
const PROFILE_NAME_KEY = "org.profile.name";

export const getProfilePhoto = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PROFILE_PHOTO_KEY);
};

export const setProfilePhoto = (value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_PHOTO_KEY, value);
};

export const clearProfilePhoto = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PROFILE_PHOTO_KEY);
};

export const getProfileName = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PROFILE_NAME_KEY);
};

export const setProfileName = (value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_NAME_KEY, value);
};
