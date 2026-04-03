export const CATEGORY_IMAGES: Record<string, any> = {
  electronics: require("@/assets/images/categories/category-electronics.png"),
  fashion: require("@/assets/images/categories/category-fashion.png"),
  "home-appliances": require("@/assets/images/categories/category-home_appliances.png"),
  "home_appliances": require("@/assets/images/categories/category-home_appliances.png"),
  "home appliances": require("@/assets/images/categories/category-home_appliances.png"),
  beauty: require("@/assets/images/categories/category-beauty.png"),
  "beauty & personal care": require("@/assets/images/categories/category-beauty.png"),
  sports: require("@/assets/images/categories/category-sports.png"),
  "sports & outdoors": require("@/assets/images/categories/category-sports.png"),
  automotive: require("@/assets/images/categories/category-automotive.png"),
  books: require("@/assets/images/categories/category-books.png"),
  toys: require("@/assets/images/categories/category-toys.png"),
  "toys & games": require("@/assets/images/categories/category-toys.png"),
  groceries: require("@/assets/images/categories/category-groceries.png"),
  computers: require("@/assets/images/categories/category-computers.png"),
  "computers & accessories": require("@/assets/images/categories/category-computers.png"),
  phones: require("@/assets/images/categories/category-phones.png"),
  "phones & tablets": require("@/assets/images/categories/category-phones.png"),
  jewelry: require("@/assets/images/categories/category-jewelry.png"),
  "jewelry & watches": require("@/assets/images/categories/category-jewelry.png"),
  baby: require("@/assets/images/categories/category-baby.png"),
  "baby products": require("@/assets/images/categories/category-baby.png"),
  pets: require("@/assets/images/categories/category-pets.png"),
  "pet supplies": require("@/assets/images/categories/category-pets.png"),
  office: require("@/assets/images/categories/category-office.png"),
  "office products": require("@/assets/images/categories/category-office.png"),
  gaming: require("@/assets/images/categories/category-gaming.png"),
  "video games & consoles": require("@/assets/images/categories/category-gaming.png"),
  apparel: require("@/assets/images/categories/category-apparel.png"),
  furniture: require("@/assets/images/categories/category-furniture.png"),
};

export const PLACEHOLDER_CATEGORY_IMAGE = require("@/assets/images/categories/placeholder-category.png");

export const getCategoryImage = (categoryName: string) => {
  const normalized = categoryName.toLowerCase().trim();
  return CATEGORY_IMAGES[normalized] || PLACEHOLDER_CATEGORY_IMAGE;
};
