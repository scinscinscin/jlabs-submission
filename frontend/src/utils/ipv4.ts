export function isPublicIPv4(ip: string): { validity: true } | { validity: false; reason: string } {
  // Regex from https://stackoverflow.com/questions/4460586
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return { validity: false, reason: "Invalid IPv4 address format" };
  }

  const parts = ip.split(".").map(Number);

  // Check that each octet is up to 255
  if (parts.some((p) => p < 0 || p > 255)) {
    return { validity: false, reason: "Invalid IPv4 address format" };
  }

  const [a, b] = parts;

  // Exclude private ranges

  if (a === 10) return { validity: false, reason: "Private / Internal IPv4 address" };
  if (a === 127) return { validity: false, reason: "Private / Internal IPv4 address" };
  if (a === 0) return { validity: false, reason: "Private / Internal IPv4 address" };
  if (a === 169 && b === 254) return { validity: false, reason: "Private / Internal IPv4 address" };
  if (a === 192 && b === 168) return { validity: false, reason: "Private / Internal IPv4 address" };
  if (a === 172 && b >= 16 && b <= 31) return { validity: false, reason: "Private / Internal IPv4 address" };

  // Exclude multicast & reserved
  if (a >= 224) return { validity: false, reason: "Multicast / Reserved IPv4 address" };

  return { validity: true };
}
