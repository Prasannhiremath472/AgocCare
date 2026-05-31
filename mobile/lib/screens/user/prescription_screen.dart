import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../models/prescription_model.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/app_bottom_nav.dart';

class PrescriptionScreen extends ConsumerStatefulWidget {
  const PrescriptionScreen({super.key});
  @override
  ConsumerState<PrescriptionScreen> createState() => _PrescriptionScreenState();
}

class _PrescriptionScreenState extends ConsumerState<PrescriptionScreen> {
  File? _image;
  bool _isLoading = false;
  List<ExtractedMedicine>? _results;
  String? _error;

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 80);
    if (picked != null) {
      setState(() { _image = File(picked.path); _results = null; _error = null; });
    }
  }

  Future<void> _extract() async {
    if (_image == null) return;
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiService().extractPrescription(_image!.path);
      final medicines = (res['medicines'] as List<dynamic>? ?? [])
          .map((e) => ExtractedMedicine.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() { _results = medicines; _isLoading = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Prescription Scanner')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Info banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.secondaryLight,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
            ),
            child: Row(children: [
              const Icon(Icons.info_outline, color: AppColors.secondary),
              const SizedBox(width: 10),
              const Expanded(child: Text('Upload a clear photo of your prescription. Our AI will identify medicines and find matching products.',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary))),
            ]),
          ),
          const SizedBox(height: 20),

          // Image picker area
          GestureDetector(
            onTap: () => _showSourceDialog(),
            child: Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.border, width: 2),
              ),
              child: _image != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.lg - 2),
                      child: Image.file(_image!, fit: BoxFit.cover))
                  : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Icon(Icons.upload_file_rounded, size: 56, color: AppColors.secondary),
                      const SizedBox(height: 12),
                      const Text('Tap to upload prescription', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      const Text('Camera or Gallery', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    ]),
            ),
          ),
          const SizedBox(height: 12),

          // Buttons
          Row(children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _pickImage(ImageSource.camera),
                icon: const Icon(Icons.camera_alt_outlined),
                label: const Text('Camera'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _pickImage(ImageSource.gallery),
                icon: const Icon(Icons.photo_library_outlined),
                label: const Text('Gallery'),
              ),
            ),
          ]),
          const SizedBox(height: 16),

          if (_image != null)
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _isLoading ? null : _extract,
                icon: _isLoading
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.document_scanner_rounded),
                label: Text(_isLoading ? 'Scanning...' : 'Scan Prescription'),
              ),
            ),

          if (_error != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.error.withOpacity(0.08), borderRadius: BorderRadius.circular(AppRadius.md)),
              child: Row(children: [
                const Icon(Icons.error_outline, color: AppColors.error),
                const SizedBox(width: 8),
                Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),
              ]),
            ),
          ],

          // Results
          if (_results != null) ...[
            const SizedBox(height: 24),
            Text('Found ${_results!.length} medicine${_results!.length != 1 ? 's' : ''}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            ..._results!.map((med) => _MedicineResult(medicine: med)),
          ],
        ]),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 0),
    );
  }

  void _showSourceDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(leading: const Icon(Icons.camera_alt, color: AppColors.primary),
            title: const Text('Take Photo'), onTap: () { Navigator.pop(context); _pickImage(ImageSource.camera); }),
          ListTile(leading: const Icon(Icons.photo_library, color: AppColors.primary),
            title: const Text('Choose from Gallery'), onTap: () { Navigator.pop(context); _pickImage(ImageSource.gallery); }),
        ]),
      ),
    );
  }
}

class _MedicineResult extends ConsumerWidget {
  final ExtractedMedicine medicine;
  const _MedicineResult({required this.medicine});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 8)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.medication_rounded, color: AppColors.primary, size: 20),
          const SizedBox(width: 8),
          Text(medicine.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        ]),
        if (medicine.dosage != null || medicine.frequency != null) ...[
          const SizedBox(height: 4),
          Text('${medicine.dosage ?? ''} ${medicine.frequency ?? ''}'.trim(),
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
        if (medicine.matches.isNotEmpty) ...[
          const SizedBox(height: 10),
          const Text('Matching Products:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 6),
          ...medicine.matches.map((product) => Container(
            margin: const EdgeInsets.only(bottom: 6),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(product.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                Text(AppHelpers.formatPrice(product.price), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ])),
              ElevatedButton(
                onPressed: () => ref.read(cartProvider.notifier).addItem(product),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  minimumSize: Size.zero,
                  textStyle: const TextStyle(fontSize: 12),
                ),
                child: const Text('Add'),
              ),
            ]),
          )),
        ] else
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Text('No matching products found', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ),
      ]),
    );
  }
}
