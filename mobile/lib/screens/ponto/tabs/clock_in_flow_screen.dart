import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/lumo_theme.dart';
import '../../../models/attendance_record.dart';
import '../../../services/attendance_service.dart';

enum _FlowStep { camera, capturing, confirm, submitting, done, error }

/// Fluxo completo de marcação de ponto pelo app:
/// 1) abre a câmera frontal para o selfie de confirmação,
/// 2) captura a localização GPS no mesmo instante,
/// 3) mostra uma tela de confirmação com foto + coordenadas,
/// 4) envia a marcação real para a Edge Function guara-mobile-punch-v1 e mostra o resultado.
class ClockInFlowScreen extends StatefulWidget {
  final AttendanceMarkType markType;

  const ClockInFlowScreen({super.key, required this.markType});

  @override
  State<ClockInFlowScreen> createState() => _ClockInFlowScreenState();
}

class _ClockInFlowScreenState extends State<ClockInFlowScreen> {
  final _attendanceService = AttendanceService();

  CameraController? _cameraController;
  Future<void>? _cameraInitFuture;

  _FlowStep _step = _FlowStep.camera;
  String? _errorMessage;

  XFile? _capturedPhoto;
  Position? _position;
  AttendanceRecord? _resultRecord;

  @override
  void initState() {
    super.initState();
    _setupCamera();
  }

