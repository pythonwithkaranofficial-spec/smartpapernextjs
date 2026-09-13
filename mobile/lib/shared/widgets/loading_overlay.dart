import 'package:flutter/material.dart';

class GeneratingOverlay extends StatefulWidget {
  final String statusText;
  const GeneratingOverlay({super.key, this.statusText = 'AI is preparing your paper...'});

  @override
  State<GeneratingOverlay> createState() => _GeneratingOverlayState();
}

class _GeneratingOverlayState extends State<GeneratingOverlay> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0F172A).withValues(alpha: 0.9),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ScaleTransition(
              scale: Tween<double>(begin: 0.9, end: 1.1).animate(
                CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
              ),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                  border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4), width: 2),
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  size: 48,
                  color: Color(0xFF818CF8),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const CircularProgressIndicator(color: Color(0xFF6366F1)),
            const SizedBox(height: 16),
            Text(
              widget.statusText,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Analyzing CBSE curriculum taxonomy & formatting...',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
