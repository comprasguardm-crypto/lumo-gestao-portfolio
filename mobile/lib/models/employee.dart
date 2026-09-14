/// Representa o colaborador logado no app.
/// Espelha o tipo `Employee` do painel web para manter os dois
/// front-ends compatíveis com o backend multiempresa do Lumo.
class Employee {
  final String id;
  final String name;
  final String role;
  final String department;
  final String branch;
  final String matricula;
  final String email;
  final String phone;
  final String admissionDate;
  final String? avatarUrl;

  const Employee({
    required this.id,
    required this.name,
    required this.role,
    required this.department,
    required this.branch,
    required this.matricula,
    required this.email,
    required this.phone,
    required this.admissionDate,
    this.avatarUrl,
  });

  String get initials {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
  }
}
