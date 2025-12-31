extends Node

signal settings_changed

var scanline_intensity := 0.45
var glow_strength := 0.95

func set_scanline_intensity(value: float) -> void:
  scanline_intensity = clamp(value, 0.0, 1.0)
  emit_signal("settings_changed")

func set_glow_strength(value: float) -> void:
  glow_strength = clamp(value, 0.0, 1.0)
  emit_signal("settings_changed")
