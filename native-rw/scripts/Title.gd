extends Control

@export var main_scene_path := "res://scenes/Main.tscn"
@export var settings_scene_path := "res://scenes/Settings.tscn"

@onready var menu_items := [
  $Menu/Start,
  $Menu/Settings,
  $Menu/Quit
]

@onready var hint := $Hint

var selected_index := 0

func _ready() -> void:
  _update_menu()

func _unhandled_input(event: InputEvent) -> void:
  if event.is_action_pressed("ui_down"):
    selected_index = (selected_index + 1) % menu_items.size()
    _update_menu()
  elif event.is_action_pressed("ui_up"):
    selected_index = (selected_index - 1 + menu_items.size()) % menu_items.size()
    _update_menu()
  elif event.is_action_pressed("ui_accept"):
    _activate_selection()

func _update_menu() -> void:
  for i in range(menu_items.size()):
    var label = menu_items[i]
    if i == selected_index:
      label.add_theme_color_override("font_color", Color(1, 1, 1, 1))
      label.add_theme_font_size_override("font_size", 22)
    else:
      label.add_theme_color_override("font_color", Color(0.7, 0.8, 0.9, 1))
      label.add_theme_font_size_override("font_size", 18)

func _activate_selection() -> void:
  match selected_index:
    0:
      get_tree().change_scene_to_file(main_scene_path)
    1:
      get_tree().change_scene_to_file(settings_scene_path)
    2:
      get_tree().quit()
