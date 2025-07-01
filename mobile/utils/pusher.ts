import Pusher from 'pusher-js/react-native';
import { PUSHER_KEY, PUSHER_CLUSTER, API_URL } from '@/utils/constants';

let pusher: Pusher | null = null;

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

export const initializePusher = async (getToken: () => Promise<string | null>) => {
  if (pusher) return pusher; // Return existing instance if already initialized

  const token = await getToken();
  if (!token) {
    console.error("Pusher: No auth token found. Cannot initialize.");
    return null;
  }

  pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    authorizer: (channel) => {
      return {
        authorize: (socketId, callback) => {
          fetch(`${API_URL}/pusher/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // This is the crucial part: send the auth token
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            // Log the error more clearly
            console.error(`Pusher auth failed with status: ${response.status}`);
            throw new Error(`Failed to authenticate: ${response.status}`);
          })
          .then((data) => {
            callback(null, data);
          })
          .catch((error) => {
            callback(error, { auth: '' });
          });
        },
      };
    },
  });

  return pusher;
};

export const getPusher = () => {
    if (!pusher) {
        // This can happen if getPusher is called before initialization.
        // Depending on your app's logic, you might want to handle this differently.
        console.warn("Pusher has not been initialized yet.");
    }
    return pusher;
};