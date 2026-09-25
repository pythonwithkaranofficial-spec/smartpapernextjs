import 'package:flutter/material.dart';

/// Pure Black & White design tokens for a sleek, high-contrast, modern aesthetic
class AppColors {
  // Dark Theme Tokens (Deep Black & Pure White)
  static const Color background = Color(0xFF0A0A0A);
  static const Color surface = Color(0xFF141414);
  static const Color surfaceElevated = Color(0xFF1F1F1F);
  static const Color primary = Colors.white;
  static const Color secondary = Color(0xFFE5E5E5);
  static const Color accent = Colors.white;
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFFA3A3A3);
  static const Color border = Color(0xFF262626);
  static const Color borderSubtle = Color(0xFF333333);

  // Light Theme Tokens (Crisp Paper White & Deep Black)
  static const Color lightBackground = Colors.white;
  static const Color lightSurface = Color(0xFFFAFAFA);
  static const Color lightSurfaceElevated = Color(0xFFF5F5F5);
  static const Color lightPrimary = Colors.black;
  static const Color lightTextPrimary = Colors.black;
  static const Color lightTextSecondary = Color(0xFF737373);
  static const Color lightBorder = Color(0xFFE5E5E5);

  // Dynamic Theme Resolvers
  static Color getBackground(bool isDark) => isDark ? background : lightBackground;
  static Color getSurface(bool isDark) => isDark ? surface : lightSurface;
  static Color getSurfaceElevated(bool isDark) => isDark ? surfaceElevated : lightSurfaceElevated;
  static Color getPrimary(bool isDark) => isDark ? primary : lightPrimary;
  static Color getTextPrimary(bool isDark) => isDark ? textPrimary : lightTextPrimary;
  static Color getTextSecondary(bool isDark) => isDark ? textSecondary : lightTextSecondary;
  static Color getBorder(bool isDark) => isDark ? border : lightBorder;
}

