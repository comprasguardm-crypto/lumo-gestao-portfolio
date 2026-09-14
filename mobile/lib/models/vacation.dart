enum VacationStatus { emAnalise, aprovada, rejeitada, cancelada, agendada }

class Vacation {
  final String id;
  final DateTime startDate;
  final DateTime endDate;
  final int days;
  final VacationStatus status;
  final String? approver;

  const Vacation({
    required this.id,
    required this.startDate,
    required this.endDate,
    required this.days,
    required this.status,
    this.approver,
  });
}

/// Saldo de férias do colaborador logado.
class VacationBalance {
  final int totalDays;
  final int usedDays;
  final int scheduledDays;
  final DateTime acquisitionPeriodEnd;

  const VacationBalance({
    required this.totalDays,
    required this.usedDays,
    required this.scheduledDays,
    required this.acquisitionPeriodEnd,
  });

  int get availableDays => totalDays - usedDays - scheduledDays;
}
