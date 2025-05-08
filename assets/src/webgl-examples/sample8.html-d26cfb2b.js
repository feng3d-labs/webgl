import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{W as f}from"../../WebGL-b4686ab5.js";import{c as d,p as y,t as M,g as m,i as b,a as C}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let u=0,p=!1;V();function V(){const t=document.querySelector("#glcanvas"),e=new f({canvasId:"glcanvas",webGLcontextId:"webgl"}),r=L(),o=T(),n=w("../../Firefox.mp4"),c={pipeline:{vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
    
          // Apply lighting effect
    
          highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
          highp vec3 directionalLightColor = vec3(1, 1, 1);
          highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
    
          highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    
          highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
          vLighting = ambientLight + (directionalLightColor * directional);
        }
      `},fragment:{code:`
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
          gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        }
      `},depthStencil:{depthCompare:"less-equal"}},geometry:{primitive:{topology:"triangle-list"},vertices:{aVertexPosition:{format:"float32x3",data:r.position},aVertexNormal:{format:"float32x3",data:r.normal},aTextureCoord:{format:"float32x2",data:r.textureCoord}},indices:r.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36}},bindingResources:{uSampler:o}},s={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderObjects:[c]};let i=0;function a(l){l*=.001;const g=l-i;i=l,p&&A(o.texture,n);const{projectionMatrix:x,modelViewMatrix:v,normalMatrix:h}=N(t,g);c.bindingResources.uProjectionMatrix=x,c.bindingResources.uModelViewMatrix=v,c.bindingResources.uNormalMatrix=h,e.submit({commandEncoders:[{passEncoders:[s]}]}),requestAnimationFrame(a)}requestAnimationFrame(a)}function w(t){const e=document.createElement("video");let r=!1,o=!1;e.autoplay=!0,e.muted=!0,e.loop=!0,e.addEventListener("playing",function(){r=!0,n()},!0),e.addEventListener("timeupdate",function(){o=!0,n()},!0),e.src=t,e.play();function n(){r&&o&&(p=!0)}return e}function L(){const t=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],e=[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0],r=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],o=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(t),normal:new Float32Array(e),textureCoord:new Float32Array(r),indices:new Uint16Array(o)}}function T(){return{texture:{size:[1,1],format:"rgba8unorm",sources:[{__type__:"TextureDataSource",size:[1,1],data:new Uint8Array([0,0,255,255])}]},sampler:{addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear"}}}function A(t,e){(t.size[0]!==e.videoWidth||t.size[1]!==e.videoHeight)&&(t.size=[e.videoWidth,e.videoHeight]),t.sources=[{image:e}]}function N(t,e){const r=45*Math.PI/180,o=t.clientWidth/t.clientHeight,n=.1,c=100,s=d();y(s,r,o,n,c);const i=d();M(i,i,[-0,0,-6]),m(i,i,u,[0,0,1]),m(i,i,u*.7,[0,1,0]);const a=d();return b(a,i),C(a,a),u+=e,{projectionMatrix:s,modelViewMatrix:i,normalMatrix:a}}
//# sourceMappingURL=sample8.html-d26cfb2b.js.map
