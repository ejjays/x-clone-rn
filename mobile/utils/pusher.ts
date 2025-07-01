import Pusher from 'pusher-js/react-native';
import { PUSHER_KEY, PUSHER_CLUSTER, API_URL } from '@/utils/constants';

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

export const pusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  // Add this for presence channels
  authorizer: (channel) => {
    return {
      authorize: (socketId, callback) => {
        fetch(`${API_URL}/pusher/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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