  Future<void> _setupCamera() async {
    final cameraStatus = await Permission.camera.request();
    if (!cameraStatus.isGranted) {
      setState(() {
        _step = _FlowStep.error;
        _errorMessage = cameraStatus.isPermanentlyDenied
            ? 'A permissão da câmera foi bloqueada. Abra as configurações do aplicativo e permita o uso da câmera.'
            : 'Precisamos da câmera para confirmar sua identidade na marcação.';
      });
      return;
    }

    try {
      final cameras = await availableCameras();
      final frontCamera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );
      final controller = CameraController(frontCamera, ResolutionPreset.medium, enableAudio: false);
      _cameraInitFuture = controller.initialize();
      await _cameraInitFuture;
      if (!mounted) return;
      setState(() => _cameraController = controller);
    } catch (e) {
      setState(() {
        _step = _FlowStep.error;
        _errorMessage = 'Não foi possível acessar a câmera neste dispositivo.';
      });
    }
  }

  Future<void> _captureAndLocate() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    setState(() => _step = _FlowStep.capturing);

    try {
      final photo = await _cameraController!.takePicture();
      final position = await _resolvePosition();

      setState(() {
        _capturedPhoto = photo;
        _position = position;
        _step = _FlowStep.confirm;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _step = _FlowStep.error;
        _errorMessage = e.toString().replaceFirst('Exception: ', '').replaceFirst('SupabaseApiException: ', '');
      });
    }
  }

  Future<Position> _resolvePosition() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('O GPS está desativado. Ative a localização do aparelho e tente novamente.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever) {
      throw Exception('A permissão de localização foi bloqueada. Abra as configurações do aplicativo e permita a localização precisa.');
    }
    if (permission == LocationPermission.denied) {
      throw Exception('Precisamos da sua localização para validar o ponto.');
    }

    return Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high, timeLimit: const Duration(seconds: 20));
  }

  Future<void> _confirmAndSubmit() async {
    if (_position == null || _capturedPhoto == null) return;
    setState(() => _step = _FlowStep.submitting);
    try {
      final record = await _attendanceService.registerMark(
        type: widget.markType,
        photoPath: _capturedPhoto?.path,
        latitude: _position!.latitude,
        longitude: _position!.longitude,
        gpsAccuracyMeters: _position!.accuracy,
        isMocked: _position!.isMocked,
        positionTimestamp: _position!.timestamp,
      );
      if (!mounted) return;
      setState(() {
        _resultRecord = record;
        _step = _FlowStep.done;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _step = _FlowStep.error;
        _errorMessage = e.toString().replaceFirst('SupabaseApiException: ', '').replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: switch (_step) {
          _FlowStep.camera || _FlowStep.capturing => _buildCameraView(),
          _FlowStep.confirm => _buildConfirmView(),
          _FlowStep.submitting => _buildSubmittingView(),
          _FlowStep.done => _buildDoneView(),
          _FlowStep.error => _buildErrorView(),
        },
      ),
    );
  }

  Widget _buildCameraView() {
    return Stack(
      fit: StackFit.expand,
      children: [
        if (_cameraController != null && _cameraController!.value.isInitialized)
          CameraPreview(_cameraController!)
        else
          const Center(child: CircularProgressIndicator(color: LumoColors.turquoise)),
        Positioned(
          top: 8,
          left: 8,
          child: IconButton(
            icon: const Icon(Icons.close_rounded, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        Positioned(
          bottom: 32,
          left: 0,
          right: 0,
          child: Column(
            children: [
              const Text(
                'Posicione seu rosto dentro da moldura',
                style: TextStyle(color: Colors.white, fontSize: 13),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _step == _FlowStep.capturing ? null : _captureAndLocate,
                child: Container(
                  height: 72,
                  width: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    border: Border.all(color: LumoColors.turquoise, width: 4),
                  ),
                  child: _step == _FlowStep.capturing
                      ? const Padding(
                          padding: EdgeInsets.all(20),
                          child: CircularProgressIndicator(strokeWidth: 2.5, color: LumoColors.ink),
                        )
                      : null,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmView() {
    return Container(
      color: LumoColors.frost,
      child: Column(
        children: [
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (_capturedPhoto != null) Image.file(File(_capturedPhoto!.path), fit: BoxFit.cover),
                Positioned(
                  top: 8,
                  left: 8,
                  child: IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Icon(Icons.my_location_rounded, size: 18, color: LumoColors.turquoise),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _position != null
                            ? '${_position!.latitude.toStringAsFixed(5)}, ${_position!.longitude.toStringAsFixed(5)} · precisão ${_position!.accuracy.round()} m'
                            : 'Localizando...',
                        style: const TextStyle(fontSize: 12, color: LumoColors.slate),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _step = _FlowStep.camera),
                        child: const Text('Repetir foto'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _confirmAndSubmit,
                        child: const Text('Confirmar marcação'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmittingView() {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(color: LumoColors.turquoise),
          SizedBox(height: 16),
          Text('Enviando marcação...', style: TextStyle(color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildDoneView() {
    final record = _resultRecord!;
    final color = switch (record.status) {
      AttendanceRecordStatus.validado => LumoColors.success,
      AttendanceRecordStatus.pendente => LumoColors.warning,
      AttendanceRecordStatus.suspeito => LumoColors.danger,
    };
    final title = switch (record.status) {
      AttendanceRecordStatus.validado => 'Ponto registrado!',
      AttendanceRecordStatus.pendente => 'Marcação enviada para revisão',
      AttendanceRecordStatus.suspeito => 'Marcação fora da localização esperada',
    };

    return Container(
      color: LumoColors.frost,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.check_circle_rounded, color: color, size: 56),
          const SizedBox(height: 16),
          Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17, color: LumoColors.ink)),
          const SizedBox(height: 8),
          Text(
            'Distância do local permitido: ${record.distanceFromAllowedMeters.round()} m',
            style: const TextStyle(color: LumoColors.slate, fontSize: 13),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.of(context).pop(record),
              child: const Text('Concluir'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Container(
      color: LumoColors.frost,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline_rounded, color: LumoColors.danger, size: 48),
          const SizedBox(height: 16),
          Text(
            _errorMessage ?? 'Ocorreu um erro inesperado.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: LumoColors.ink),
          ),
          const SizedBox(height: 24),
          if ((_errorMessage ?? '').toLowerCase().contains('configurações')) ...[
            SizedBox(width: double.infinity, child: OutlinedButton(onPressed: openAppSettings, child: const Text('Abrir configurações do app'))),
            const SizedBox(height: 10),
          ],
          if ((_errorMessage ?? '').toLowerCase().contains('gps está desativado')) ...[
            SizedBox(width: double.infinity, child: OutlinedButton(onPressed: Geolocator.openLocationSettings, child: const Text('Ativar localização'))),
            const SizedBox(height: 10),
          ],
          SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Voltar'))),
        ],
      ),
    );
  }
}
