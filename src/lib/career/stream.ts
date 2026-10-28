/** A successful review requires the server's committed completion event, not merely EOF. */
export async function consumeResumeAnalysis(body: ReadableStream<Uint8Array>, onStatus: (status: string) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = false;
  const consume = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.error) throw new Error(String(event.error));
    if (event.status) onStatus(String(event.status));
    if (event.completed === true) completed = true;
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      lines.forEach(consume);
    }
    consume(buffer + decoder.decode());
    if (!completed) throw new Error('Analysis was interrupted before the review was saved. Open this review to check its status.');
  } finally {
    reader.releaseLock();
  }
}