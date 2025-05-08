import"../../modulepreload-polyfill-3cfb730f.js";import{W as f}from"../../WebGL-b4686ab5.js";import{l as x,p as y}from"../../gl-mat4-3d6487f1.js";(async()=>{const t=document.createElement("canvas");t.id="glcanvas",t.width=window.innerWidth,t.height=window.innerHeight,document.body.appendChild(t);const m=new f({canvasId:"glcanvas"}),p=[[-.5,.5,.5],[.5,.5,.5],[.5,-.5,.5],[-.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,-.5],[.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5],[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]],v=[[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1],[0,0],[1,0],[1,1],[0,1]],l=[[2,1,0],[2,0,3],[6,5,4],[6,4,7],[10,9,8],[10,8,11],[14,13,12],[14,12,15],[18,17,16],[18,16,19],[20,21,22],[23,20,22]],h=p.reduce((e,n)=>(n.forEach(o=>{e.push(o)}),e),[]),g=v.reduce((e,n)=>(n.forEach(o=>{e.push(o)}),e),[]),s=l.reduce((e,n)=>(n.forEach(o=>{e.push(o)}),e),[]);let c=0,a=1,d=1;const r={geometry:{vertices:{position:{data:new Float32Array(h),format:"float32x3"},uv:{data:new Float32Array(g),format:"float32x2"}},indices:new Uint16Array(s),draw:{__type__:"DrawIndexed",indexCount:s.length}},bindingResources:{},pipeline:{vertex:{code:`precision mediump float;
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUv;
        uniform mat4 projection, view;
        void main() {
          vUv = uv;
          gl_Position = projection * view * vec4(position, 1);
        }`},fragment:{code:`precision mediump float;
        varying vec2 vUv;
        uniform sampler2D tex;
        void main () {
          gl_FragColor = texture2D(tex,vUv);
        }`,targets:[{blend:{}}]},depthStencil:{depthWriteEnabled:!0}}},w={commandEncoders:[{passEncoders:[{renderObjects:[r]}]}]};function u(){c++,a=t.width=t.clientWidth,d=t.height=t.clientHeight;const e=.01*c;r.bindingResources.view=x([],[5*Math.cos(e),2.5*Math.sin(e),5*Math.sin(e)],[0,0,0],[0,1,0]),r.bindingResources.projection=y([],Math.PI/4,a/d,.01,10),m.submit(w),requestAnimationFrame(u)}const i=new Image;i.src="../../assets/peppers.png",await i.decode();const b={texture:{size:[i.width,i.height],sources:[{image:i}]},sampler:{minFilter:"linear"}};r.bindingResources.tex=b,u()})();
//# sourceMappingURL=cube.html-9beabedc.js.map
