import { CanvasTexture, RenderObject, Submit, Texture, TextureView } from '@feng3d/render-api';
import { BlitFramebuffer, BlitFramebufferItem } from '@feng3d/webgl';
import { WebGL } from '@feng3d/webgl';

// 创建两个重叠的三角形
function createRedTriangle(): RenderObject
{
    return {
        vertices: {
            position: {
                data: new Float32Array([
                    -0.5, -0.5, -0.5, // 左下（z=-0.5，更靠近）
                    0.5, -0.5, -0.5,  // 右下（z=-0.5，更靠近）
                    0.0, 0.5, -0.5,   // 上（z=-0.5，更靠近）
                ]),
                format: 'float32x3' as const,
            },
        },
        draw: { __type__: 'DrawVertex' as const, vertexCount: 3 },
        bindingResources: { color: { value: [1, 0, 0, 1] } }, // 红色
        pipeline: {
            vertex: {
                code: `
                    attribute vec3 position;
                    uniform vec4 color;
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
            },
            fragment: {
                code: `
                    precision mediump float;
                    uniform vec4 color;
                    void main() {
                        gl_FragColor = color;
                    }
                `,
            },
            depthStencil: { depthWriteEnabled: true, depthCompare: 'less' },
        },
    };
}

function createGreenTriangle(): RenderObject
{
    return {
        vertices: {
            position: {
                data: new Float32Array([
                    -0.3, -0.3, 0.5, // 左下（z=0.5，更远）
                    0.3, -0.3, 0.5,  // 右下（z=0.5，更远）
                    0.0, 0.3, 0.5,   // 上（z=0.5，更远）
                ]),
                format: 'float32x3' as const,
            },
        },
        draw: { __type__: 'DrawVertex' as const, vertexCount: 3 },
        bindingResources: { color: { value: [0, 1, 0, 1] } }, // 绿色
        pipeline: {
            vertex: {
                code: `
                    attribute vec3 position;
                    uniform vec4 color;
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
            },
            fragment: {
                code: `
                    precision mediump float;
                    uniform vec4 color;
                    void main() {
                        gl_FragColor = color;
                    }
                `,
            },
            depthStencil: { depthWriteEnabled: true, depthCompare: 'less' },
        },
    };
}

// 使用 webgl.readPixels 读取纹理中心点的像素颜色
function readPixelColor(webgl: WebGL, textureView: TextureView, x: number, y: number): [number, number, number, number]
{
    // 使用 webgl.readPixels 读取像素（参考 fbo_read_pixels.ts）
    const result = webgl.readPixels({
        textureView,
        origin: [x, y],
        copySize: [1, 1],
    });

    // 将结果转换为 Uint8Array 并提取 RGBA 值
    const pixel = new Uint8Array(result.buffer, result.byteOffset, 4);

    return [pixel[0], pixel[1], pixel[2], pixel[3]];
}

// 测试 1: 没有深度附件
async function testWithoutDepthAttachment()
{
    const canvas = document.getElementById('canvas-no-depth') as HTMLCanvasElement;
    const statusDiv = document.getElementById('status-no-depth') as HTMLDivElement;

    try
    {
        const webgl = new WebGL({ canvasId: 'canvas-no-depth', webGLcontextId: 'webgl2' });
        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!gl)
        {
            statusDiv.textContent = '错误: 无法获取 WebGL2 上下文';
            statusDiv.className = 'status fail';

            return;
        }

        const redTriangle = createRedTriangle();
        const greenTriangle = createGreenTriangle();

        // 创建纹理用于渲染
        const renderTexture: Texture = {
            descriptor: {
                size: [canvas.width, canvas.height],
                format: 'rgba8unorm',
            },
        };

        const textureView: TextureView = {
            texture: renderTexture,
        };

        // 提交渲染（没有深度附件，渲染到纹理视图）
        // 先绘制红色（z=-0.5，更靠近），后绘制绿色（z=0.5，更远）
        // 如果没有深度测试，后绘制的绿色会覆盖先绘制的红色
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1], view: textureView }],
                            // 注意：这里没有 depthStencilAttachment
                        },
                        renderPassObjects: [redTriangle, greenTriangle], // 先绘制红色，后绘制绿色
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待渲染完成 - 使用 requestAnimationFrame 确保 GPU 渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 将纹理内容复制到画布以便可视化
        const canvasTexture: CanvasTexture = {
            context: { canvasId: 'canvas-no-depth', webGLcontextId: 'webgl2' },
        };

        const canvasTextureView: TextureView = {
            texture: canvasTexture,
        };

        // 使用 BlitFramebuffer 将纹理内容复制到画布
        const blitFramebuffer = {
            __type__: 'BlitFramebuffer' as const,
            read: {
                colorAttachments: [{ view: textureView }],
            },
            draw: {
                colorAttachments: [{ view: canvasTextureView }],
            },
            blitFramebuffers: [
                [0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height, 'COLOR_BUFFER_BIT', 'NEAREST'] as BlitFramebufferItem,
            ],
        };

        const blitSubmit: Submit = {
            commandEncoders: [{
                passEncoders: [blitFramebuffer],
            }],
        };

        webgl.submit(blitSubmit);

        // 等待 blit 完成
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 使用 webgl.readPixels 读取纹理中心点的像素颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);

        // 添加调试信息
        console.log(`测试 1: 读取中心点 (${centerX}, ${centerY}), 纹理尺寸: ${canvas.width}x${canvas.height}`);

        const [r, g, b, a] = readPixelColor(webgl, textureView, centerX, centerY);

        console.log(`测试 2: 读取到的颜色: (${r}, ${g}, ${b}, ${a})`);

        // 验证：没有深度附件时，后绘制的绿色三角形（更远）应该覆盖先绘制的红色三角形（更靠近）
        // 中心点应该是绿色（0, 255, 0）或接近绿色
        const isGreen = g > 200 && r < 100 && b < 100;

        if (isGreen)
        {
            statusDiv.textContent = '✓ 测试通过: 后绘制的绿色三角形（更远）覆盖了先绘制的红色三角形（更靠近）（深度测试被禁用）';
            statusDiv.className = 'status pass';
        }
        else
        {
            statusDiv.textContent = `✗ 测试失败: 中心点颜色为 (${r}, ${g}, ${b}, ${a})，期望为绿色`;
            statusDiv.className = 'status fail';
        }
    }
    catch (error)
    {
        statusDiv.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
        statusDiv.className = 'status fail';
        console.error('测试 1 错误:', error);
    }
}

