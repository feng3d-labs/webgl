import { $set } from "@feng3d/serialization";
import { IRenderObject, ITexture, WebGL } from "../../../src";

(function ()
{
    const div = document.createElement("div");
    div.innerHTML = `    <div id="info">WebGL 2 Samples - fbo_blit</div>
    <p id="description">
        This samples demonstrates blitting on frame buffer objects.
    </p>`;
    document.body.appendChild(div);

    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl2", { antialias: false });
    const isWebGL2 = !!gl;
    if (!isWebGL2)
    {
        document.body.innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

        return;
    }
    loadImage("../../assets/img/Di-3d.png", (img) =>
    {
        const diffuse: ITexture = {
            sources: [{ source: img }],
            sampler: {
                minFilter: "LINEAR",
            }
        };

        const renderAtomic: IRenderObject = {
            vertices: {
                position: {
                    buffer: {
                        data: [
                            -1.0, -1.0,
                            1.0, -1.0,
                            1.0, 1.0,
                            1.0, 1.0,
                            -1.0, 1.0,
                            -1.0, -1.0
                        ]
                    }, numComponents: 2
                },
                texcoord: {
                    buffer: {
                        data: [
                            0.0, 1.0,
                            1.0, 1.0,
                            1.0, 0.0,
                            1.0, 0.0,
                            0.0, 0.0,
                            0.0, 1.0
                        ]
                    }, numComponents: 2
                },
            },
            uniforms: {
                MVP: [
                    0.8, 0.0, 0.0, 0.0,
                    0.0, 0.8, 0.0, 0.0,
                    0.0, 0.0, 0.8, 0.0,
                    0.0, 0.0, 0.0, 1.0
                ],
                diffuse,
            },
            drawVertex: { instanceCount: 2 },
            pipeline: {
                primitive: { topology: "TRIANGLE_STRIP", cullMode: "NONE" },
                vertex: {
                    code: `#version 300 es
                #define POSITION_LOCATION 0
                #define TEXCOORD_LOCATION 4
                
                precision highp float;
                precision highp int;
        
                uniform mat4 MVP;
        
                layout(location = POSITION_LOCATION) in vec2 position;
                layout(location = TEXCOORD_LOCATION) in vec2 texcoord;
        
                out vec2 v_st;
        
                void main()
                {
                    v_st = texcoord;
                    gl_Position = MVP * vec4(position, 0.0, 1.0);
                }` },
                fragment: {
                    code: `#version 300 es
            precision highp float;
            precision highp int;
    
            uniform sampler2D diffuse;
    
            in vec2 v_st;
    
            out vec4 color;
    
            void main()
            {
                color = texture(diffuse, v_st);
            }`,
                    targets: [{ blend: {} }]
                },
            }
        };

        function draw()
        {
            WebGL.renderPass(
                { canvasId: "glcanvas" },
                {
                    passDescriptor: {
                        colorAttachments: [{
                            clearValue: [0.0, 0.0, 0.0, 1.0],
                            loadOp: "clear",
                        }],
                    },
                    renderObjects: [renderAtomic]
                }
            );

            requestAnimationFrame(draw);
        }
        draw();
    });

    function loadImage(url: string, onload: (img: HTMLImageElement) => void)
    {
        const img = new Image();
        img.src = url;
        img.onload = function ()
        {
            onload(img);
        };

        return img;
    }
})();
