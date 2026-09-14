import '../core/network/supabase_api.dart';
import '../models/vacation.dart';

class VacationService {
  final SupabaseApi _api;
  VacationService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  VacationStatus _status(String value) {
    switch (value) {
      case 'approved': return VacationStatus.aprovada;
      case 'rejected': return VacationStatus.rejeitada;
      case 'cancelled': return VacationStatus.cancelada;
      case 'scheduled': return VacationStatus.agendada;
      default: return VacationStatus.emAnalise;
    }
  }

  int _days(DateTime start, DateTime end) => end.difference(start).inDays + 1;

  Future<Map<String, dynamic>> _employeeContext() async {
    final context = await _api.backendContext();
    final employee = context['employee'] as Map<String, dynamic>?;
    if (employee == null) throw const SupabaseApiException('Seu usuário não está vinculado a um colaborador ativo.');
    return {'profile': Map<String, dynamic>.from(context['profile'] as Map), 'employee': employee};
  }

  Future<VacationBalance> getBalance() async {
    final context = await _employeeContext();
    final employee = context['employee'] as Map<String, dynamic>;
    final id = '${employee['id']}';
    final periods = await _api.select('ponto_vacation_periods', 'select=id,entitled_days,acquisition_end,deadline_start&employee_id=eq.${Uri.encodeComponent(id)}&order=acquisition_end.desc&limit=1');
    final usage = await _api.select('ponto_vacation_usage', 'select=days_taken,status&employee_id=eq.${Uri.encodeComponent(id)}');
    final requests = await _api.select('ponto_employee_requests', 'select=start_date,end_date,status&employee_id=eq.${Uri.encodeComponent(id)}&request_type=eq.vacation');

    int total = 30;
    DateTime deadline = DateTime.now().add(const Duration(days: 365));
    if (periods.isNotEmpty) {
      final row = Map<String, dynamic>.from(periods.first as Map);
      total = ((row['entitled_days'] as num?)?.round() ?? 30).clamp(0, 90).toInt();
      final rawDeadline = row['deadline_start'] ?? row['acquisition_end'];
      if (rawDeadline != null) deadline = DateTime.parse('$rawDeadline');
    }
    final used = usage.fold<int>(0, (sum, raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      if ('${row['status']}' == 'cancelled') return sum;
      return sum + ((row['days_taken'] as num?)?.round() ?? 0);
    });
    final now = DateTime.now();
    final scheduled = requests.fold<int>(0, (sum, raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      if ('${row['status']}' != 'approved') return sum;
      final startRaw = row['start_date']; final endRaw = row['end_date'];
      if (startRaw == null || endRaw == null) return sum;
      final start = DateTime.parse('$startRaw'); final end = DateTime.parse('$endRaw');
      if (end.isBefore(DateTime(now.year, now.month, now.day))) return sum;
      return sum + _days(start, end);
    });
    return VacationBalance(totalDays: total, usedDays: used, scheduledDays: scheduled, acquisitionPeriodEnd: deadline);
  }

  Future<List<Vacation>> listVacations() async {
    final context = await _employeeContext();
    final employee = context['employee'] as Map<String, dynamic>;
    final id = '${employee['id']}';
    final rows = await _api.select('ponto_employee_requests', 'select=id,start_date,end_date,status,manager_note,decided_by,created_at&employee_id=eq.${Uri.encodeComponent(id)}&request_type=eq.vacation&order=created_at.desc');
    return rows.where((raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      return row['start_date'] != null && row['end_date'] != null;
    }).map((raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      final start = DateTime.parse('${row['start_date']}');
      final end = DateTime.parse('${row['end_date']}');
      return Vacation(id: '${row['id']}', startDate: start, endDate: end, days: _days(start, end), status: _status('${row['status']}'), approver: row['decided_by'] == null ? null : 'RH / Gestor');
    }).toList();
  }

  Future<bool> requestVacation({required DateTime startDate, required int days}) async {
    if (days < 1 || days > 30) return false;
    final context = await _employeeContext();
    final profile = context['profile'] as Map<String, dynamic>;
    final employee = context['employee'] as Map<String, dynamic>;
    final userId = await _api.currentUserId();
    if (userId == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final endDate = startDate.add(Duration(days: days - 1));
    String iso(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    await _api.insert('ponto_employee_requests', {
      'company_id': profile['company_id'],
      'employee_id': employee['id'],
      'created_by': userId,
      'request_type': 'vacation',
      'start_date': iso(startDate),
      'end_date': iso(endDate),
      'message': 'Solicitação de férias pelo aplicativo Lumo',
      'status': 'pending',
      'approval_payload': <String, dynamic>{},
    });
    return true;
  }
}
