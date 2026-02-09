import { NextRequest } from 'next/server';

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 */
function isValidIp(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified - covers most common formats)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  if (ipv4Regex.test(ip)) {
    // Validate IPv4 octets are in valid range
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip);
}

/**
 * Checks if an IP address is a private/internal IP
 */
function isPrivateIp(ip: string): boolean {
  // Private IPv4 ranges
  if (ip.startsWith('10.') ||
      ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') || ip.startsWith('172.19.') ||
      ip.startsWith('172.20.') || ip.startsWith('172.21.') || ip.startsWith('172.22.') || ip.startsWith('172.23.') ||
      ip.startsWith('172.24.') || ip.startsWith('172.25.') || ip.startsWith('172.26.') || ip.startsWith('172.27.') ||
      ip.startsWith('172.28.') || ip.startsWith('172.29.') || ip.startsWith('172.30.') || ip.startsWith('172.31.') ||
      ip.startsWith('192.168.')) {
    return true;
  }
  
  // Loopback
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.')) {
    return true;
  }
  
  return false;
}

/**
 * Extracts the client IP address from request headers.
 * Checks multiple headers in priority order to reliably get the real client IP
 * (not the partner's server IP).
 * 
 * Priority order:
 * 1. cf-connecting-ip (Cloudflare)
 * 2. x-forwarded-for (first IP in comma-separated list, most common)
 * 3. x-real-ip (nginx)
 * 4. true-client-ip (some proxies/CDNs)
 * 5. x-client-ip (some proxies)
 * 
 * @param request - Next.js request object
 * @returns Client IP address string or null if not found
 */
export function getClientIp(request: NextRequest): string | null {
  // Check headers in priority order
  const headersToCheck = [
    'cf-connecting-ip',      // Cloudflare
    'x-forwarded-for',        // Standard proxy header (most common)
    'x-real-ip',              // nginx
    'true-client-ip',         // Some proxies/CDNs
    'x-client-ip',            // Some proxies
  ];

  for (const headerName of headersToCheck) {
    const headerValue = request.headers.get(headerName);
    if (!headerValue) continue;

    // Handle comma-separated IPs (x-forwarded-for can contain multiple IPs)
    // Take the first one, which is typically the original client IP
    const ips = headerValue.split(',').map(ip => ip.trim());
    
    for (const ip of ips) {
      // Skip empty strings
      if (!ip) continue;
      
      // Validate IP format
      if (!isValidIp(ip)) continue;
      
      // Skip private/internal IPs (these are likely from the partner's internal network)
      // We want the actual end-user's public IP
      if (isPrivateIp(ip)) continue;
      
      return ip;
    }
  }

  // If we only found private IPs, return the first valid one as fallback
  // (better than nothing, though it may be the partner's server IP)
  for (const headerName of headersToCheck) {
    const headerValue = request.headers.get(headerName);
    if (!headerValue) continue;

    const ips = headerValue.split(',').map(ip => ip.trim());
    
    for (const ip of ips) {
      if (!ip) continue;
      if (!isValidIp(ip)) continue;
      return ip; // Return even if private (fallback)
    }
  }

  return null;
}
