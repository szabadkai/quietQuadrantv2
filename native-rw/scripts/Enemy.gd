extends Area2D

signal killed(xp_value, position, was_crit)
signal fired(bullet)

@export var enemy_type := "drifter"
@export var is_elite := false
@export var enemy_bullet_scene: PackedScene
@export var separation_strength := 120.0

var target: Node2D
var speed := 120.0
var health := 20
var xp_value := 10
var bullet_speed := 180.0
var fire_cooldown := 0.0
var fire_interval := 1.6
var orbit_angle := 0.0
var orbit_dir := 1.0
var orbit_radius := 180.0
var teleport_timer := 0.0

@onready var sprite := $Sprite2D
@onready var glow_sprites := [$Glow, $Glow2]
@onready var settings := get_node_or_null("/root/SettingsState")

const ELITE_HEALTH_MULT := 1.8
const ELITE_SPEED_MULT := 1.3

const ENEMY_CONFIGS := {
  "drifter": {
    "health": 12,
    "speed": 150.0,
    "xp": 10,
    "sprite": "res://assets/sprites/drifter.svg"
  },
  "watcher": {
    "health": 45,
    "speed": 100.0,
    "xp": 10,
    "bullet_speed": 165.0,
    "fire_interval": 1.5,
    "sprite": "res://assets/sprites/watcher.svg"
  },
  "phantom": {
    "health": 24,
    "speed": 125.0,
    "xp": 10,
    "teleport_interval": 2.6,
    "sprite": "res://assets/sprites/phantom.svg"
  },
  "orbiter": {
    "health": 36,
    "speed": 170.0,
    "xp": 10,
    "bullet_speed": 150.0,
    "fire_interval": 1.9,
    "orbit_radius": 180.0,
    "sprite": "res://assets/sprites/orbiter.svg"
  },
  "mass": {
    "health": 110,
    "speed": 70.0,
    "xp": 10,
    "bullet_speed": 125.0,
    "fire_interval": 2.4,
    "sprite": "res://assets/sprites/mass.svg"
  }
}

func _ready() -> void:
  add_to_group("enemies")
  area_entered.connect(_on_area_entered)
  _apply_config()
  _apply_glow()
  if settings:
    settings.settings_changed.connect(_apply_glow)

func _process(delta: float) -> void:
  if target == null:
    return
  match enemy_type:
    "watcher":
      _update_watcher(delta)
    "phantom":
      _update_phantom(delta)
    "orbiter":
      _update_orbiter(delta)
    "mass":
      _update_mass(delta)
    _:
      _seek_player(delta)
  _apply_separation(delta)

func _apply_config() -> void:
  var config = ENEMY_CONFIGS.get(enemy_type, ENEMY_CONFIGS["drifter"])
  health = config["health"]
  speed = config["speed"]
  xp_value = config["xp"]
  bullet_speed = config.get("bullet_speed", bullet_speed)
  fire_interval = config.get("fire_interval", fire_interval)
  orbit_radius = config.get("orbit_radius", orbit_radius)
  teleport_timer = config.get("teleport_interval", teleport_timer)
  orbit_dir = -1.0 if randf() < 0.5 else 1.0
  orbit_angle = randf_range(0.0, TAU)

  if is_elite:
    health = int(ceil(health * ELITE_HEALTH_MULT))
    speed *= ELITE_SPEED_MULT

  var sprite_path = config.get("sprite", "")
  if sprite_path != "" and sprite:
    sprite.texture = load(sprite_path)
  for glow in glow_sprites:
    if glow:
      glow.texture = sprite.texture

func _apply_glow() -> void:
  if settings == null:
    return
  var strength = settings.glow_strength
  for glow in glow_sprites:
    if glow == null:
      continue
    glow.modulate.a = 0.22 + strength * 0.55

func _seek_player(delta: float) -> void:
  var direction = target.global_position - global_position
  if direction.length() > 0.0:
    position += direction.normalized() * speed * delta

func _update_watcher(delta: float) -> void:
  var direction = target.global_position - global_position
  var distance = direction.length()
  var desired = 240.0
  var buffer = 40.0
  var move = Vector2.ZERO
  if distance > desired + buffer:
    move = direction.normalized()
  elif distance < desired - buffer:
    move = -direction.normalized()
  else:
    move = Vector2(-direction.y, direction.x).normalized()
  position += move * speed * delta
  _fire_toward_player(delta)

func _update_phantom(delta: float) -> void:
  teleport_timer -= delta
  if teleport_timer <= 0.0:
    teleport_timer = randf_range(2.2, 3.4)
    var angle = randf_range(0.0, TAU)
    var distance = randf_range(120.0, 200.0)
    var target_pos = target.global_position + Vector2(cos(angle), sin(angle)) * distance
    var viewport_size = get_viewport_rect().size
    global_position.x = clamp(target_pos.x, 24.0, viewport_size.x - 24.0)
    global_position.y = clamp(target_pos.y, 24.0, viewport_size.y - 24.0)
  _seek_player(delta)

func _update_orbiter(delta: float) -> void:
  orbit_angle += orbit_dir * 1.7 * delta
  var orbit_point = target.global_position + Vector2(cos(orbit_angle), sin(orbit_angle)) * orbit_radius
  var direction = orbit_point - global_position
  if direction.length() > 0.0:
    position += direction.normalized() * speed * delta
  _fire_toward_player(delta)

func _update_mass(delta: float) -> void:
  _seek_player(delta)
  fire_cooldown -= delta
  if fire_cooldown <= 0.0:
    fire_cooldown = fire_interval
    _radial_burst(8)

func _fire_toward_player(delta: float) -> void:
  fire_cooldown -= delta
  if fire_cooldown > 0.0:
    return
  fire_cooldown = fire_interval
  var direction = (target.global_position - global_position).normalized()
  _spawn_bullet(direction)

func _radial_burst(count: int) -> void:
  var step = TAU / float(count)
  for i in range(count):
    var angle = step * i
    _spawn_bullet(Vector2(cos(angle), sin(angle)))

func _spawn_bullet(direction: Vector2) -> void:
  if enemy_bullet_scene == null:
    return
  var bullet = enemy_bullet_scene.instantiate()
  bullet.global_position = global_position
  bullet.direction = direction
  bullet.speed = bullet_speed
  emit_signal("fired", bullet)

func _apply_separation(delta: float) -> void:
  for area in get_overlapping_areas():
    if area.is_in_group("enemies") and area != self:
      var diff = global_position - area.global_position
      var dist = diff.length()
      if dist > 0.01:
        global_position += diff.normalized() * separation_strength * 0.4 * delta
    elif area.is_in_group("player"):
      var diff_player = global_position - area.global_position
      var dist_player = diff_player.length()
      if dist_player > 0.01:
        global_position += diff_player.normalized() * separation_strength * 0.2 * delta

func _on_area_entered(area: Area2D) -> void:
  if area.is_in_group("bullets"):
    var damage_value = 10
    var was_crit = false
    if area.has_method("get_damage"):
      damage_value = area.get_damage()
    elif "damage" in area:
      damage_value = area.damage
    if "is_crit" in area:
      was_crit = area.is_crit
    health -= damage_value
    if health <= 0:
      emit_signal("killed", xp_value, global_position, was_crit)
      queue_free()
