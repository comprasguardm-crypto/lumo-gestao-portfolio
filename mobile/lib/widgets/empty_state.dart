import 'package:flutter/material.dart';
import '../core/theme/lumo_theme.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? description;

  const EmptyState({super.key, required this.icon, required this.title, this.description});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(999)),
            child: Icon(icon, color: LumoColors.slate, size: 20),
          ),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: LumoColors.ink)),
          if (description != null) ...[
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                description!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12.5, color: LumoColors.slate),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
