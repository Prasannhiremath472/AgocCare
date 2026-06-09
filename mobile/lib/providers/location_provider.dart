import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _cityKey = 'agoc_city';

class LocationState {
  final String city;
  final bool isLoading;

  const LocationState({this.city = '', this.isLoading = false});
}

class LocationNotifier extends StateNotifier<LocationState> {
  LocationNotifier() : super(const LocationState()) {
    _init();
  }

  Future<void> _init() async {
    // Load cached city immediately so UI shows something fast
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_cityKey);
    if (cached != null && cached.isNotEmpty) {
      state = LocationState(city: cached);
    }
    await fetch();
  }

  Future<void> fetch() async {
    state = LocationState(city: state.city, isLoading: true);
    try {
      // Check if location service is enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        state = LocationState(city: state.city);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied ||
            permission == LocationPermission.deniedForever) {
          state = LocationState(city: state.city);
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.low, // faster, less battery
          timeLimit: Duration(seconds: 8),
        ),
      );

      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final city = p.locality ?? p.subAdministrativeArea ?? p.administrativeArea ?? '';
        if (city.isNotEmpty) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_cityKey, city);
          state = LocationState(city: city);
          return;
        }
      }
      state = LocationState(city: state.city);
    } catch (_) {
      state = LocationState(city: state.city);
    }
  }
}

final locationProvider =
    StateNotifierProvider<LocationNotifier, LocationState>((ref) {
  return LocationNotifier();
});
