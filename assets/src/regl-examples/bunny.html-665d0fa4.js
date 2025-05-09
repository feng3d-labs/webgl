import"../../modulepreload-polyfill-3cfb730f.js";import{W as m}from"../../WebGL-b4686ab5.js";import{p,c as h}from"../../bunny-ceb2d3cd.js";import{i as u,l as w,p as g}from"../../gl-mat4-3d6487f1.js";import{r}from"../../index-1ea29437.js";const e=document.createElement("canvas");e.id="glcanvas";e.width=window.innerWidth;e.height=window.innerHeight;document.body.appendChild(e);const v=new m({canvasId:"glcanvas",webGLContextAttributes:{antialias:!0}}),b=p.reduce((t,i)=>(i.forEach(n=>{t.push(n)}),t),[]),s=h.reduce((t,i)=>(i.forEach(n=>{t.push(n)}),t),[]);let a=0,c=e.clientWidth,d=e.clientHeight;const o={vertices:{position:{data:new Float32Array(b),format:"float32x3"}},indices:new Uint16Array(s),draw:{__type__:"DrawIndexed",indexCount:s.length},bindingResources:{model:u([])},pipeline:{vertex:{code:`precision mediump float;
        attribute vec3 position;
        uniform mat4 model, view, projection;
        void main() {
          gl_Position = projection * view * model * vec4(position, 1);
        }`},fragment:{code:`precision mediump float;
        void main() {
          gl_FragColor = vec4(1, 1, 1, 1);
        }`,targets:[{blend:{}}]},depthStencil:{}}},f={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}],depthStencilAttachment:{depthClearValue:1}},renderPassObjects:[o]}]}]};function l(){c=e.width=e.clientWidth,d=e.height=e.clientHeight,a++;const t=.01*a;r(o.bindingResources).view=w([],[30*Math.cos(t),2.5,30*Math.sin(t)],[0,2.5,0],[0,1,0]),r(o.bindingResources).projection=g([],Math.PI/4,c/d,.01,1e3),v.submit(f),requestAnimationFrame(l)}l();
//# sourceMappingURL=bunny.html-665d0fa4.js.map
