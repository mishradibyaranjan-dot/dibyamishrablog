import { describe, expect, it } from 'vitest';
import { consumeResumeAnalysis } from './stream';
const stream = (...chunks: string[]) => new ReadableStream<Uint8Array>({ start(controller) { chunks.forEach(chunk => controller.enqueue(new TextEncoder().encode(chunk))); controller.close(); } });
describe('resume analysis completion', () => {
  it('requires explicit committed completion', async () => {
    await expect(consumeResumeAnalysis(stream('{"status":"Checking"}\n'), () => {})).rejects.toThrow('interrupted');
  });
  it('handles a final error without newline', async () => {
    await expect(consumeResumeAnalysis(stream('{"error":"Evidence could not be verified"}'), () => {})).rejects.toThrow('Evidence could not be verified');
  });
  it('reads split completion and reports progress', async () => {
    const statuses: string[] = [];
    await consumeResumeAnalysis(stream('{"status":"Checking"}\n{"com', 'pleted":true}'), status => statuses.push(status));
    expect(statuses).toEqual(['Checking']);
  });
});