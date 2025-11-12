import { CanvasContext, RenderObject, RenderPass, RenderPassObject, RenderPipeline, Sampler, Texture, VertexAttributes } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';

import { snoise } from './third-party/noise3D';
import { getShaderSource, loadImage } from './utility';

(function ()
{
    const canvas = document.createElement('canvas');
    canvas.id = 'glcanvas';
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2' };
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
    const program: RenderPipeline = { vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs') } };

    const program3D: RenderPipeline = { vertex: { code: getShaderSource('vs-3d') }, fragment: { code: getShaderSource('fs-3d') } };

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
            in_texcoord: { data: texCoords, format: 'float32x2' },
            texcoord: { data: texCoords, format: 'float32x2' },
        },
    };

    const { texture3D, sampler3D } = create3DTexture();

    const imageUrl = '../../assets/img/Di-3d.png';
    loadImage(imageUrl, function (image)
    {
        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]);

        // -- Init 2D Texture
        const texture2D: Texture = {
            descriptor: {
                format: 'rgba8unorm',
                mipLevelCount: 1,
                size: [512, 512],
            },
            sources: [{
                image, flipY: false,
            }],
        };
        const sampler2D: Sampler = {
            minFilter: 'nearest',
            magFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
        };

        // -- Render
        const ro: RenderObject = {
            pipeline: program,
            bindingResources: {
                MVP: matrix,
            },
            vertices: vertexArray.vertices,
            draw: { __type__: 'DrawVertex', vertexCount: 6 },
        };

        const renderObjects: RenderPassObject[] = [];
        const rp: RenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: 'clear' }] },
            renderPassObjects: renderObjects,
        };

        renderObjects.push(
            {
                viewport: { x: viewports[Corners.LEFT].x, y: viewports[Corners.LEFT].y, width: viewports[Corners.LEFT].z, height: viewports[Corners.LEFT].w },
                ...ro,
                pipeline: program,
                bindingResources: {
                    ...ro.bindingResources,
                    diffuse: { texture: texture2D, sampler: sampler2D },
                },
            });

        // Immutable 3D texture
        renderObjects.push(
            {
                viewport: { x: viewports[Corners.RIGHT].x, y: viewports[Corners.RIGHT].y, width: viewports[Corners.RIGHT].z, height: viewports[Corners.RIGHT].w },
                ...ro,
                pipeline: program3D,
                bindingResources: {
                    ...ro.bindingResources,
                    diffuse: { texture: texture3D, sampler: sampler3D },
                },
            });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteTexture(texture2D);
        webgl.deleteTexture(texture3D);
        webgl.deleteProgram(program);
        webgl.deleteProgram(program3D);
    });

    function create3DTexture()
    {
        // Note By @kenrussel: The sample was changed from R32F to R8 for best portability.
        // not all devices can render to floating-point textures
        // (and, further, this functionality is in a WebGL extension: EXT_color_buffer_float),
        // and renderability is a requirement for generating mipmaps.

        const SIZE = 32;
        const data = new Uint8Array(SIZE * SIZE * SIZE);
        for (let k = 0; k < SIZE; ++k)
        {
            for (let j = 0; j < SIZE; ++j)
            {
                for (let i = 0; i < SIZE; ++i)
                {
                    data[i + j * SIZE + k * SIZE * SIZE] = snoise([i, j, k]) * 256;
                }
            }
        }

        const texture3D: Texture = {
            descriptor: {
                dimension: '3d',
                format: 'r8uint',
                generateMipmap: true,
                mipLevelCount: Math.log2(SIZE),
                size: [SIZE, SIZE, SIZE],
            },
            sources: [{ __type__: 'TextureDataSource', size: [SIZE, SIZE, SIZE], data }],
        };
        const sampler3D: Sampler = {
            lodMinClamp: 0,
            lodMaxClamp: Math.log2(SIZE),
            minFilter: 'linear',
            magFilter: 'linear',
            mipmapFilter: 'linear',
        };

        return { texture3D, sampler3D };
    }
})();
