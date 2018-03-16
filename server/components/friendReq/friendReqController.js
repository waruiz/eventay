const db = require('../../db/db');
// import db from '../../db/db';

// export const pendingRequests = async () => {
// };

const sendRequest = async (payload) => {
  try {
    const query = `
      INSERT INTO friendships (userId, targetId, isAccepted)
      VALUES (${payload.userId}, ${payload.targetId}, FALSE)
      RETURNING userId, targetId
    `;
    const data = await db.queryAsync(query);
    return data;
  } catch (err) {
    console.log(`Error during friendship POST request: ${err}`);
  }
};

const acceptRequest = async (payload) => {
  try {
    const query = `
      UPDATE friendships
      SET isAccepted='TRUE'
      WHERE userId='${payload.userId}', targetId='${payload.targetId}'
      RETURNING userId, targetId, isAccepted
    `;
    const data = await db.queryAsync(query);
    return data;
  } catch (err) {
    console.log(`Error during friendship GET request: ${err}`);
  }
};

const declineRequest = async (payload) => {
  try {
    const query = `
      DELETE FROM friendships
      WHERE userId='${payload.userId}', targetId='${payload.targetId}'
      RETURNING userId, targetId
    `;
    const data = await db.queryAsync(query);
    return data;
  } catch (err) {
    console.log(`Error during frienship DELETE request: ${err}`);
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  declineRequest,
};
