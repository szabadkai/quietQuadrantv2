extends Area2D

signal fired(bullet)
signal hit(damage)
signal xp_collected(value)

@export var speed := 420.0
@export var fire_cooldown := 0.18
@export var bullet_scene: PackedScene
@export var separation_strength := 140.0

var last_aim := Vector2.RIGHT
var fire_timer := 0.0
var invuln_timer := 0.0
var is_dead := false
var velocity := Vector2.ZERO
var accel := 0.0
var drag := 0.992
var bullet_speed := 720.0
var bullet_damage := 10
var extra_projectiles := 0
var spread_degrees := 0.0
var upgrades: Array = []
var crit_chance := 0.08
var crit_multiplier := 1.6

@onready var glow_sprites := [$Glow, $Glow2]
@onready var settings := get_node_or_null("/root/SettingsState")

func _ready() -> void:
  add_to_group("player")
  area_entered.connect(_on_area_entered)
  accel = speed * 6.0
  _apply_glow()
  if settings:
    settings.settings_changed.connect(_apply_glow)

func _process(delta: float) -> void:
  if is_dead:
    return

  var mouse_dir = get_global_mouse_position() - global_position
  var has_mouse_aim = mouse_dir.length() > 0.5
  if has_mouse_aim:
    last_aim = mouse_dir.normalized()
    rotation = last_aim.angle()

  var input_vector = Vector2(
    Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
    Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
  )
  if input_vector.length() > 0.0:
    input_vector = input_vector.normalized()
    velocity += input_vector * accel * delta
    if not has_mouse_aim:
      last_aim = input_vector
      rotation = last_aim.angle()
  else:
    var drag_factor = pow(drag, delta * 60.0)
    velocity *= drag_factor

  var current_speed = velocity.length()
  if current_speed > speed:
    velocity = velocity * (speed / current_speed)

  position += velocity * delta
  _apply_separation(delta)
  var viewport_size = get_viewport_rect().size
  position.x = clamp(position.x, 16.0, viewport_size.x - 16.0)
  position.y = clamp(position.y, 16.0, viewport_size.y - 16.0)

  fire_timer = max(fire_timer - delta, 0.0)
  invuln_timer = max(invuln_timer - delta, 0.0)

  if Input.is_action_pressed("shoot") and fire_timer == 0.0:
    _fire()

func _fire() -> void:
  if bullet_scene == null:
    return
  fire_timer = fire_cooldown
  var total_projectiles = 1 + extra_projectiles
  var angle_step = 0.0
  if total_projectiles > 1:
    angle_step = deg_to_rad(spread_degrees * 2.0) / float(total_projectiles - 1)

  for i in range(total_projectiles):
    var bullet = bullet_scene.instantiate()
    bullet.global_position = global_position
    var angle_offset = 0.0
    if total_projectiles > 1:
      angle_offset = -deg_to_rad(spread_degrees) + angle_step * i
    var aim_angle = rotation + angle_offset
    bullet.direction = Vector2.RIGHT.rotated(aim_angle)
    bullet.speed = bullet_speed
    var is_crit = randf() < crit_chance
    bullet.damage = int(ceil(bullet_damage * (crit_multiplier if is_crit else 1.0)))
    bullet.is_crit = is_crit
    bullet.rotation = rotation
    emit_signal("fired", bullet)

func _apply_separation(delta: float) -> void:
  for area in get_overlapping_areas():
    if area.is_in_group("enemies"):
      var diff = global_position - area.global_position
      var dist = diff.length()
      if dist > 0.01:
        position += diff.normalized() * separation_strength * delta

func _on_area_entered(area: Area2D) -> void:
  if invuln_timer > 0.0:
    return
  if area.is_in_group("enemies"):
    invuln_timer = 0.5
    emit_signal("hit", 1)
  elif area.is_in_group("enemy_bullets"):
    invuln_timer = 0.35
    var damage_value = 1
    if "damage" in area:
      damage_value = area.damage
    emit_signal("hit", damage_value)
  elif area.is_in_group("xp_orbs"):
    var xp_value = 10
    if "value" in area:
      xp_value = area.value
    emit_signal("xp_collected", xp_value)

func apply_upgrade(upgrade_id: String) -> void:
  upgrades.append(upgrade_id)
  match upgrade_id:
    "rapid-fire":
      fire_cooldown = max(fire_cooldown * 0.85, 0.06)
    "power-shot":
      bullet_damage = int(ceil(bullet_damage * 1.15))
    "engine-tune":
      speed *= 1.1
    "sidecar":
      extra_projectiles += 1
      spread_degrees = max(spread_degrees, 5.0)

func _apply_glow() -> void:
  if settings == null:
    return
  var strength = settings.glow_strength
  for sprite in glow_sprites:
    if sprite == null:
      continue
    sprite.modulate.a = 0.25 + strength * 0.6
