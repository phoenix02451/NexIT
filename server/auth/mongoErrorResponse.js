function isMongoConnectivityError(err) {
  if (!err || !err.name) return false;
  return (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoNotConnectedError' ||
    err.message?.includes('MongooseError') ||
    err.message?.includes('buffering timed out')
  );
}

function mongoMessage() {
  return 'The database is not reachable. Set MONGO_URI in the server environment (e.g. Netlify → Environment variables).';
}

module.exports = { isMongoConnectivityError, mongoMessage };
