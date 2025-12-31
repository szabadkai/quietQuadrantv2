extends Node2D

@export var grid_spacing := 100.0
@export var base_color := Color(0.0, 0.0, 0.0)

var target: Node2D
var layers := []

func _ready() -> void:
  randomize()
  _seed_layers()

func _process(_delta: float) -> void:
  queue_redraw()

func _draw() -> void:
  var viewport_size = get_viewport_rect().size
  draw_rect(Rect2(Vector2.ZERO, viewport_size), base_color, true)

  var offset = Vector2.ZERO
  if target:
    offset = target.global_position - viewport_size * 0.5

  _draw_grid(viewport_size)
  _draw_stars(viewport_size, offset)
  _draw_bounds(viewport_size)

func _seed_layers() -> void:
  layers = [
    {"count": 40, "speed": 0.1, "size": Vector2(0.4, 1.0), "alpha": 0.25, "stars": []},
    {"count": 24, "speed": 0.25, "size": Vector2(0.8, 1.5), "alpha": 0.35, "stars": []},
    {"count": 12, "speed": 0.4, "size": Vector2(1.2, 2.0), "alpha": 0.5, "stars": []}
  ]

  var viewport_size = get_viewport_rect().size
  for layer in layers:
    for i in range(layer["count"]):
      layer["stars"].append({
        "x": randf() * viewport_size.x,
        "y": randf() * viewport_size.y,
        "size": randf_range(layer["size"].x, layer["size"].y),
        "alpha": layer["alpha"] * randf_range(0.7, 1.0)
      })

func _draw_grid(viewport_size: Vector2) -> void:
  var grid_color = Color(0.0, 1.0, 1.0, 0.08)
  for x in range(int(grid_spacing), int(viewport_size.x), int(grid_spacing)):
    draw_line(Vector2(x, 0), Vector2(x, viewport_size.y), grid_color, 1.0)
  for y in range(int(grid_spacing), int(viewport_size.y), int(grid_spacing)):
    draw_line(Vector2(0, y), Vector2(viewport_size.x, y), grid_color, 1.0)

func _draw_stars(viewport_size: Vector2, offset: Vector2) -> void:
  for layer in layers:
    var shift = offset * layer["speed"]
    for star in layer["stars"]:
      var x = _wrap(star["x"] - shift.x, viewport_size.x)
      var y = _wrap(star["y"] - shift.y, viewport_size.y)
      var color = Color(0.0, 1.0, 1.0, star["alpha"])
      draw_circle(Vector2(x, y), star["size"], color)

func _draw_bounds(viewport_size: Vector2) -> void:
  var bound_color = Color(0.0, 1.0, 1.0, 0.4)
  draw_rect(Rect2(Vector2.ONE, viewport_size - Vector2.ONE * 2.0), bound_color, false, 2.0)

func _wrap(value: float, max_value: float) -> float:
  var wrapped = fmod(value, max_value)
  if wrapped < 0.0:
    wrapped += max_value
  return wrapped
