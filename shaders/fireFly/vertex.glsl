
uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;
uniform float uAmpilitude;
uniform float uFrequency;
uniform float uSpeed;

attribute float aScale;


void main() {

    vec4 modelPosition = modelMatrix * vec4(position,1.0);

    modelPosition.y += sin(uTime * uSpeed + modelPosition.x * uFrequency) * aScale * uAmpilitude;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;


    gl_Position = projectionPosition;
    gl_PointSize = uPixelRatio * uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);
}