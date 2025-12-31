extends Node

@export var master_volume_db := -8.0

@onready var shot_player := $Shot
@onready var hit_player := $Hit
@onready var damage_player := $Damage

var shot_playback: AudioStreamGeneratorPlayback
var hit_playback: AudioStreamGeneratorPlayback
var damage_playback: AudioStreamGeneratorPlayback

func _ready() -> void:
  _setup_player(shot_player)
  _setup_player(hit_player)
  _setup_player(damage_player)

func _setup_player(player: AudioStreamPlayer) -> void:
  var generator = AudioStreamGenerator.new()
  generator.mix_rate = 44100
  generator.buffer_length = 0.2
  player.stream = generator
  player.volume_db = master_volume_db
  player.play()
  var playback = player.get_stream_playback()
  if player == shot_player:
    shot_playback = playback
  elif player == hit_player:
    hit_playback = playback
  else:
    damage_playback = playback

func play_shot() -> void:
  _write_tone(shot_playback, 0.06, 720.0, 0.15, 0.4)

func play_hit() -> void:
  _write_noise(hit_playback, 0.08, 0.2, 0.6)

func play_damage() -> void:
  _write_tone(damage_playback, 0.12, 160.0, 0.2, 0.5)

func _write_tone(playback: AudioStreamGeneratorPlayback, duration: float, frequency: float, attack: float, decay: float) -> void:
  if playback == null:
    return
  var mix_rate = 44100.0
  var frames = int(duration * mix_rate)
  for i in range(frames):
    var t = float(i) / mix_rate
    var env = _envelope(t, duration, attack, decay)
    var sample = sin(t * TAU * frequency) * env
    playback.push_frame(Vector2(sample, sample))

func _write_noise(playback: AudioStreamGeneratorPlayback, duration: float, attack: float, decay: float) -> void:
  if playback == null:
    return
  var mix_rate = 44100.0
  var frames = int(duration * mix_rate)
  for i in range(frames):
    var t = float(i) / mix_rate
    var env = _envelope(t, duration, attack, decay)
    var sample = (randf() * 2.0 - 1.0) * env
    playback.push_frame(Vector2(sample, sample))

func _envelope(t: float, duration: float, attack: float, decay: float) -> float:
  var attack_time = duration * attack
  var decay_time = duration * decay
  if t < attack_time:
    return t / max(attack_time, 0.0001)
  var remaining = duration - attack_time
  if remaining <= 0.0:
    return 0.0
  var decay_t = clamp((t - attack_time) / max(decay_time, 0.0001), 0.0, 1.0)
  return 1.0 - decay_t
