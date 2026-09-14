import 'dart:convert';
import 'dart:io';
import '../core/network/supabase_api.dart';
import '../models/attendance_record.dart';

class AttendanceService {
  final SupabaseApi _api;
  AttendanceService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  static const _punchFunctionName = String.fromEnvironment(
    'PUNCH_FUNCTION_NAME',
    defaultValue: 'lumo-mobile-punch-v1',
  );

  AttendanceMarkType _typeFromBackend(String value) {
    switch (value) {
      case 'entry':
        return AttendanceMarkType.entrada;
      case 'break_out':
        return AttendanceMarkType.saidaIntervalo;
      case 'break_in':
        return AttendanceMarkType.retornoIntervalo;
      case 'exit':
        return AttendanceMarkType.saida;
      default:
        return AttendanceMarkType.entrada;
    }
  }

  bool _requiresFace(AttendanceMarkType type) {
    return type == AttendanceMarkType.entrada || type == AttendanceMarkType.saida;
  }

  Future<Map<String, dynamic>> getTodayStatus() async {
    return _api.invoke(_punchFunctionName, {'action': 'status'});
  }

  Future<List<AttendanceRecord>> listTodayRecords() async {
    final status = await getTodayStatus();
    final punches = List<dynamic>.from(status['punches'] as List? ?? const []);
    return punches.map((raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      return AttendanceRecord(
        id: '${row['id']}',
        dateTime: DateTime.parse('${row['occurred_at']}').toLocal(),
        type: _typeFromBackend('${row['punch_type']}'),
        latitude: 0,
        longitude: 0,
        distanceFromAllowedMeters: (row['distance_m'] as num?)?.toDouble() ?? 0,
        gpsAccuracyMeters: (row['accuracy_m'] as num?)?.toDouble() ?? 0,
        status: AttendanceRecordStatus.validado,
      );
    }).toList();
  }

  Future<List<DailyAttendanceSummary>> listRecentSummaries() async {
    final context = await _api.backendContext();
    final employee = context['employee'] as Map<String, dynamic>?;
    if (employee == null) {
      throw const SupabaseApiException(
        'Seu usuário não está vinculado a um colaborador ativo.',
      );
    }

    final employeeId = '${employee['id']}';
    final rows = await _api.select(
      'ponto_entries',
      'select=id,work_date,entry_time,lunch_out,lunch_in,exit_time&employee_id=eq.${Uri.encodeComponent(employeeId)}&deleted_at=is.null&order=work_date.desc&limit=30',
    );

    return rows.map((raw) {
      final row = Map<String, dynamic>.from(raw as Map);

      String? hhmm(dynamic value) {
        if (value == null) return null;
        final text = '$value';
        return text.length >= 5 ? text.substring(0, 5) : text;
      }

      final entry = hhmm(row['entry_time']);
      final lunchOut = hhmm(row['lunch_out']);
      final lunchIn = hhmm(row['lunch_in']);
      final exit = hhmm(row['exit_time']);

      return DailyAttendanceSummary(
        date: DateTime.parse('${row['work_date']}T12:00:00'),
        checkIn: entry,
        lunchOut: lunchOut,
        lunchIn: lunchIn,
        checkOut: exit,
        workedHours: _workedHours(entry, lunchOut, lunchIn, exit),
        status: exit != null ? 'completo' : 'incompleto',
      );
    }).toList();
  }

  String? _workedHours(
    String? entry,
    String? lunchOut,
    String? lunchIn,
    String? exit,
  ) {
    int? minutes(String? value) {
      if (value == null) return null;
      final parts = value.split(':');
      if (parts.length < 2) return null;
      final hour = int.tryParse(parts[0]);
      final minute = int.tryParse(parts[1]);
      if (hour == null || minute == null) return null;
      return hour * 60 + minute;
    }

    final a = minutes(entry);
    final b = minutes(lunchOut);
    final c = minutes(lunchIn);
    final d = minutes(exit);

    if (a == null || d == null) return null;

    final pause = b != null && c != null ? (c - b).clamp(0, 24 * 60) : 0;
    final total = (d - a - pause).clamp(0, 24 * 60);

    return '${(total ~/ 60).toString().padLeft(2, '0')}h${(total % 60).toString().padLeft(2, '0')}';
  }

  Future<AttendanceRecord> registerMark({
    required AttendanceMarkType type,
    required String? photoPath,
    required double latitude,
    required double longitude,
    required double gpsAccuracyMeters,
    required bool isMocked,
    required DateTime positionTimestamp,
  }) async {
    List<int>? photoBytes;

    if (_requiresFace(type)) {
      if (photoPath == null || photoPath.isEmpty) {
        throw const SupabaseApiException(
          'A selfie facial é obrigatória na entrada e na saída final.',
        );
      }

      final file = File(photoPath);
      if (!await file.exists()) {
        throw const SupabaseApiException(
          'Não foi possível acessar a selfie capturada.',
        );
      }

      final bytes = await file.readAsBytes();

      if (bytes.length < 8000) {
        throw const SupabaseApiException(
          'A foto capturada parece inválida. Tire uma nova selfie.',
        );
      }

      if (bytes.length > 3000000) {
        throw const SupabaseApiException(
          'A selfie ficou muito grande. Tire uma nova foto com menor resolução.',
        );
      }

      if (bytes.length < 3 ||
          bytes[0] != 0xFF ||
          bytes[1] != 0xD8 ||
          bytes[2] != 0xFF) {
        throw const SupabaseApiException(
          'A captura precisa ser uma foto JPEG feita pela câmera.',
        );
      }

      photoBytes = bytes;
    }

    final payload = <String, dynamic>{
      'action': 'punch',
      'latitude': latitude,
      'longitude': longitude,
      'accuracy_m': gpsAccuracyMeters,
      'is_mocked': isMocked,
      'position_timestamp': positionTimestamp.toUtc().toIso8601String(),
      'device_info': {
        'platform': Platform.operatingSystem,
        'platform_version': Platform.operatingSystemVersion,
        'locale': Platform.localeName,
        'source': 'lumo_flutter_mobile',
      },
    };

    if (photoBytes != null) {
      payload['photo_base64'] = base64Encode(photoBytes);
    }

    final response = await _api.invoke(_punchFunctionName, payload);
    final punch = Map<String, dynamic>.from(
      response['punch'] as Map? ?? const {},
    );

    if (punch.isEmpty) {
      throw const SupabaseApiException(
        'O servidor não confirmou o registro do ponto.',
      );
    }

    final localDate = '${punch['local_date'] ?? ''}';
    final localTime = '${punch['local_time'] ?? ''}';

    final recordedAt =
        DateTime.tryParse('${localDate}T$localTime') ??
        DateTime.parse('${punch['occurred_at']}').toLocal();

    return AttendanceRecord(
      id: '${punch['id']}',
      dateTime: recordedAt,
      type: _typeFromBackend('${punch['type']}'),
      photoPath: photoPath,
      latitude: latitude,
      longitude: longitude,
      distanceFromAllowedMeters:
          (punch['distance_m'] as num?)?.toDouble() ?? 0,
      gpsAccuracyMeters:
          (punch['accuracy_m'] as num?)?.toDouble() ?? gpsAccuracyMeters,
      status: AttendanceRecordStatus.validado,
    );
  }
}
