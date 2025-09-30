export function calculateProcessedPercentage(
  preferredLineId: string | null,
  responses: Array<{ requestedLineId: string | null; createdAt: Date }>
): number {
  if (preferredLineId) {
    // If specific line preferred, check if that line has responded
    const hasResponse = responses.some(
      response => response.requestedLineId === preferredLineId
    );
    return hasResponse ? 100 : 0;
  } else {
    // If "Any" line, calculate based on total responses
    return responses.length > 0 ? 100 : 0;
  }
}
