extends Node2D

@export var enemy_scene: PackedScene
@export var bullet_scene: PackedScene
@export var enemy_bullet_scene: PackedScene
@export var explosion_scene: PackedScene
@export var spawn_interval := 0.7
@export var max_enemies := 22
@export var starting_health := 5

const WAVES := [
  {"id": "wave-1", "enemies": [{"kind": "drifter", "count": 12}]},
  {"id": "wave-2", "enemies": [{"kind": "drifter", "count": 14}, {"kind": "watcher", "count": 2}]},
  {"id": "wave-3", "enemies": [{"kind": "drifter", "count": 14}, {"kind": "watcher", "count": 3}, {"kind": "phantom", "count": 2}]},
  {"id": "wave-4", "enemies": [{"kind": "drifter", "count": 14}, {"kind": "orbiter", "count": 2}, {"kind": "phantom", "count": 2}]},
  {"id": "wave-5", "enemies": [{"kind": "drifter", "count": 16}, {"kind": "orbiter", "count": 3}, {"kind": "mass", "count": 2}, {"kind": "phantom", "count": 2}]}
]

const UPGRADE_POOL := [
  {"id": "rapid-fire", "title": "Rapid Fire", "desc": "+15% fire rate"},
  {"id": "power-shot", "title": "Power Shot", "desc": "+15% damage"},
  {"id": "engine-tune", "title": "Engine Tune", "desc": "+10% move speed"},
  {"id": "sidecar", "title": "Sidecar Shot", "desc": "+1 extra projectile"}
]

var score := 0
var health := 0
var wave_index := 0
var spawn_queue: Array = []
var awaiting_wave := false
var pending_wave_upgrade := false
var upgrade_choices: Array = []
var upgrade_active := false
var elapsed_time := 0.0

@onready var player := $Player
@onready var game_over := $UI/GameOver
@onready var spawn_timer := $EnemySpawnTimer
@onready var music := $Music
@onready var background := $BackgroundStars
@onready var sound := $SoundManager

@onready var hull_current := $UI/HUDRoot/LeftCluster/HullDisplay/HullCurrent
@onready var hull_max := $UI/HUDRoot/LeftCluster/HullDisplay/HullMax
@onready var health_bar_back := $UI/HUDRoot/LeftCluster/HealthBarBack
@onready var health_bar_fill := $UI/HUDRoot/LeftCluster/HealthBarBack/HealthBarFill
@onready var active_upgrades := $UI/HUDRoot/LeftCluster/ActiveUpgrades

@onready var wave_value := $UI/HUDRoot/CenterCluster/WaveValue
@onready var wave_meta := $UI/HUDRoot/CenterCluster/WaveMeta

@onready var mission_time := $UI/HUDRoot/RightCluster/MissionTime
@onready var fps_value := $UI/HUDRoot/RightCluster/FpsValue

@onready var upgrade_panel := $UI/UpgradePanel
@onready var upgrade_option_1 := $UI/UpgradePanel/Option1
@onready var upgrade_option_2 := $UI/UpgradePanel/Option2
@onready var upgrade_option_3 := $UI/UpgradePanel/Option3

func _ready() -> void:
  randomize()
  process_mode = Node.PROCESS_MODE_ALWAYS
  health = starting_health
  spawn_timer.wait_time = spawn_interval
  spawn_timer.timeout.connect(_spawn_enemy)
  player.hit.connect(_on_player_hit)
  player.fired.connect(_on_player_fired)
  player.bullet_scene = bullet_scene
  background.target = player
  upgrade_panel.visible = false
  wave_meta.visible = false
  _start_wave(0)
  _update_hud()
  if music.stream:
    music.play()

func _process(delta: float) -> void:
  var tree = get_tree()
  if game_over.visible and Input.is_action_just_pressed("restart") and tree:
    tree.reload_current_scene()
  if upgrade_active:
    _handle_upgrade_input()
  if tree and not tree.paused:
    elapsed_time += delta
  _update_runtime_ui()

