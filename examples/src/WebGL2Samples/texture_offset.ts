import { CanvasContext, RenderPass, RenderPassObject, RenderPipeline, Sampler, Texture, VertexAttributes } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';
import { getShaderSource, loadImage } from './utility';

(function ()
{
    const canvas = document.createElement('canvas');
    canvas.id = 'glcanvas';
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2', webGLContextAttributes: { antialias: false } };
    const webgl = new WebGL(rc);

    const Corners = {
        LEFT: 0,
        RIGHT: 1,
        MAX: 2,
    };

    const viewports: { x: number, y: number, z: number, w: number }[] = new Array(Corners.MAX);

    viewports[Corners.LEFT] = {
        x: 0,
        y: canvas.height / 4,
        z: canvas.width / 2,
        w: canvas.height / 2,
    };

    viewports[Corners.RIGHT] = {
        x: canvas.width / 2,
        y: canvas.height / 4,
        z: canvas.width / 2,
        w: canvas.height / 2,
    };

    // -- Init program
    const programBicubic: RenderPipeline = { vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs-bicubic') } };

    const programOffsetBicubic: RenderPipeline = {
        vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs-offset-bicubic') },
    };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0,
    ]);

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
    ]);

    // -- Init VertexArray
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: positions, format: 'float32x2' },
            texcoord: { data: texCoords, format: 'float32x2' },
        },
    };

    loadImage('../../assets/img/Di-3d.png', function (image)
    {
        // -- Init Texture
        const texture: Texture = {
            descriptor: {
                size: [image.width, image.height],
                format: 'rgba8unorm',
            },
            sources: [{ mipLevel: 0, image, flipY: false }],
        };
        const sampler: Sampler = {
            minFilter: 'nearest',
            magFilter: 'nearest',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
        };

        const renderObjects: RenderPassObject[] = [];
        // -- Render
        const rp: RenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: 'clear' }] },
            renderPassObjects: renderObjects,
        };

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]);

        // No offset
        renderObjects.push(
            {
                viewport: { x: viewports[Corners.RIGHT].x, y: viewports[Corners.RIGHT].y, width: viewports[Corners.RIGHT].z, height: viewports[Corners.RIGHT].w },
                pipeline: programBicubic,
                bindingResources: {
                    MVP: matrix,
                    diffuse: { texture, sampler },
                },
                vertices: vertexArray.vertices,
                draw: { __type__: 'DrawVertex', vertexCount: 6 },
            });

        // Offset
        const offset = new Int32Array([100, -80]);

        renderObjects.push(
            {
                viewport: { x: viewports[Corners.LEFT].x, y: viewports[Corners.LEFT].y, width: viewports[Corners.LEFT].z, height: viewports[Corners.LEFT].w },
                pipeline: programOffsetBicubic,
                bindingResources: {
                    MVP: matrix,
                    diffuse: { texture, sampler },
                    offset,
                },
                vertices: vertexArray.vertices,
                draw: { __type__: 'DrawVertex', vertexCount: 6 },
            });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteTexture(texture);
        webgl.deleteProgram(programOffsetBicubic);
        webgl.deleteProgram(programBicubic);
    });
})();
