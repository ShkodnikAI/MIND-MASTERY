import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '@/ui/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.message}>{this.state.error?.message ?? 'Неизвестная ошибка'}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background.primary },
  title: { fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.xl, color: colors.text.primary, marginBottom: spacing.md },
  message: { fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.md, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },
  button: { backgroundColor: colors.accent.primary, borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  buttonText: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.md, color: colors.text.primary },
});
