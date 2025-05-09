import"../../modulepreload-polyfill-3cfb730f.js";import{r as l}from"../../index-1ea29437.js";import{W as h}from"../../WebGL-b4686ab5.js";import{c as p,p as f,t as w,g as m}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let d=0;C();async function C(){const e=document.querySelector("#glcanvas"),o={canvasId:"glcanvas",webGLcontextId:"webgl2"},r=new h(o),i=b(),a={texture:{size:[e.width,e.height]},sampler:{}},n={pipeline:{vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
        varying highp vec4 v_fragPosition;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
          v_fragPosition = 0.5 * (aVertexPosition + vec4(1.0, 1.0, 1.0, 1.0));
        }
      `},fragment:{code:`
        precision highp float;
        precision highp int;

        varying highp vec2 vTextureCoord;
        varying highp vec4 v_fragPosition;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          vec4 color = texture2D(uSampler, vTextureCoord) * v_fragPosition;
          gl_FragColor = color;
        }
      `},primitive:{topology:"triangle-list"},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x3",data:i.position},aTextureCoord:{format:"float32x2",data:i.textureCoord}},indices:i.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36},bindingResources:{uSampler:a}},s={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[.5,.5,.5,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[n]},{__type__:"CopyTextureToTexture",source:{texture:null},destination:{texture:a.texture},copySize:[e.width,e.height]}]}]};let t=0;function u(){let c=Date.now();c*=.001;const x=c-t;t=c;const{projectionMatrix:g,modelViewMatrix:v}=y(e,x);l(n.bindingResources).uProjectionMatrix=g,l(n.bindingResources).uModelViewMatrix=v,r.submit(s),requestAnimationFrame(u)}requestAnimationFrame(u)}function b(){const e=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],o=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(e),textureCoord:new Float32Array(o),indices:new Uint16Array(r)}}function y(e,o){const r=45*Math.PI/180,i=e.clientWidth/e.clientHeight,a=.1,n=100,s=p();f(s,r,i,a,n);const t=p();return w(t,t,[-0,0,-6]),m(t,t,d,[0,0,1]),m(t,t,d*.7,[0,1,0]),d+=o,{projectionMatrix:s,modelViewMatrix:t}}
//# sourceMappingURL=fractalCube.html-a1ffbfc1.js.map
