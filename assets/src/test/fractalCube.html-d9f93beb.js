import"../../modulepreload-polyfill-3cfb730f.js";import{W as v}from"../../WebGL-b4686ab5.js";import{c as l,p as h,t as f,g as p}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let d=0;w();async function w(){const e=document.querySelector("#glcanvas"),o={canvasId:"glcanvas",webGLcontextId:"webgl2"},r=new v(o),i=C(),a={texture:{size:[e.width,e.height]},sampler:{}},n={pipeline:{vertex:{code:`
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
      `},depthStencil:{depthCompare:"less-equal"}},geometry:{primitive:{topology:"triangle-list"},vertices:{aVertexPosition:{format:"float32x3",data:i.position},aTextureCoord:{format:"float32x2",data:i.textureCoord}},indices:i.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36}},bindingResources:{uSampler:a}},c={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[.5,.5,.5,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderObjects:[n]},{__type__:"CopyTextureToTexture",source:{texture:null},destination:{texture:a.texture},copySize:[e.width,e.height]}]}]};let t=0;function u(){let s=Date.now();s*=.001;const x=s-t;t=s;const{projectionMatrix:m,modelViewMatrix:g}=b(e,x);n.bindingResources.uProjectionMatrix=m,n.bindingResources.uModelViewMatrix=g,r.submit(c),requestAnimationFrame(u)}requestAnimationFrame(u)}function C(){const e=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],o=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(e),textureCoord:new Float32Array(o),indices:new Uint16Array(r)}}function b(e,o){const r=45*Math.PI/180,i=e.clientWidth/e.clientHeight,a=.1,n=100,c=l();h(c,r,i,a,n);const t=l();return f(t,t,[-0,0,-6]),p(t,t,d,[0,0,1]),p(t,t,d*.7,[0,1,0]),d+=o,{projectionMatrix:c,modelViewMatrix:t}}
//# sourceMappingURL=fractalCube.html-d9f93beb.js.map
