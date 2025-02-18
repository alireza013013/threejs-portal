uniform float uTime;
uniform vec3 uStartColor;
uniform vec3 uEndColor;

varying vec2 vUv;

#include ../includes/perlinClassic3D.glsl

void main() {
    
    // displayed uv
    vec2 displayedUv = vUv + perlinClassic3D(vec3(vUv* 5.0 , uTime * 0.2));


    // perlin noise
    float strength = perlinClassic3D(vec3(displayedUv* 5.0 , uTime * 0.1));


    //outer glow
    float outerGlow = distance(vUv, vec2(0.5)) * 5.0 - 1.4;
    strength += outerGlow;

    //Apply Step
    strength += step(-0.2, strength) * 0.8;

    strength = clamp(strength,0.0,1.0);

    // color
    vec3 color = mix(uStartColor, uEndColor, strength);

    gl_FragColor = vec4(color, 1.0);
}