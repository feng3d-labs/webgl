import"../../modulepreload-polyfill-3cfb730f.js";import{W as l}from"../../WebGL-b4686ab5.js";import{p as m,c as p}from"../../bunny-ceb2d3cd.js";import{i as h,l as u,p as g}from"../../gl-mat4-3d6487f1.js";const e=document.createElement("canvas");e.id="glcanvas";e.width=window.innerWidth;e.height=window.innerHeight;document.body.appendChild(e);const w=new l({canvasId:"glcanvas",webGLContextAttributes:{antialias:!0}}),v=m.reduce((t,i)=>(i.forEach(n=>{t.push(n)}),t),[]),r=p.reduce((t,i)=>(i.forEach(n=>{t.push(n)}),t),[]);let c=0,s=e.clientWidth,a=e.clientHeight;const o={geometry:{vertices:{position:{data:new Float32Array(v),format:"float32x3"}},indices:new Uint16Array(r),draw:{__type__:"DrawIndexed",indexCount:r.length}},bindingResources:{model:h([])},pipeline:{vertex:{code:`precision mediump float;
        attribute vec3 position;
        uniform mat4 model, view, projection;
        void main() {
          gl_Position = projection * view * model * vec4(position, 1);
        }`},fragment:{code:`precision mediump float;
        void main() {
          gl_FragColor = vec4(1, 1, 1, 1);
        }`,targets:[{blend:{}}]},depthStencil:{}}},b={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}],depthStencilAttachment:{depthClearValue:1}},renderObjects:[o]}]}]};function d(){s=e.width=e.clientWidth,a=e.height=e.clientHeight,c++;const t=.01*c;o.bindingResources.view=u([],[30*Math.cos(t),2.5,30*Math.sin(t)],[0,2.5,0],[0,1,0]),o.bindingResources.projection=g([],Math.PI/4,s/a,.01,1e3),w.submit(b),requestAnimationFrame(d)}d();
//# sourceMappingURL=bunny.html-0b2cc07c.js.map
