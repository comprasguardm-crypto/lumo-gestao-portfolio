import '../core/network/supabase_api.dart';
import '../models/employee.dart';

class EmployeeService {
  final SupabaseApi _api;
  EmployeeService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  Future<Employee> getCurrentEmployee() async {
    final context = await _api.backendContext();
    final row = context['employee'] as Map<String, dynamic>?;
    if (row == null) throw const SupabaseApiException('Seu usuário ainda não está vinculado a um colaborador ativo.');
    final profile = Map<String, dynamic>.from(context['profile'] as Map);
    final company = context['company'] == null ? <String, dynamic>{} : Map<String, dynamic>.from(context['company'] as Map);
    final id = '${row['id']}';
    return Employee(
      id: id,
      name: '${row['name'] ?? profile['full_name'] ?? 'Colaborador'}',
      role: '${row['function'] ?? 'Colaborador'}',
      department: '${row['department'] ?? 'Não informado'}',
      branch: '${company['trade_name'] ?? company['legal_name'] ?? 'Empresa'}',
      matricula: id.length > 8 ? id.substring(0, 8).toUpperCase() : id.toUpperCase(),
      email: '${row['work_email'] ?? await _api.currentEmail() ?? ''}',
      phone: '',
      admissionDate: '${row['admission_date'] ?? ''}',
    );
  }
}
