import { RenderAtomic, WebGL } from "../../../src";

(function ()
{
    const div = document.createElement("div");
    div.innerHTML = `<div id="info">WebGL 2 Samples - draw_range_arrays</div>`;
    document.body.appendChild(div);

    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.body.innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }

    const vertexCount = 12;
    const renderAtomic: RenderAtomic = {
        attributes: {
            position: {
                array: [
                    -0.8, -0.8,
                    0.8, -0.8,
                    0.8, 0.8,
                    0.8, 0.8,
                    -0.8, 0.8,
                    -0.8, -0.8,
                    -0.5, -0.5,
                    0.5, -0.5,
                    0.5, 0.5,
                    0.5, 0.5,
                    -0.5, 0.5,
                    -0.5, -0.5,
                ], itemSize: 2
            },
        },
        uniforms: {},
        drawVertex: { drawMode: "TRIANGLE_STRIP" },
        renderParams: { cullFace: "NONE", enableBlend: true },
        pipeline: {
            vertex:
                `#version 300 es
                #define POSITION_LOCATION 0
                
                precision highp float;
                precision highp int;
        
                layout(location = POSITION_LOCATION) in vec2 position;
        
                void main()
                {
                    gl_Position = vec4(position, 0.0, 1.0);
                }`,
            fragment: `#version 300 es
            precision highp float;
            precision highp int;
    
            out vec4 color;
    
            void main()
            {
                color = vec4(1.0, 0.5, 0.0, 1.0);
            }` }
    };

    const canvasContext = { canvasId: "glcanvas" };

    function draw()
    {
        WebGL.submit({
            canvasContext,
            renderPasss: [{
                passDescriptor: {
                    colorAttachments: [{
                        clearValue: [0.0, 0.0, 0.0, 1.0],
                        loadOp: "clear",
                    }],
                },
            }]
        });

        renderAtomic.renderParams.useViewPort = true;
        renderAtomic.renderParams.viewPort = { x: 0, y: 0, width: canvas.width / 2, height: canvas.height };
        renderAtomic.drawVertex!.firstVertex = 0;
        renderAtomic.drawVertex!.vertexCount = vertexCount / 2;
        WebGL.render(canvasContext, renderAtomic);
        renderAtomic.renderParams.viewPort = { x: canvas.width / 2, y: 0, width: canvas.width / 2, height: canvas.height };
        renderAtomic.drawVertex!.firstVertex = 6;
        renderAtomic.drawVertex!.vertexCount = vertexCount / 2;
        WebGL.render(canvasContext, renderAtomic);

        requestAnimationFrame(draw);
    }
    draw();
})();
