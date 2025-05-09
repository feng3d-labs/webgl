import"../../modulepreload-polyfill-3cfb730f.js";import{r as c}from"../../index-1ea29437.js";import{W as a}from"../../WebGL-b4686ab5.js";const s=async o=>{const t=window.devicePixelRatio||1;o.width=o.clientWidth*t,o.height=o.clientHeight*t;const r=new a({canvasId:"glcanvas",webGLcontextId:"webgl"}),i={pipeline:{vertex:{code:`
                attribute vec4 position;

                void main() {
                    gl_Position = position;
                }
                `},fragment:{code:`
                precision highp float;
                uniform vec4 color;
                void main() {
                    gl_FragColor = color;
                }
                `}},vertices:{position:{data:new Float32Array([0,.5,-.5,-.5,.5,-.5]),format:"float32x2"}},indices:new Uint16Array([0,1,2]),draw:{__type__:"DrawIndexed",indexCount:3},bindingResources:{color:[1,0,0,1]}},l={commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}]},renderPassObjects:[i]}]}]};function n(){r.submit(l),requestAnimationFrame(n)}n(),window.onclick=()=>{c(i.pipeline.vertex).code=`
                attribute vec4 position;

                void main() {
                    vec4 pos = position;
                pos.x = pos.x + 0.5;
                    gl_Position = pos;
                }
                `,c(i.pipeline.fragment).code=`
                precision highp float;
                uniform vec4 color;
                void main() {
                    vec4 col = color;
                    col.x = 0.5;
                    col.y = 0.6;
                    col.z = 0.7;
                    gl_FragColor = col;
                }
                `}};let e=document.querySelector("#glcanvas");e||(e=document.createElement("canvas"),e.id="webgpu",e.style.width="400px",e.style.height="300px",document.body.appendChild(e));s(e);
//# sourceMappingURL=RenderObjectChanges.html-759c6b7a.js.map
