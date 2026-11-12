import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

export type HostClass = "public" | "private" | "unresolved";

export function isPublicIp(ip: string): boolean {
  if (!ipaddr.isValid(ip)) return false;
  const parsed = ipaddr.parse(ip);
  const address =
    parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress()
      ? parsed.toIPv4Address()
      : parsed;
  return address.range() === "unicast";
}

export type Resolver = (hostname: string) => Promise<string[]>;

const dnsResolver: Resolver = async (hostname) =>
  (await lookup(hostname, { all: true })).map((entry) => entry.address);

/** Un host es público solo si todas sus direcciones lo son. */
export async function classifyHost(
  hostname: string,
  resolve: Resolver = dnsResolver,
): Promise<HostClass> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (ipaddr.isValid(host)) return isPublicIp(host) ? "public" : "private";
  try {
    const addresses = await resolve(host);
    if (addresses.length === 0) return "unresolved";
    return addresses.every(isPublicIp) ? "public" : "private";
  } catch {
    return "unresolved";
  }
}
