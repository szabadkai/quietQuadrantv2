extends Node2D

@export var duration := 0.25
@export var max_radius := 24.0
@export var color := Color(0.2, 0.9, 1.0, 1.0)
@export var ring_count := 2
@export var ring_width := 4.0

var _elapsed := 0.0
func _process(delta: float) -> void:
  _elapsed += delta
  if _elapsed >= duration:
    queue_free()
    return
  queue_redraw()

func _draw() -> void:
  var t = _elapsed / duration
  var alpha = 1.0 - t
  var radius = lerp(max_radius * 0.2, max_radius, t)
  for i in range(ring_count):
    var ring_t = float(i + 1) / float(ring_count)
    var ring_radius = radius * ring_t
    var ring_alpha = alpha * (1.0 - ring_t * 0.35)
    var ring_color = Color(color.r, color.g, color.b, ring_alpha)
    draw_arc(Vector2.ZERO, ring_radius, 0.0, TAU, 64, ring_color, ring_width)
