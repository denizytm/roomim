import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { colors, radius } from "@/lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Dolgulu input — odaklanınca turuncu çerçeve. Opsiyonel etiket, sol ikon ve sağ öğe.
export function Field({
  label,
  icon,
  right,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: { label?: string; icon?: IconName; right?: ReactNode; error?: string } & TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: "600", color: error ? colors.danger : colors.text }}>{label}</Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: props.multiline ? "flex-start" : "center",
          gap: 12,
          minHeight: 54,
          paddingHorizontal: 16,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : focused ? colors.primary : "transparent",
          backgroundColor: focused ? "#fff" : colors.field,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.muted}
            style={props.multiline ? { marginTop: 15 } : undefined}
          />
        )}
        <TextInput
          placeholderTextColor={colors.placeholder}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 15 },
            props.multiline && { textAlignVertical: "top" },
            style,
          ]}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}

export function Btn({
  title,
  onPress,
  loading,
  disabled,
  icon,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  variant?: "primary" | "outline" | "danger";
}) {
  const isPrimary = variant === "primary";
  const fg = isPrimary ? "#fff" : variant === "danger" ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: 8,
        minHeight: 54,
        borderRadius: radius.md,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1,
        backgroundColor: isPrimary ? colors.primary : variant === "danger" ? "#FEF2F2" : colors.field,
        ...(isPrimary && {
          shadowColor: colors.primary,
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }),
      })}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={{ color: fg, fontWeight: "700", fontSize: 16 }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
