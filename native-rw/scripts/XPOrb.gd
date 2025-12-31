extends Area2D

@export var value := 10
@export var drift_speed := 40.0

var drift := Vector2.ZERO

func _ready() -> void:
  add_to_group("xp_orbs")
  drift = Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0)).normalized()
  area_entered.connect(_on_area_entered)

func _process(delta: float) -> void:
  position += drift * drift_speed * delta

func _on_area_entered(area: Area2D) -> void:
  if area.is_in_group("player"):
    queue_free()
