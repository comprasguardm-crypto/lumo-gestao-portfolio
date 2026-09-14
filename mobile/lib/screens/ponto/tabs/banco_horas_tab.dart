import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/lumo_theme.dart';
import '../../../models/hour_bank_entry.dart';
import '../../../services/hour_bank_service.dart';
import '../../../widgets/loading_state.dart';
import '../../../widgets/empty_state.dart';

class BancoHorasTab extends StatefulWidget {
  const BancoHorasTab({super.key});

  @override
  State<BancoHorasTab> createState() => _BancoHorasTabState();
}

class _BancoHorasTabState extends State<BancoHorasTab> {
  final _service = HourBankService();
  List<HourBankEntry>? _entries;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await _service.listEntries();
    if (!mounted) return;
    setState(() => _entries = data);
  }

  String _formatDuration(Duration d) {
    final abs = d.abs();
    final hours = abs.inHours;
    final minutes = abs.inMinutes.remainder(60);
    final sign = d.isNegative ? '-' : '+';
    return '$sign${hours}h${minutes.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_entries == null) return const LoadingState();

    final balance = _service.currentBalance;
    final isPositive = !balance.isNegative;

    return RefreshIndicator(
      onRefresh: _load,
      color: LumoColors.turquoise,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: LumoColors.ink,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                const Text('Saldo do banco de horas', style: TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 6),
                Text(
                  _formatDuration(balance),
                  style: TextStyle(
                    color: isPositive ? LumoColors.turquoise : LumoColors.warning,
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          if (_entries!.isEmpty)
            const EmptyState(icon: Icons.timer_outlined, title: 'Nenhum lançamento', description: 'Seu histórico de banco de horas aparecerá aqui.')
          else
            ..._entries!.map(
              (entry) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: LumoColors.border),
                ),
                child: Row(
                  children: [
                    Icon(
                      entry.isCredit ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                      color: entry.isCredit ? LumoColors.success : LumoColors.warning,
                      size: 18,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(entry.description, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: LumoColors.ink)),
                          Text(DateFormat("d 'de' MMM", 'pt_BR').format(entry.date), style: const TextStyle(fontSize: 11, color: LumoColors.slate)),
                        ],
                      ),
                    ),
                    Text(
                      _formatDuration(entry.amount),
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: entry.isCredit ? LumoColors.success : LumoColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
