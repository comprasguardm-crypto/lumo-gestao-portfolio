import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/lumo_theme.dart';
import '../../../models/attendance_record.dart';
import '../../../services/attendance_service.dart';
import 'clock_in_flow_screen.dart';

class BaterPontoTab extends StatefulWidget {
  final bool autoOpen;

  const BaterPontoTab({super.key, this.autoOpen = false});

  @override
  State<BaterPontoTab> createState() => _BaterPontoTabState();
}

class _BaterPontoTabState extends State<BaterPontoTab> {
  final _attendanceService = AttendanceService();

  late Timer _clockTimer;
  Timer? _statusTimer;

  DateTime _now = DateTime.now();

  final List<AttendanceMarkType> _todayMarks = [];
  final List<AttendanceRecord> _todayRecords = [];

  AttendanceRecord? _lastRecord;

  bool _loadingStatus = true;
  bool _refreshing = false;
  String? _loadError;

  @override
  void initState() {
    super.initState();

    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });

    _loadTodayMarks().then((_) {
      if (!mounted) return;

      _statusTimer = Timer.periodic(
        const Duration(seconds: 5),
        (_) => _loadTodayMarks(silent: true),
      );

      if (widget.autoOpen && _loadError == null && _todayMarks.length < 4) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _openClockInFlow());
      }
    });
  }

  Future<void> _loadTodayMarks({bool silent = false}) async {
    if (_refreshing) return;

    _refreshing = true;

    if (!silent && mounted) {
      setState(() {
        _loadingStatus = true;
        _loadError = null;
      });
    }

    try {
      final records = await _attendanceService.listTodayRecords();

      if (!mounted) return;

      setState(() {
        _todayRecords
          ..clear()
          ..addAll(records);

        _todayMarks
          ..clear()
          ..addAll(records.map((record) => record.type));

        _lastRecord = records.isEmpty ? null : records.last;
        _loadingStatus = false;
        _loadError = null;
      });
    } catch (e) {
      if (!mounted) return;

      if (!silent || _todayRecords.isEmpty) {
        setState(() {
          _loadingStatus = false;
          _loadError = e
              .toString()
              .replaceFirst('SupabaseApiException: ', '')
              .replaceFirst('Exception: ', '');
        });
      }
    } finally {
      _refreshing = false;
    }
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    _statusTimer?.cancel();
    super.dispose();
  }

  AttendanceMarkType get _nextMarkType {
    const sequence = [
      AttendanceMarkType.entrada,
      AttendanceMarkType.saidaIntervalo,
      AttendanceMarkType.retornoIntervalo,
      AttendanceMarkType.saida,
    ];

    if (_todayMarks.length >= sequence.length) return sequence.last;
    return sequence[_todayMarks.length];
  }

  bool get _nextNeedsFace {
    return _nextMarkType == AttendanceMarkType.entrada ||
        _nextMarkType == AttendanceMarkType.saida;
  }

  String _labelFor(AttendanceMarkType type) {
    switch (type) {
      case AttendanceMarkType.entrada:
        return 'Registrar entrada';
      case AttendanceMarkType.saidaIntervalo:
        return 'Registrar saída para intervalo';
      case AttendanceMarkType.retornoIntervalo:
        return 'Registrar retorno do intervalo';
      case AttendanceMarkType.saida:
        return 'Registrar saída';
    }
  }

  String _shortLabel(AttendanceMarkType type) {
    switch (type) {
      case AttendanceMarkType.entrada:
        return 'Entrada';
      case AttendanceMarkType.saidaIntervalo:
        return 'Saída para intervalo';
      case AttendanceMarkType.retornoIntervalo:
        return 'Retorno do intervalo';
      case AttendanceMarkType.saida:
        return 'Saída';
    }
  }

  Future<void> _openClockInFlow() async {
    if (!_nextNeedsFace) {
      await _registerGpsOnly();
      return;
    }

    final result = await Navigator.of(context).push<AttendanceRecord>(
      MaterialPageRoute(
        builder: (_) => ClockInFlowScreen(markType: _nextMarkType),
        fullscreenDialog: true,
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _todayRecords.add(result);
        _todayMarks.add(result.type);
        _lastRecord = result;
      });

      await _loadTodayMarks(silent: true);
    }
  }

  Future<void> _registerGpsOnly() async {
    if (!mounted) return;

    final markType = _nextMarkType;

    setState(() {
      _loadingStatus = true;
      _loadError = null;
    });

    try {
      final enabled = await Geolocator.isLocationServiceEnabled();

      if (!enabled) {
        throw Exception(
          'O GPS está desativado. Ative a localização e tente novamente.',
        );
      }

      var permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception(
          'A permissão de localização foi bloqueada nas configurações do aparelho.',
        );
      }

      if (permission == LocationPermission.denied) {
        throw Exception(
          'Precisamos da sua localização para validar o ponto.',
        );
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 20),
      );

      final result = await _attendanceService.registerMark(
        type: markType,
        photoPath: null,
        latitude: position.latitude,
        longitude: position.longitude,
        gpsAccuracyMeters: position.accuracy,
        isMocked: position.isMocked,
        positionTimestamp: position.timestamp,
      );

      if (!mounted) return;

      setState(() {
        _todayRecords.add(result);
        _todayMarks.add(result.type);
        _lastRecord = result;
        _loadingStatus = false;
      });

      await _loadTodayMarks(silent: true);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _loadingStatus = false;
        _loadError = e
            .toString()
            .replaceFirst('SupabaseApiException: ', '')
            .replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final timeLabel = DateFormat('HH:mm:ss').format(_now);
    final dateLabel = DateFormat("EEEE, d 'de' MMMM", 'pt_BR').format(_now);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
        children: [
          Center(
            child: Column(
              children: [
                Text(
                  timeLabel,
                  style: const TextStyle(
                    fontSize: 44,
                    fontWeight: FontWeight.w800,
                    color: LumoColors.ink,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  dateLabel,
                  style: const TextStyle(
                    fontSize: 13,
                    color: LumoColors.slate,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          if (_loadError != null) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _loadError!,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Color(0xFFBE123C),
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton(
                    onPressed: _loadTodayMarks,
                    child: const Text('Tentar novamente'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          if (_lastRecord != null) _buildLastRecordCard(),
          if (_lastRecord != null) const SizedBox(height: 20),

          SizedBox(
            height: 56,
            child: ElevatedButton.icon(
              onPressed:
                  _loadingStatus ||
                      _loadError != null ||
                      _todayMarks.length >= 4
                  ? null
                  : _openClockInFlow,
              icon: const Icon(Icons.fingerprint_rounded),
              label: Text(
                _loadingStatus
                    ? 'Validando...'
                    : (_todayMarks.length >= 4
                          ? 'Jornada concluída'
                          : _labelFor(_nextMarkType)),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: LumoColors.ink,
              ),
            ),
          ),

          const SizedBox(height: 20),

          if (_todayRecords.isNotEmpty) ...[
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Marcações de hoje',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  color: LumoColors.ink,
                ),
              ),
            ),
            const SizedBox(height: 10),

            ..._todayRecords.map(
              (record) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: LumoColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      size: 18,
                      color: LumoColors.success,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _shortLabel(record.type),
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: LumoColors.ink,
                        ),
                      ),
                    ),
                    Text(
                      DateFormat('HH:mm').format(record.dateTime),
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: LumoColors.slate,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          const SizedBox(height: 16),

          const Text(
            'Selfie facial somente na entrada e na saída final. Intervalo e retorno validam GPS sem abrir a câmera.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: LumoColors.slate,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLastRecordCard() {
    final record = _lastRecord!;

    final color = switch (record.status) {
      AttendanceRecordStatus.validado => LumoColors.success,
      AttendanceRecordStatus.pendente => LumoColors.warning,
      AttendanceRecordStatus.suspeito => LumoColors.danger,
    };

    final label = switch (record.status) {
      AttendanceRecordStatus.validado => 'Marcação validada',
      AttendanceRecordStatus.pendente => 'Marcação pendente de revisão',
      AttendanceRecordStatus.suspeito => 'Localização fora do esperado',
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.check_circle_outline_rounded,
            color: color,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                Text(
                  '${DateFormat('HH:mm').format(record.dateTime)} · precisão de ${record.gpsAccuracyMeters.round()} m',
                  style: const TextStyle(
                    color: LumoColors.slate,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
