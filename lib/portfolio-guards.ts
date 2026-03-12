/**
 * Determines whether a destructive delete is allowed for a portfolio.
 * Only server-confirmed terminal failure permits deletion —
 * transient stream/transport errors must NOT trigger it.
 */
export function canDeletePortfolio(
  serverStatus: string | undefined,
): boolean {
  return serverStatus === "FAILED";
}
