import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css                  */import{W as s}from"../../WebGL-lLSa4FVc.js";import{c,p as l,t as d}from"../../mat4-BHCnbM9z.js";import"../../common-C8IKy_GC.js";p();function p(){const e=document.querySelector("#glcanvas"),{projectionMatrix:t,modelViewMatrix:o}=m(e),r=new s({canvasId:"glcanvas",webGLcontextId:"webgl"}),a={descriptor:{colorAttachments:[{clearValue:[0,0,0,1],loadOp:"clear"}],depthStencilAttachment:{depthClearValue:1,depthLoadOp:"clear"}},renderPassObjects:[{pipeline:{vertex:{code:`
            attribute vec4 aVertexPosition;
        
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            void main() {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }`},fragment:{code:`
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            }`},primitive:{topology:"triangle-strip"},depthStencil:{depthCompare:"less-equal"}},vertices:{aVertexPosition:{format:"float32x2",data:new Float32Array([1,1,-1,1,1,-1,-1,-1])}},draw:{__type__:"DrawVertex",firstVertex:0,vertexCount:4},bindingResources:{uProjectionMatrix:{value:t},uModelViewMatrix:{value:o}}}]};r.submit({commandEncoders:[{passEncoders:[a]}]})}function m(e){const t=45*Math.PI/180,o=e.clientWidth/e.clientHeight,r=.1,a=100,n=c();l(n,t,o,r,a);const i=c();return d(i,i,[-0,0,-6]),{projectionMatrix:n,modelViewMatrix:i}}
//# sourceMappingURL=sample2.html-CJPo97Dk.js.map