func _start_wave(index: int) -> void:
  if index >= WAVES.size():
    _game_over(true)
    return
  wave_index = index
  spawn_queue.clear()
  var wave = WAVES[index]
  for entry in wave["enemies"]:
    for i in range(entry["count"]):
      spawn_queue.append({"kind": entry["kind"], "elite": entry.get("elite", false)})
  spawn_queue.shuffle()
  awaiting_wave = false
  pending_wave_upgrade = false
  wave_value.text = "%d/%d" % [wave_index + 1, WAVES.size()]
  await get_tree().create_timer(0.6).timeout

func _spawn_enemy() -> void:
  if player.is_dead or awaiting_wave or upgrade_active:
    return
  if get_tree().get_nodes_in_group("enemies").size() >= max_enemies:
    return
  if spawn_queue.is_empty():
    if get_tree().get_nodes_in_group("enemies").is_empty():
      awaiting_wave = true
      pending_wave_upgrade = true
      _open_upgrade_panel()
    return
  if enemy_scene == null:
    return
  var next = spawn_queue.pop_back()
  var enemy = enemy_scene.instantiate()
  add_child(enemy)
  enemy.global_position = _random_spawn_position()
  enemy.target = player
  enemy.enemy_type = next["kind"]
  enemy.is_elite = next.get("elite", false)
  enemy.enemy_bullet_scene = enemy_bullet_scene
  enemy.killed.connect(_on_enemy_killed)
  enemy.fired.connect(_on_enemy_fired)

func _random_spawn_position() -> Vector2:
  var viewport_size = get_viewport_rect().size
  var margin = 32.0
  var side = randi() % 4
  if side == 0:
    return Vector2(randf_range(0.0, viewport_size.x), -margin)
  if side == 1:
    return Vector2(viewport_size.x + margin, randf_range(0.0, viewport_size.y))
  if side == 2:
    return Vector2(randf_range(0.0, viewport_size.x), viewport_size.y + margin)
  return Vector2(-margin, randf_range(0.0, viewport_size.y))

func _on_enemy_killed(_xp_value: int, enemy_position: Vector2, was_crit: bool) -> void:
  score += 10
  _spawn_explosion(enemy_position, was_crit)
  sound.play_hit()
  _update_hud()

func _on_player_hit(damage: int) -> void:
  health -= damage
  sound.play_damage()
  _update_hud()
  if health <= 0:
    _game_over(false)

func _on_player_fired(bullet: Node2D) -> void:
  add_child(bullet)
  sound.play_shot()

func _on_enemy_fired(bullet: Node2D) -> void:
  add_child(bullet)

func _open_upgrade_panel() -> void:
  if upgrade_active:
    return
  upgrade_active = true
  if get_tree():
    get_tree().paused = true
  upgrade_panel.visible = true
  upgrade_choices = _roll_upgrades(3)
  upgrade_option_1.text = "[1] %s\n%s" % [upgrade_choices[0]["title"], upgrade_choices[0]["desc"]]
  upgrade_option_2.text = "[2] %s\n%s" % [upgrade_choices[1]["title"], upgrade_choices[1]["desc"]]
  upgrade_option_3.text = "[3] %s\n%s" % [upgrade_choices[2]["title"], upgrade_choices[2]["desc"]]

func _handle_upgrade_input() -> void:
  if _upgrade_pressed("upgrade_1", KEY_1, KEY_KP_1):
    _apply_upgrade_choice(0)
  elif _upgrade_pressed("upgrade_2", KEY_2, KEY_KP_2):
    _apply_upgrade_choice(1)
  elif _upgrade_pressed("upgrade_3", KEY_3, KEY_KP_3):
    _apply_upgrade_choice(2)

