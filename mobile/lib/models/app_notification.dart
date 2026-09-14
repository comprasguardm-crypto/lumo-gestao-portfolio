class AppNotification {
  final String id;
  final String message;
  final DateTime createdAt;
  final bool read;

  const AppNotification({
    required this.id,
    required this.message,
    required this.createdAt,
    required this.read,
  });
}
