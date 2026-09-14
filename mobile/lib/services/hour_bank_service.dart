import '../core/network/supabase_api.dart';
import '../models/hour_bank_entry.dart';

class HourBankService {
  final SupabaseApi _api;
  List<HourBankEntry> _entries = const [];
  HourBankService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  Future<List<HourBankEntry>> listEntries() async {
    final context = await _api.backendContext();
    final employee = context['employee'] as Map<String, dynamic>?;
    if (employee == null) throw const SupabaseApiException('Seu usuário não está vinculado a um colaborador ativo.');
    final id = '${employee['id']}';
    final rows = await _api.select('ponto_bank_transactions', 'select=id,tx_date,type,minutes,note,created_at&employee_id=eq.${Uri.encodeComponent(id)}&order=tx_date.desc,created_at.desc&limit=100');
    _entries = rows.map((raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      final minutes = (row['minutes'] as num?)?.toInt() ?? 0;
      final type = '${row['type']}'.toLowerCase();
      final signedMinutes = type.contains('debit') || type.contains('debito') || type.contains('débito') ? -minutes.abs() : minutes;
      return HourBankEntry(
        date: DateTime.parse('${row['tx_date']}T12:00:00'),
        description: '${row['note'] ?? (signedMinutes >= 0 ? 'Crédito de horas' : 'Débito de horas')}',
        amount: Duration(minutes: signedMinutes),
      );
    }).toList();
    return _entries;
  }

  Duration get currentBalance => _entries.fold(Duration.zero, (sum, e) => sum + e.amount);
}
