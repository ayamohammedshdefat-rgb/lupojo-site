/** Read-only check that production credentials work (prints counts only, never secrets). */
async function main() {
  const { adminDb, PROJECT_ID } = await import('../src/server/firebase-admin');
  const db = adminDb();
  const [sections, items] = await Promise.all([db.collection('sections').get(), db.collection('items').get()]);
  console.log(`project=${PROJECT_ID} sections=${sections.size} items=${items.size}`);
}
main().then(() => process.exit(0), (e: unknown) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
