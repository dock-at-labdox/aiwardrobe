import { readFile } from 'node:fs/promises';
for (const file of ['../schemas/events/job-request.schema.json'])
  JSON.parse(await readFile(new URL(file, import.meta.url)));
console.log('Contract JSON schemas parse successfully.');
