// Looks for the 3rd "/" and removes every character after it.
// i.e http://localhost:3000/dashboard
// becomes http://localhost:3000
export default function cleanUpUri(_uri) {
  let cleanUri;
  let dashes = 0;
  for (let i = 0; i < _uri.length; i += 1) {
    if (_uri[i] == '/') {
      dashes += 1;
    }
    if (dashes === 3) {
      cleanUri = _uri.substring(0, i);
      break;
    }
  }
  return cleanUri;
}