// 测试 2: 有深度附件
async function testWithDepthAttachment()
{
    const canvas = document.getElementById('canvas-with-depth') as HTMLCanvasElement;
    const statusDiv = document.getElementById('status-with-depth') as HTMLDivElement;

    try
    {
        const webgl = new WebGL({ canvasId: 'canvas-with-depth', webGLcontextId: 'webgl2' });
        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!gl)
        {
            statusDiv.textContent = '错误: 无法获取 WebGL2 上下文';
            statusDiv.className = 'status fail';

            return;
        }

        const redTriangle = createRedTriangle();
        const greenTriangle = createGreenTriangle();

        // 创建纹理用于渲染
        const renderTexture: Texture = {
            descriptor: {
                size: [canvas.width, canvas.height],
                format: 'rgba8unorm',
            },
        };

        const textureView: TextureView = {
            texture: renderTexture,
        };

        // 提交渲染（有深度附件，渲染到纹理视图）
        // 先绘制红色（z=-0.5，更靠近），后绘制绿色（z=0.5，更远）
        // 有深度测试时，更靠近的红色会覆盖更远的绿色
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1], view: textureView }],
                            depthStencilAttachment: { depthClearValue: 1 }, // 有深度附件
                        },
                        renderPassObjects: [redTriangle, greenTriangle], // 先绘制红色，后绘制绿色
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待渲染完成 - 使用 requestAnimationFrame 确保 GPU 渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 将纹理内容复制到画布以便可视化
        const canvasTexture: CanvasTexture = {
            context: { canvasId: 'canvas-with-depth', webGLcontextId: 'webgl2' },
        };

        const canvasTextureView: TextureView = {
            texture: canvasTexture,
        };

        // 使用 BlitFramebuffer 将纹理内容复制到画布
        const blitFramebuffer: BlitFramebuffer = {
            __type__: 'BlitFramebuffer',
            read: {
                colorAttachments: [{ view: textureView }],
            },
            draw: {
                colorAttachments: [{ view: canvasTextureView }],
            },
            blitFramebuffers: [
                [0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height, 'COLOR_BUFFER_BIT', 'NEAREST'] as BlitFramebufferItem,
            ],
        };

        const blitSubmit: Submit = {
            commandEncoders: [{
                passEncoders: [blitFramebuffer],
            }],
        };

        webgl.submit(blitSubmit);

        // 等待 blit 完成
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 使用 webgl.readPixels 读取纹理中心点的像素颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);

        // 添加调试信息
        console.log(`测试 2: 读取中心点 (${centerX}, ${centerY}), 纹理尺寸: ${canvas.width}x${canvas.height}`);

        const [r, g, b, a] = readPixelColor(webgl, textureView, centerX, centerY);

        console.log(`测试 2: 读取到的颜色: (${r}, ${g}, ${b}, ${a})`);

        // 验证：有深度附件时，更靠近的红色三角形（z=-0.5）应该覆盖更远的绿色三角形（z=0.5）
        // 中心点应该是红色（255, 0, 0）或接近红色
        const isRed = r > 200 && g < 100 && b < 100;

        if (isRed)
        {
            statusDiv.textContent = '✓ 测试通过: 更靠近的红色三角形覆盖了更远的绿色三角形（深度测试启用）';
            statusDiv.className = 'status pass';
        }
        else
        {
            statusDiv.textContent = `✗ 测试失败: 中心点颜色为 (${r}, ${g}, ${b}, ${a})，期望为红色`;
            statusDiv.className = 'status fail';
        }
    }
    catch (error)
    {
        statusDiv.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
        statusDiv.className = 'status fail';
        console.error('测试 2 错误:', error);
    }
}

// 运行测试
document.addEventListener('DOMContentLoaded', async () =>
{
    console.log('开始运行 WebGL 深度附件测试...');
    await testWithoutDepthAttachment();
    await testWithDepthAttachment();
    console.log('测试完成');
});

