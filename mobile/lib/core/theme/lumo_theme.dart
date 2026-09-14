import 'package:flutter/material.dart';

/// Lumo Design System
///
/// Toda cor de marca do app deve vir daqui.
/// Evite usar códigos hexadecimais diretamente nas telas.
class LumoColors {
  static const inkDeep = Color(0xFF031F1A);
  static const ink = Color(0xFF062B24);
  static const inkSoft = Color(0xFF0B3A31);

  static const turquoise = Color(0xFF20E3A2);
  static const mint = Color(0xFF6EF2C2);
  static const lime = Color(0xFF8BFF6A);

  static const frost = Color(0xFFF4FBF8);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSoft = Color(0xFFEAF7F2);
  static const border = Color(0xFFD9E8E2);

  static const textPrimary = ink;
  static const slate = Color(0xFF61736D);

  static const success = Color(0xFF16A36A);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFDC3C4D);
  static const info = Color(0xFF0EA5A8);

  // Mantido para compatibilidade com telas que já usam LumoColors.ai.
  static const ai = Color(0xFF18C7A3);
}

class LumoTheme {
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: LumoColors.turquoise,
      brightness: Brightness.light,
      primary: LumoColors.ink,
      secondary: LumoColors.turquoise,
      surface: LumoColors.surface,
      error: LumoColors.danger,
    );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: LumoColors.frost,
      fontFamily: 'Inter',
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: LumoColors.frost,
        foregroundColor: LumoColors.ink,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: LumoColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: LumoColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: LumoColors.surface,
        labelStyle: const TextStyle(color: LumoColors.slate),
        floatingLabelStyle: const TextStyle(color: LumoColors.ink),
        prefixIconColor: LumoColors.slate,
        suffixIconColor: LumoColors.slate,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: LumoColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: LumoColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: LumoColors.turquoise, width: 1.6),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: LumoColors.ink,
          foregroundColor: Colors.white,
          disabledBackgroundColor: LumoColors.inkSoft.withValues(alpha: 0.45),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: LumoColors.ink,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: LumoColors.ink,
          side: const BorderSide(color: LumoColors.border),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: LumoColors.surfaceSoft,
        selectedColor: LumoColors.turquoise.withValues(alpha: 0.18),
        side: const BorderSide(color: LumoColors.border),
        labelStyle: const TextStyle(color: LumoColors.ink),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: LumoColors.surface,
        selectedItemColor: LumoColors.turquoise,
        unselectedItemColor: LumoColors.slate,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: const DividerThemeData(
        color: LumoColors.border,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: LumoColors.ink,
        contentTextStyle: const TextStyle(color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: LumoColors.turquoise,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: LumoColors.turquoise,
        foregroundColor: LumoColors.ink,
      ),
    );
  }
}