/**
 * id of the heading that names the item dialog (aria-labelledby). Per slug, because React Activity
 * can keep a previously viewed item's (hidden) detail mounted next to the visible one.
 */
export const modalTitleId = (slug: string) => `item-modal-title-${slug}`;
