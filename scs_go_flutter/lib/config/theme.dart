import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// SCS GO Design System - Premium EV-tech SaaS
// Colors extracted from web CSS index.css

class AppColors {
  // Primary - Cyan/Teal (hsl 187 94% 50% for dark, 43% for light)
  static const primary = Color(0xFF06B6D4); // hsl(187, 94%, 43%) - cyan-500
  static const primaryLight = Color(0xFF22D3EE); // cyan-400
  static const primaryDark = Color(0xFF0891B2); // cyan-600

  // Secondary - for gradients
  static const cyan = Color(0xFF06B6D4); // cyan-500
  static const cyanLight = Color(0xFF22D3EE); // cyan-400

  // Status colors (from web CSS)
  static const success = Color(0xFF16A34A); // hsl(142, 76%, 36%)
  static const successDark = Color(0xFF22C55E); // hsl(142, 76%, 45%)
  static const warning = Color(0xFFF59E0B); // hsl(38, 92%, 50%)
  static const error = Color(0xFFDC2626); // hsl(0, 84%, 60%) - destructive

  // Light theme colors (from :root in CSS)
  static const lightBackground = Color(0xFFFFFFFF); // hsl(0, 0%, 100%)
  static const lightForeground = Color(0xFF1E293B); // hsl(222, 47%, 11%)
  static const lightCard = Color(0xFFFFFFFF); // hsl(0, 0%, 100%)
  static const lightSecondary = Color(0xFFF1F5F9); // hsl(220, 14%, 96%)
  static const lightMuted = Color(0xFFF1F5F9); // hsl(220, 14%, 96%)
  static const lightMutedForeground = Color(0xFF64748B); // hsl(220, 9%, 46%)
  static const lightBorder = Color(0xFFE2E8F0); // hsl(220, 13%, 91%)

  // Dark theme colors (from .dark in CSS)
  static const darkBackground = Color(0xFF0F172A); // hsl(222, 47%, 6%) - approx
  static const darkForeground = Color(0xFFF8FAFC); // hsl(210, 40%, 98%)
  static const darkCard = Color(0xFF1E293B); // hsl(222, 47%, 9%) - approx
  static const darkSecondary = Color(0xFF334155); // hsl(222, 47%, 14%) - approx
  static const darkMuted = Color(0xFF334155); // hsl(222, 47%, 14%)
  static const darkMutedForeground = Color(0xFF94A3B8); // hsl(215, 20%, 68%)
  static const darkBorder = Color(0xFF475569); // hsl(222, 47%, 16%) - approx
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        primaryContainer: AppColors.primaryLight,
        secondary: AppColors.cyan,
        secondaryContainer: AppColors.cyanLight,
        surface: AppColors.lightCard,
        error: AppColors.error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.lightForeground,
        outline: AppColors.lightBorder,
      ),
      scaffoldBackgroundColor: AppColors.lightBackground,
      cardColor: AppColors.lightCard,
      dividerColor: AppColors.lightBorder,
      textTheme: _buildTextTheme(
          AppColors.lightForeground, AppColors.lightMutedForeground),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.lightBackground,
        foregroundColor: AppColors.lightForeground,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.lightForeground,
          letterSpacing: -0.02,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.lightCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16), // --radius: 0.75rem
          side: BorderSide(color: AppColors.lightBorder.withOpacity(0.6)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.01,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          side: const BorderSide(color: AppColors.lightBorder),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            letterSpacing: -0.01,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSecondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.inter(
          color: AppColors.lightMutedForeground,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.lightCard,
        indicatorColor: AppColors.primary.withOpacity(0.1),
        labelTextStyle: WidgetStateProperty.all(
          GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.lightSecondary,
        selectedColor: AppColors.primary,
        labelStyle: GoogleFonts.inter(fontSize: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        primaryContainer: AppColors.primaryDark,
        secondary: AppColors.cyan,
        secondaryContainer: AppColors.cyanLight,
        surface: AppColors.darkCard,
        error: AppColors.error,
        onPrimary: AppColors.darkBackground,
        onSecondary: AppColors.darkBackground,
        onSurface: AppColors.darkForeground,
        outline: AppColors.darkBorder,
      ),
      scaffoldBackgroundColor: AppColors.darkBackground,
      cardColor: AppColors.darkCard,
      dividerColor: AppColors.darkBorder,
      textTheme: _buildTextTheme(
          AppColors.darkForeground, AppColors.darkMutedForeground),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        foregroundColor: AppColors.darkForeground,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.darkForeground,
          letterSpacing: -0.02,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.darkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.darkBorder.withOpacity(0.6)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.darkBackground,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.01,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          side: const BorderSide(color: AppColors.darkBorder),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            letterSpacing: -0.01,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSecondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.inter(
          color: AppColors.darkMutedForeground,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.darkCard,
        indicatorColor: AppColors.primary.withOpacity(0.1),
        labelTextStyle: WidgetStateProperty.all(
          GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.darkSecondary,
        selectedColor: AppColors.primary,
        labelStyle:
            GoogleFonts.inter(fontSize: 12, color: AppColors.darkForeground),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  static TextTheme _buildTextTheme(Color foreground, Color muted) {
    return TextTheme(
      displayLarge: GoogleFonts.inter(
        fontSize: 48,
        fontWeight: FontWeight.w800,
        color: foreground,
        letterSpacing: -0.03,
        height: 1.1,
      ),
      displayMedium: GoogleFonts.inter(
        fontSize: 36,
        fontWeight: FontWeight.bold,
        color: foreground,
        letterSpacing: -0.025,
      ),
      displaySmall: GoogleFonts.inter(
        fontSize: 30,
        fontWeight: FontWeight.bold,
        color: foreground,
        letterSpacing: -0.02,
      ),
      headlineLarge: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: foreground,
        letterSpacing: -0.015,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: foreground,
        letterSpacing: -0.01,
      ),
      headlineSmall: GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: foreground,
      ),
      titleLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: foreground,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: foreground,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        color: foreground,
        height: 1.6,
        letterSpacing: -0.01,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: foreground,
        height: 1.5,
        letterSpacing: -0.01,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        color: muted,
        letterSpacing: -0.01,
      ),
      labelLarge: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: foreground,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: foreground,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: muted,
      ),
    );
  }
}
