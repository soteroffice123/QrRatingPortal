export function generateQrUrl(qrCodeId: number): string {
  // Get the host from window location or use a fallback
  const host = typeof window !== 'undefined' 
    ? window.location.origin
    : (process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
      : 'http://localhost:5000');
  
  return `${host}/rating/${qrCodeId}`;
}
