import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{r as d}from"../../index-1ea29437.js";import{W as x}from"../../WebGL-b4686ab5.js";import{c as m,p as v,t as g,g as l}from"../../mat4-90bd9af0.js";import"../../common-d8a29b8a.js";let s=0;w();function w(){const n=document.querySelector("#glcanvas"),a=new x({canvasId:"glcanvas",webGLcontextId:"webgl"}),t=b(),r={pipeline:{primitive:{topology:"triangle-list"},vertex:{code:`
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying lowp vec4 vColor;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vColor = aVertexColor;
        }
      `},fragment:{code:`
        varying lowp vec4 vColor;
    
        void main(void) {
          gl_FragColor = vColor;
        }
      `},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x3",data:t.position},aVertexColor:{format:"float32x4",data:t.color}},indices:t.indices,draw:{__type__:"DrawIndexed",firstIndex:0,indexCount:36},bindingResources:{}},i={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[r]};let o=0;function c(e){e*=.001;const p=e-o;o=e;const{projectionMatrix:u,modelViewMatrix:f}=M(n,p);d(r.bindingResources).uProjectionMatrix=u,d(r.bindingResources).uModelViewMatrix=f,a.submit({commandEncoders:[{passEncoders:[i]}]}),requestAnimationFrame(c)}requestAnimationFrame(c)}function b(){const n=[-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1],a=[[1,1,1,1],[1,0,0,1],[0,1,0,1],[0,0,1,1],[1,1,0,1],[1,0,1,1]];let t=[];for(let i=0;i<a.length;++i){const o=a[i];t=t.concat(o,o,o,o)}const r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];return{position:new Float32Array(n),color:new Float32Array(t),indices:new Uint16Array(r)}}function M(n,a){const t=45*Math.PI/180,r=n.clientWidth/n.clientHeight,i=.1,o=100,c=m();v(c,t,r,i,o);const e=m();return g(e,e,[-0,0,-6]),l(e,e,s,[0,0,1]),l(e,e,s*.7,[0,1,0]),l(e,e,s*.3,[1,0,0]),s+=a,{projectionMatrix:c,modelViewMatrix:e}}
//# sourceMappingURL=sample5.html-b2ef2714.js.map
