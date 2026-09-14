import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/lumo_theme.dart';
import '../../../models/attendance_record.dart';
import '../../../services/attendance_service.dart';
import '../../../widgets/loading_state.dart';
import '../../../widgets/status_chip.dart';

class MeuPontoTab extends StatefulWidget {
  const MeuPontoTab({super.key});

  @override
  State<MeuPontoTab> createState() => _MeuPontoTabState();
}

class _MeuPontoTabState extends State<MeuPontoTab> {
  final _service = AttendanceService();

  List<DailyAttendanceSummary>? _summaries;
  Timer? _refreshTimer;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();

    _load();

    _refreshTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _load(silent: true),
    );
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    if (_loading) return;

    _loading = true;

    try {
      final data = await _service.listRecentSummaries();

      if (!mounted) return;

      setState(() {
        _summaries = data;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;

      if (!silent || _summaries == null) {
        setState(() {
          _error = e
              .toString()
              .replaceFirst('SupabaseApiException: ', '')
              .replaceFirst('Exception: ', '');
        });
      }
    } finally {
      _loading = false;
    }
  }

  StatusChip _chipFor(String status) {
    switch (status) {
      case 'completo':
        return StatusChip.success('Completo');
      case 'incompleto':
        return StatusChip.warning('Incompleto');
      case 'ajustado':
        return StatusChip.info('Ajustado');
      case 'ferias':
        return StatusChip.info('Férias');
      case 'falta':
        return StatusChip.danger('Falta');
      default:
        return const StatusChip(
          label: 'Folga',
          color: LumoColors.slate,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_summaries == null && _error == null) {
      return const LoadingState();
    }

    if (_summaries == null && _error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                color: LumoColors.danger,
                size: 42,
              ),
              const SizedBox(height: 12),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: LumoColors.ink),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _load,
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      color: LumoColors.turquoise,
      child: _summaries!.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(24),
              children: const [
                SizedBox(height: 120),
                Icon(
                  Icons.schedule_rounded,
                  size: 48,
                  color: LumoColors.slate,
                ),
                SizedBox(height: 12),
                Text(
                  'Nenhuma marcação encontrada.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: LumoColors.slate),
                ),
              ],
            )
          : ListView.separated(
              padding: const EdgeInsets.all(20),
              itemCount: _summaries!.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final day = _summaries![index];

                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: LumoColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            DateFormat(
                              "EEEE, d MMM",
                              'pt_BR',
                            ).format(day.date),
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: LumoColors.ink,
                              fontSize: 13,
                            ),
                          ),
                          _chipFor(day.status),
                        ],
                      ),

                      if (day.checkIn != null) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            _timeBlock('Entrada', day.checkIn),
                            _timeBlock('Saída almoço', day.lunchOut),
                            _timeBlock('Retorno', day.lunchIn),
                            _timeBlock('Saída', day.checkOut),
                          ],
                        ),

                        if (day.workedHours != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            'Total: ${day.workedHours}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: LumoColors.slate,
                            ),
                          ),
                        ],
                      ],
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _timeBlock(String label, String? value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: LumoColors.slate,
            ),
          ),
          Text(
            value ?? '—',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: LumoColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}
