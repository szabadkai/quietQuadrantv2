extends Area2D

@export var speed := 260.0
@export var damage := 1

var direction := Vector2.RIGHT

func _ready() -> void:
  add_to_group("enemy_bullets")
  area_entered.connect(_on_area_entered)

func _process(delta: float) -> void:
  position += direction.normalized() * speed * delta
  var viewport_size = get_viewport_rect().size
  if position.x < -64.0 or position.y < -64.0:
    queue_free()
  elif position.x > viewport_size.x + 64.0 or position.y > viewport_size.y + 64.0:
    queue_free()

func _on_area_entered(area: Area2D) -> void:
  if area.is_in_group("player"):
    queue_free()
