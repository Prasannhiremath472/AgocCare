import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/intl.dart';

class AppHelpers {
  static String formatPrice(num price) {
    return NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0)
        .format(price);
  }

  static int discount(num price, num mrp) {
    if (mrp <= 0 || mrp <= price) return 0;
    return (((mrp - price) / mrp) * 100).round();
  }

  // Returns empty string if no image, 'base64:...' prefix for base64, or a full HTTPS URL
  static String imgUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    // Already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // Base64 data URI — return as-is, use isBase64() to detect in widgets
    if (path.startsWith('data:')) return path;
    // Relative path like "uploads/abc.jpg" or "/uploads/abc.jpg"
    final base = (dotenv.env['IMAGE_BASE_URL'] ?? 'https://api.agoccarepvtltd.com')
        .replaceAll(RegExp(r'/$'), ''); // strip trailing slash
    final clean = path.startsWith('/') ? path : '/$path';
    return '$base$clean';
  }

  // Returns true if the image string is a base64 data URI
  static bool isBase64(String? url) {
    return url != null && url.startsWith('data:');
  }

  // Decode base64 data URI to bytes for Image.memory()
  static List<int>? base64Bytes(String dataUri) {
    try {
      final comma = dataUri.indexOf(',');
      if (comma == -1) return null;
      return base64Decode(dataUri.substring(comma + 1));
    } catch (_) {
      return null;
    }
  }

  static String formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return DateFormat('dd MMM yyyy').format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatDateTime(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return DateFormat('dd MMM yyyy, h:mm a').format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  static double deliveryFee(double subtotal) {
    return subtotal >= 499 ? 0 : 49;
  }
}
