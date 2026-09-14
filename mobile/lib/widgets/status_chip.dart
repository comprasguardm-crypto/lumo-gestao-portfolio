import 'package:flutter/material.dart';
import '../core/theme/lumo_theme.dart';

class StatusChip extends StatelessWidget {
  final String label;
  final Color color;

  const StatusChip({super.key, required this.label, required this.color});

  factory StatusChip.success(String label) => StatusChip(label: label, color: LumoColors.success);
  factory StatusChip.warning(String label) => StatusChip(label: label, color: LumoColors.warning);
  factory StatusChip.danger(String label) => StatusChip(label: label, color: LumoColors.danger);
  factory StatusChip.info(String label) => StatusChip(label: label, color: LumoColors.info);
  factory StatusChip.neutral(String label) => const StatusChip(label: '', color: LumoColors.slate);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
