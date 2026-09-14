import 'package:flutter/material.dart';
import '../core/theme/lumo_theme.dart';

class LoadingState extends StatelessWidget {
  const LoadingState({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 48),
      child: Center(
        child: CircularProgressIndicator(strokeWidth: 2.5, color: LumoColors.turquoise),
      ),
    );
  }
}
