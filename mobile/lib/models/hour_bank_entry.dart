/// Um lançamento no banco de horas do colaborador.
class HourBankEntry {
  final DateTime date;
  final String description;
  final Duration amount; // positivo = crédito, negativo = débito

  const HourBankEntry({
    required this.date,
    required this.description,
    required this.amount,
  });

  bool get isCredit => amount.isNegative == false;
}
