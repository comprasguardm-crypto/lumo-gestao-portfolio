enum AttendanceMarkType { entrada, saidaIntervalo, retornoIntervalo, saida }

enum AttendanceRecordStatus { validado, pendente, suspeito }

/// Uma marcação de ponto feita pelo colaborador via app,
/// incluindo foto, geolocalização e metadados do dispositivo —
/// usados pelo RH para auditoria (ver módulo "Ponto" no painel web).
class AttendanceRecord {
  final String id;
  final DateTime dateTime;
  final AttendanceMarkType type;
  final String? photoPath;
  final double latitude;
  final double longitude;
  final double distanceFromAllowedMeters;
  final double gpsAccuracyMeters;
  final AttendanceRecordStatus status;

  const AttendanceRecord({
    required this.id,
    required this.dateTime,
    required this.type,
    this.photoPath,
    required this.latitude,
    required this.longitude,
    required this.distanceFromAllowedMeters,
    required this.gpsAccuracyMeters,
    required this.status,
  });
}

/// Resumo do dia (usado na tela "Meu ponto").
class DailyAttendanceSummary {
  final DateTime date;
  final String? checkIn;
  final String? lunchOut;
  final String? lunchIn;
  final String? checkOut;
  final String? workedHours;
  final String status; // completo, incompleto, falta, ferias, folga...

  const DailyAttendanceSummary({
    required this.date,
    this.checkIn,
    this.lunchOut,
    this.lunchIn,
    this.checkOut,
    this.workedHours,
    required this.status,
  });
}
