import Airtable from 'airtable';

if (process.env.AIRTABLE_KEY === undefined) {
  throw new Error('Missing environment variable: AIRTABLE_KEY');
}
if (process.env.AIRTABLE_BASE === undefined) {
  throw new Error('Missing environment variable: AIRTABLE_BASE');
}

Airtable.configure({
  apiVersion: '0.1.0',
  apiKey: process.env.AIRTABLE_KEY,
});

export default Airtable.base(process.env.AIRTABLE_BASE);
