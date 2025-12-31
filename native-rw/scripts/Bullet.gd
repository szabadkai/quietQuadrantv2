extends Area2D

@export var speed := 720.0
@export var damage := 10
@export var pierce := 0

var direction := Vector2.RIGHT
var is_crit := false

func get_damage() -> int:
  return damage

func _ready() -> void:
  add_to_group("bullets")
  area_entered.connect(_on_area_entered)

func _process(delta: float) -> void:
  position += direction.normalized() * speed * delta
  var viewport_size = get_viewport_rect().size
  if position.x < -32.0 or position.y < -32.0:
    queue_free()
  elif position.x > viewport_size.x + 32.0 or position.y > viewport_size.y + 32.0:
    queue_free()

func _on_area_entered(area: Area2D) -> void:
  if area.is_in_group("enemies"):
    if pierce > 0:
      pierce -= 1
    else:
      queue_free()
