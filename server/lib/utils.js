module.exports = function generateUniqueSessionId() {
  function rand() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return `${rand() + rand()}-${rand()}`;
};
