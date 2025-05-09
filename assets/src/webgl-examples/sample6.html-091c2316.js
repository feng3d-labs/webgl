import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{r as u}from"../../index-ac627bb5.js";import{W as h}from"../../WebGL-b4686ab5.js";import{c as l,p as v,t as w,g as m}from"../../mat4-c54c6fc0.js";import"../../common-d8a29b8a.js";let d=0;M();async function M(){const t=document.querySelector("#glcanvas"),e=new h({canvasId:"glcanvas",webGLcontextId:"webgl"}),r=b(),n=await C("../../cubetexture.png"),i={pipeline:{primitive:{topology:"triangle-list"},vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
        }
      `},fragment:{code:`
        varying highp vec2 vTextureCoord;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
      `},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x3",data:r.position},aTextureCoord:{format:"float32x2",data:r.textureCoord}},indices:r.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36},bindingResources:{uSampler:n}},s={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[i]};let a=0;function o(c){c*=.001;const x=c-a;a=c;const{projectionMatrix:g,modelViewMatrix:f}=V(t,x);u(i.bindingResources).uProjectionMatrix=g,u(i.bindingResources).uModelViewMatrix=f,e.submit({commandEncoders:[{passEncoders:[s]}]}),requestAnimationFrame(o)}requestAnimationFrame(o)}function b(){const t=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],e=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(t),textureCoord:new Float32Array(e),indices:new Uint16Array(r)}}async function C(t){const e=new Image;e.src=t,await e.decode();const r=p(e.width)&&p(e.height),n={size:[e.width,e.height],format:"rgba8unorm",sources:[{image:e}],generateMipmap:r};let i={};return r&&(i={addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",minFilter:"linear"}),{texture:n,sampler:i}}function p(t){return(t&t-1)===0}function V(t,e){const r=45*Math.PI/180,n=t.clientWidth/t.clientHeight,i=.1,s=100,a=l();v(a,r,n,i,s);const o=l();return w(o,o,[-0,0,-6]),m(o,o,d,[0,0,1]),m(o,o,d*.7,[0,1,0]),d+=e,{projectionMatrix:a,modelViewMatrix:o}}
//# sourceMappingURL=sample6.html-091c2316.js.map
