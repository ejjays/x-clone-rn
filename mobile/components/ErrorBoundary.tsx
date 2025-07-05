import React from "react";
import { View, Text, StyleSheet } from "react-native";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>App Has Crashed</Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1c1c1e",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff3b30",
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: "#f2f2f7",
    textAlign: "center",
  },
});