import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/helpers.dart';
import '../core/theme.dart';

/// Handles both base64 data URIs and network URLs transparently.
class AppImage extends StatelessWidget {
  final String? url;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final BorderRadius? borderRadius;

  const AppImage({
    super.key,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final Widget fallback = placeholder ??
        Container(
          width: width,
          height: height,
          color: AppColors.primaryLight,
          child: const Center(
            child: Icon(Icons.medication_rounded, color: AppColors.primary, size: 40),
          ),
        );

    if (url == null || url!.isEmpty) return fallback;

    Widget image;

    if (AppHelpers.isBase64(url)) {
      // Base64 data URI → Image.memory
      final bytes = AppHelpers.base64Bytes(url!);
      if (bytes == null) return fallback;
      image = Image.memory(
        Uint8List.fromList(bytes),
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => fallback,
      );
    } else {
      // Network URL → CachedNetworkImage
      image = CachedNetworkImage(
        imageUrl: url!,
        width: width,
        height: height,
        fit: fit,
        placeholder: (_, __) => Container(
          width: width,
          height: height,
          color: AppColors.border,
          child: const Center(
            child: SizedBox(
              width: 24, height: 24,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
            ),
          ),
        ),
        errorWidget: (_, __, ___) => fallback,
      );
    }

    if (borderRadius != null) {
      return ClipRRect(borderRadius: borderRadius!, child: image);
    }
    return image;
  }
}