func _apply_upgrade_choice(index: int) -> void:
  if index < 0 or index >= upgrade_choices.size():
    return
  var choice = upgrade_choices[index]
  player.apply_upgrade(choice["id"])
  upgrade_panel.visible = false
  upgrade_active = false
  if get_tree():
    get_tree().paused = false
  if pending_wave_upgrade:
    awaiting_wave = false
    _start_wave(wave_index + 1)
  _update_hud()

func _upgrade_pressed(action: String, keycode: int, keypad: int) -> bool:
  return Input.is_action_just_pressed(action) or Input.is_key_pressed(keycode) or Input.is_key_pressed(keypad)

func _roll_upgrades(count: int) -> Array:
  var pool = UPGRADE_POOL.duplicate()
  pool.shuffle()
  return pool.slice(0, count)

func _game_over(victory: bool) -> void:
  player.is_dead = true
  game_over.text = "Transmission secured. Press R to restart." if victory else "Transmission lost. Press R to reboot."
  game_over.visible = true
  spawn_timer.stop()

func _update_hud() -> void:
  var max_health = max(starting_health, 1)
  var safe_health = max(health, 0)
  hull_current.text = str(safe_health)
  hull_max.text = "/ %d" % max_health
  _update_health_bar(float(safe_health) / float(max_health))
  _update_upgrades_display()

func _update_runtime_ui() -> void:
  mission_time.text = _format_clock(elapsed_time)
  fps_value.text = str(Engine.get_frames_per_second())

func _spawn_explosion(position: Vector2, was_crit: bool) -> void:
  if explosion_scene == null:
    return
  var explosion = explosion_scene.instantiate()
  explosion.global_position = position
  explosion.max_radius = 40.0 if was_crit else 26.0
  explosion.duration = 0.32 if was_crit else 0.22
  add_child(explosion)

func _update_health_bar(pct: float) -> void:
  var clamped = clamp(pct, 0.0, 1.0)
  var full_width = health_bar_back.size.x
  if full_width <= 0.0:
    full_width = health_bar_back.custom_minimum_size.x
  var full_height = health_bar_back.size.y
  if full_height <= 0.0:
    full_height = health_bar_back.custom_minimum_size.y
  health_bar_fill.size = Vector2(full_width * clamped, full_height)

func _update_upgrades_display() -> void:
  for child in active_upgrades.get_children():
    child.queue_free()
  var counts = {}
  for upgrade_id in player.upgrades:
    counts[upgrade_id] = counts.get(upgrade_id, 0) + 1
  for upgrade_id in counts.keys():
    var slot = Panel.new()
    slot.custom_minimum_size = Vector2(32, 32)
    var style = StyleBoxFlat.new()
    style.bg_color = Color(0.0, 0.04, 0.08, 0.6)
    style.border_color = Color(0.0, 1.0, 1.0, 0.3)
    style.set_border_width_all(1)
    slot.add_theme_stylebox_override("panel", style)

    var icon = TextureRect.new()
    icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
    icon.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    icon.size_flags_vertical = Control.SIZE_EXPAND_FILL
    var icon_path = "res://assets/upgrades/%s.png" % upgrade_id
    if ResourceLoader.exists(icon_path):
      icon.texture = load(icon_path)
    slot.add_child(icon)

    var stack_count = counts[upgrade_id]
    if stack_count > 1:
      var stack_label = Label.new()
      stack_label.text = "x%d" % stack_count
      stack_label.add_theme_color_override("font_color", Color(0, 0, 0))
      stack_label.add_theme_color_override("font_outline_color", Color(1, 1, 1))
      stack_label.add_theme_constant_override("outline_size", 1)
      stack_label.add_theme_font_size_override("font_size", 8)
      stack_label.position = Vector2(18, 18)
      slot.add_child(stack_label)

    active_upgrades.add_child(slot)

func _format_clock(total_seconds: float) -> String:
  var total = int(floor(total_seconds))
  var minutes = total / 60
  var seconds = total % 60
  var mm = str(minutes).pad_zeros(2)
  var ss = str(seconds).pad_zeros(2)
  return "%s:%s" % [mm, ss]
