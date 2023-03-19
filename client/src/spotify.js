import axios from 'axios';

const LOCALSTRAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
};

const LOCALSTRAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTRAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTRAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTRAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTRAGE_KEYS.timestamp),
};

export const logout = () => {
  for (const prop in LOCALSTRAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTRAGE_KEYS[prop]);
  }

  window.location = window.location.origin;
};

const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTRAGE_VALUES;
  if (!accessToken || !timestamp) {
    return false;
  }
  const timeElapsed = Date.now() - Number(timestamp);
  return timeElapsed / 1000 > Number(expireTime);
};

const refreshToken = async () => {
  try {
    if (
      !LOCALSTRAGE_VALUES.refreshToken ||
      LOCALSTRAGE_VALUES.refreshToken === 'undefined' ||
      Date.now() - Number(LOCALSTRAGE_VALUES.timestamp) / 1000 < 1000
    ) {
      console.error('No token');
      logout();
    }

    const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTRAGE_VALUES.refreshToken}`);

    window.localStorage.setItem(LOCALSTRAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTRAGE_KEYS.timestamp, Date.now());

    window.location.reload();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Handles logic for retrieving the Spotify access token from localStorage
 * or URL query params
 * @returns {string} A Spotify access token
 */
const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTRAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTRAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTRAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  const err = urlParams.get('error');

  // If there's an error or the token has expired, refresh the token
  if (err || hasTokenExpired() || LOCALSTRAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  // If there is a valid access token in localStorage, use that token
  if (LOCALSTRAGE_VALUES.accessToken && LOCALSTRAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTRAGE_VALUES.accessToken;
  }

  // If there is a token in the URL query param, user is first time user
  if (queryParams[LOCALSTRAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const prop in queryParams) {
      window.localStorage.setItem(prop, queryParams[prop]);
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTRAGE_KEYS.timestamp, Date.now());

    // Return access token
    return queryParams[LOCALSTRAGE_KEYS.accessToken];
  }

  return false;
};

export const accessToken = getAccessToken();

/**
 * Axios global request headers
 * https://github.com/axios/axios#global-axios-defaults
 */
axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
axios.defaults.headers['Content-Type'] = 'application/json';

/**
 * Get current user's profile
 */

export const getCurrentUserProfile = () => axios.get('/me');

/**
 * Get a list of current user's playlists
 */
export const getCurrentUserPlaylists = (limit = 20) => {
  return axios.get(`/me/playlists?limit=${limit}`);
};

/**
 * Get a list of user's top artists
 */
export const getTopArtists = (time_range = 'short_term') => {
  return axios.get(`/me/top/artists?time_range=${time_range}`);
};

/**
 * Get a list of user's top tracks
 */
export const getTopTracks = (time_range = 'short_term') => {
  return axios.get(`/me/top/tracks?time_range=${time_range}`);
};

/**
 * Get a playlist by its ID
 */
export const getPlaylistById = (playlist_id) => {
  return axios.get(`/playlists/${playlist_id}`);
};

/**
 * Get audio features for tracks
 */
export const getAudioFeaturesForTracks = (ids) => {
  return axios.get(`/audio-features?ids=${ids}`);
};
