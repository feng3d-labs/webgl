import"../../modulepreload-polyfill-B5Qt9EMX.js";import{W as i}from"../../WebGL-lLSa4FVc.js";const e=document.createElement("canvas");e.id="glcanvas";e.width=window.innerWidth;e.height=window.innerHeight;document.body.appendChild(e);const n=new i({canvasId:"glcanvas"}),o={vertices:{position:{data:new Float32Array([-1,0,0,-1,1,1]),format:"float32x2"}},draw:{__type__:"DrawVertex",vertexCount:3},bindingResources:{color:{value:[1,0,0,1]}},pipeline:{vertex:{code:`
                    precision mediump float;
                    attribute vec2 position;
                    void main () {
                      gl_Position = vec4(position, 0, 1);
                    }
            `},fragment:{code:`
            precision mediump float;
            uniform vec4 color;
            void main () {
              gl_FragColor = color;
            }
            `,targets:[{blend:{}}]},depthStencil:{}}};function t(){e.width=e.clientWidth,e.height=e.clientHeight,n.submit({commandEncoders:[{passEncoders:[{descriptor:{colorAttachments:[{clearValue:[0,0,0,1]}],depthStencilAttachment:{depthClearValue:1}},renderPassObjects:[o]}]}]}),requestAnimationFrame(t)}t();
//# sourceMappingURL=basic.html-qWCl-WT5.js.map
