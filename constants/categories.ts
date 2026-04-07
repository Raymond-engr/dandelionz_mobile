/**
 * Local category image assets — mirrors the web app's /public folder fallbacks.
 * Images must exist at: assets/images/categories/category-{name}.png
 *
 * Priority: local image first (always available offline), then API image as fallback.
 * This matches the web app's CategorySlider behaviour (hardcoded → API → nothing).
 */

const CATEGORY_IMAGE_MAP: Record<string, any> = {
  electronics: require("@/assets/images/categories/category-electronics.png"),
  fashion: require("@/assets/images/categories/category-fashion.png"),
  home_appliances: require("@/assets/images/categories/category-home_appliances.png"),
  beauty: require("@/assets/images/categories/category-beauty.png"),
  sports: require("@/assets/images/categories/category-sports.png"),
  automotive: require("@/assets/images/categories/category-automotive.png"),
  books: require("@/assets/images/categories/category-books.png"),
  toys: require("@/assets/images/categories/category-toys.png"),
  groceries: require("@/assets/images/categories/category-groceries.png"),
  computers: require("@/assets/images/categories/category-computers.png"),
  phones: require("@/assets/images/categories/category-phones.png"),
  jewelry: require("@/assets/images/categories/category-jewelry.png"),
  baby: require("@/assets/images/categories/category-baby.png"),
  pets: require("@/assets/images/categories/category-pets.png"),
  office: require("@/assets/images/categories/category-office.png"),
  gaming: require("@/assets/images/categories/category-gaming.png"),
};

/**
 * Returns the local require'd image for a category name, or null if not found.
 * Tries multiple normalisation strategies to match API category names to local keys.
 *
 * Examples:
 *   "Electronics"           → electronics
 *   "Home Appliances"       → home_appliances
 *   "Beauty & Personal Care"→ beauty
 *   "Phones & Tablets"      → phones
 *   "Video Games & Consoles"→ gaming
 */
export function getCategoryImage(name: string): any | null {
  if (!name) return null;

  const lower = name.toLowerCase().trim();

  // 1. snake_case: "Home Appliances" → "home_appliances"
  const snakeCase = lower
    .replace(/\s*&\s*/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  if (CATEGORY_IMAGE_MAP[snakeCase]) return CATEGORY_IMAGE_MAP[snakeCase];

  // 2. Drop everything after first connector word/symbol
  //    "beauty_personal_care" → "beauty"
  const firstSegment = snakeCase.split("_")[0];
  if (CATEGORY_IMAGE_MAP[firstSegment]) return CATEGORY_IMAGE_MAP[firstSegment];

  // 3. First whitespace-delimited word of the original name
  const firstWord = lower.split(/[\s&_,]/)[0].replace(/[^a-z0-9]/g, "");
  if (CATEGORY_IMAGE_MAP[firstWord]) return CATEGORY_IMAGE_MAP[firstWord];

  // 4. Substring match against known keys (handles "phones_tablets" → "phones")
  for (const key of Object.keys(CATEGORY_IMAGE_MAP)) {
    if (snakeCase.startsWith(key) || snakeCase.includes(key)) {
      return CATEGORY_IMAGE_MAP[key];
    }
  }

  return null;
}
