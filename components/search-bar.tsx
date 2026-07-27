import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
  autoFocus?: boolean;
  /** Fired when the user hits the keyboard's search key. */
  onSubmit?: () => void;
  /**
   * Turns the bar into a button instead of an input. Used on the shop tab,
   * where tapping should open the dedicated search screen rather than filter
   * in place.
   */
  onPress?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search Products",
  onFilterPress,
  showFilter,
  autoFocus,
  onSubmit,
  onPress,
}: Props) {
  const input = (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      style={styles.input}
      autoFocus={autoFocus}
      editable={!onPress}
      returnKeyType="search"
      onSubmitEditing={onSubmit}
      // Search terms are not prose; the usual keyboard assists get in the way.
      autoCorrect={false}
      autoCapitalize="none"
    />
  );

  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <Svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          style={styles.searchIcon}
        >
          <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            stroke="#9CA3AF"
            fill="none"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </Svg>
        {onPress ? (
          // pointerEvents="none" lets taps fall through the disabled input to
          // the Pressable, so the whole bar behaves as one button.
          <Pressable style={styles.pressableInput} onPress={onPress}>
            <View pointerEvents="none" style={styles.pressableInput}>
              {input}
            </View>
          </Pressable>
        ) : (
          input
        )}
      </View>
      {showFilter && (
        <Pressable onPress={onFilterPress} style={styles.filterBtn}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              stroke="#111827"
              d="M3 6h18M7 12h10M10 18h4"
            />
          </Svg>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#111827" },
  pressableInput: { flex: 1, justifyContent: "center" },
  filterBtn: { padding: 8 },
});
