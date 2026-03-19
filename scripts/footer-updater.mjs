const VERSION_RE = /v\d+\.\d+\.\d+/;

export function readVersion(contents) {
  const match = contents.match(VERSION_RE);
  return match ? match[0].slice(1) : "0.0.0";
}

export function writeVersion(contents, version) {
  return contents.replace(VERSION_RE, `v${version}`);
}
