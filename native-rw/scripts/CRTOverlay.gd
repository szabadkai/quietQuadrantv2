extends CanvasLayer

@onready var rect := $Overlay
@onready var settings := get_node_or_null("/root/SettingsState")

func _ready() -> void:
  _apply_settings()
  if settings:
    settings.settings_changed.connect(_apply_settings)

func _apply_settings() -> void:
  if settings == null:
    return
  var material = rect.material
  if material and material is ShaderMaterial:
    material.set_shader_parameter("scanline_intensity", settings.scanline_intensity)
