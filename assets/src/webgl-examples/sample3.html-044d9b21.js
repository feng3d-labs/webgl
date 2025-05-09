import"../../modulepreload-polyfill-3cfb730f.js";/* empty css                  */import{W as l}from"../../WebGL-b4686ab5.js";import{c,p as s,t as d}from"../../mat4-c54c6fc0.js";import"../../common-d8a29b8a.js";p();function p(){const e=document.querySelector("#glcanvas"),{projectionMatrix:t,modelViewMatrix:o}=m(e),r=new l({canvasId:"glcanvas",webGLcontextId:"webgl"}),a={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[{pipeline:{vertex:{code:`
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
        `},primitive:{topology:"triangle-strip"},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x2",data:new Float32Array([1,1,-1,1,1,-1,-1,-1])},aVertexColor:{format:"float32x4",data:new Float32Array([1,1,1,1,1,0,0,1,0,1,0,1,0,0,1,1])}},draw:{__type__:"DrawVertex",firstVertex:0,vertexCount:4},bindingResources:{uProjectionMatrix:t,uModelViewMatrix:o}}]};r.submit({commandEncoders:[{passEncoders:[a]}]})}function m(e){const t=45*Math.PI/180,o=e.clientWidth/e.clientHeight,r=.1,a=100,n=c();s(n,t,o,r,a);const i=c();return d(i,i,[-0,0,-6]),{projectionMatrix:n,modelViewMatrix:i}}
//# sourceMappingURL=sample3.html-044d9b21.js.map
