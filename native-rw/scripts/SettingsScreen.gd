extends Control

@export var title_scene_path := "res://scenes/Title.tscn"

@onready var scanline_slider := $Panel/ScanlineSlider
@onready var glow_slider := $Panel/GlowSlider
@onready var settings := get_node_or_null("/root/SettingsState")

func _ready() -> void:
  if settings:
    scanline_slider.value = settings.scanline_intensity
    glow_slider.value = settings.glow_strength
  scanline_slider.value_changed.connect(_on_scanline_changed)
  glow_slider.value_changed.connect(_on_glow_changed)

func _unhandled_input(event: InputEvent) -> void:
  if event.is_action_pressed("ui_cancel"):
    get_tree().change_scene_to_file(title_scene_path)

func _on_scanline_changed(value: float) -> void:
  if settings:
    settings.set_scanline_intensity(value)

func _on_glow_changed(value: float) -> void:
  if settings:
    settings.set_glow_strength(value)
