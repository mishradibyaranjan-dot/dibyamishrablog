import { JSONParser } from '@streamparser/json';

export const FEED_LIMITS = { bytes: 32 * 1024 * 1024, recordBytes: 2 * 1024 * 1024, records: 20000, normalizedBytes: 16 * 1024 * 1024 };

/** Drops emitted raw siblings. Any limit/parse failure aborts the whole snapshot. */
export async function readFeed<T>(response: Response, path: string, normalize: (value: any) => T | null): Promise<T[]> {
  if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
  if (!response.body) throw new Error('Missing feed body');
  const reader = response.body.getReader();
  const parser = new JSONParser({ paths: [path], keepStack: false });
  const output: T[] = [];
  let total = 0, record = 0, count = 0, normalized = 0, ended = false;
  parser.onEnd = () => { ended = true; };
  parser.onValue = ({ value }) => {
    record = 0;
    if (++count > FEED_LIMITS.records) throw new Error('Feed record limit exceeded; closure deferred');
    const item = normalize(value);
    if (item !== null) {
      normalized += new TextEncoder().encode(JSON.stringify(item)).length;
      if (normalized > FEED_LIMITS.normalizedBytes) throw new Error('Feed snapshot limit exceeded; closure deferred');
      output.push(item);
    }
  };
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > FEED_LIMITS.bytes) throw new Error('Feed size limit exceeded; closure deferred');
      for (let offset = 0; offset < chunk.value.length; offset += 4096) {
        const part = chunk.value.subarray(offset, offset + 4096);
        record += part.length;
        if (record > FEED_LIMITS.recordBytes) throw new Error('Feed item limit exceeded; closure deferred');
        parser.write(part);
      }
    }
    if (!ended) parser.end();
    if (!ended) throw new Error('Incomplete feed; closure deferred');
    return output;
  } finally { await reader.cancel().catch(() => {}); }
}