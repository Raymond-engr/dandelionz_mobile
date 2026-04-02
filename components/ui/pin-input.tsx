import React, { useRef } from "react";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface PinInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
}

export function PinInput({ value, onChange, error }: PinInputProps) {
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newVal = [...value];
    // Take only the last character if multiple are entered (e.g. from clipboard or suggestion)
    const char = text.slice(-1);
    
    if (/^\d?$/.test(char)) {
      newVal[index] = char;
      onChange(newVal);
      
      // Move to next field if we entered a character
      if (char && index < 3) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputs.current[index] = ref;
          }}
          style={[
            styles.input,
            digit ? styles.inputActive : null,
            error ? styles.inputError : null,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          secureTextEntry
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "flex-start",
  },
  input: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    color: "#030482",
    backgroundColor: "#FFFFFF",
  },
  inputActive: {
    borderColor: "#030482",
  },
  inputError: {
    borderColor: "#EF4444",
  },
});
