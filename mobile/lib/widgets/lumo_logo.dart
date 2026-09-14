import 'package:flutter/material.dart';
import '../core/theme/lumo_theme.dart';

class LumoLogoMark extends StatelessWidget {
  final double size;
  final bool framed;

  const LumoLogoMark({
    super.key,
    this.size = 44,
    this.framed = true,
  });

  @override
  Widget build(BuildContext context) {
    final mark = CustomPaint(
      painter: _LumoMarkPainter(),
      child: SizedBox(width: size, height: size),
    );

    if (!framed) return mark;

    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(size * 0.13),
      decoration: BoxDecoration(
        color: LumoColors.inkDeep,
        borderRadius: BorderRadius.circular(size * 0.28),
        boxShadow: [
          BoxShadow(
            color: LumoColors.turquoise.withValues(alpha: 0.14),
            blurRadius: size * 0.30,
            spreadRadius: -size * 0.10,
          ),
        ],
      ),
      child: CustomPaint(painter: _LumoMarkPainter()),
    );
  }
}

class LumoBrand extends StatelessWidget {
  final bool dark;
  final bool compact;

  const LumoBrand({
    super.key,
    this.dark = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        LumoLogoMark(size: compact ? 36 : 46),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: compact ? 17 : 22,
                  fontWeight: FontWeight.w800,
                  color: dark ? Colors.white : LumoColors.ink,
                ),
                children: const [
                  TextSpan(text: 'Lumo '),
                  TextSpan(text: 'GestÃ£o', style: TextStyle(color: LumoColors.turquoise)),
                ],
              ),
            ),
            if (!compact) ...[
              const SizedBox(height: 2),
              RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: 12,
                    color: dark ? Colors.white70 : LumoColors.slate,
                  ),
                  children: const [
                    TextSpan(text: 'GestÃ£o de RH '),
                    TextSpan(text: 'descomplicada.', style: TextStyle(color: LumoColors.turquoise)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _LumoMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final shader = const LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        LumoColors.lime,
        LumoColors.mint,
        LumoColors.turquoise,
      ],
      stops: [0, 0.5, 1],
    ).createShader(rect);

    final paint = Paint()..shader = shader;
    final secondary = Paint()..color = LumoColors.turquoise.withValues(alpha: 0.78);

    final vertical = RRect.fromRectAndCorners(
      Rect.fromLTWH(size.width * 0.20, size.height * 0.08, size.width * 0.34, size.height * 0.72),
      topLeft: Radius.circular(size.width * 0.18),
      topRight: Radius.circular(size.width * 0.18),
      bottomLeft: Radius.circular(size.width * 0.18),
      bottomRight: Radius.circular(size.width * 0.12),
    );
    canvas.drawRRect(vertical, paint);

    final horizontal = RRect.fromRectAndCorners(
      Rect.fromLTWH(size.width * 0.42, size.height * 0.56, size.width * 0.47, size.height * 0.25),
      topRight: Radius.circular(size.width * 0.18),
      bottomRight: Radius.circular(size.width * 0.18),
      bottomLeft: Radius.circular(size.width * 0.10),
    );
    canvas.drawRRect(horizontal, secondary);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
