import ShopScreen from "./(tabs)/index";

/**
 * Root index.
 *
 * Re-exports the ShopScreen from the (tabs) group. This provides a
 * concrete physical file at the root path "/" for production builds,
 * fulfilling the expectations of "router.replace('/')" and standard
 * app launches without the ambiguity of nested group redirects.
 */
export default ShopScreen;
