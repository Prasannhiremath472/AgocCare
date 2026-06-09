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
      // Network URL → CachedNetworkImage with memory-size cap to avoid decoding full-res images
      final cacheW = width?.toInt();
      final cacheH = height?.toInt();
      image = CachedNetworkImage(
        imageUrl: url!,
        width: width,
        height: height,
        fit: fit,
        memCacheWidth: cacheW != null ? cacheW * 2 : null,   // 2x for retina
        memCacheHeight: cacheH != null ? cacheH * 2 : null,
        fadeInDuration: const Duration(milliseconds: 150),
        placeholder: (_, __) => Container(
          width: width,
          height: height,
          color: AppColors.border,
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
