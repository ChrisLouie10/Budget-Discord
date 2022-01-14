function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers?.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.split('=');
      const trimmedName = name?.trim();
      if (!trimmedName) return;
      const value = rest.join('=').trim();
      if (!value) return;
      cookies[trimmedName] = value;
    });
  }
  return cookies;
}

module.exports = {
  parseCookies,
};
