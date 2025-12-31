shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
uniform float scanline_intensity : hint_range(0.0, 1.0) = 0.45;

void fragment() {
  vec4 base = texture(screen_texture, SCREEN_UV);
  float scan = sin(SCREEN_UV.y * 900.0) * 0.5 + 0.5;
  float darken = mix(1.0, 0.75, scanline_intensity);
  base.rgb *= mix(1.0, darken, scan);
  COLOR = base;
}
