import { RenderObject, Submit } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';

// 创建两个重叠的三角形
function createRedTriangle(): RenderObject
{
    return {
        vertices: {
            position: {
                data: new Float32Array([
                    -0.5, -0.5, 0.5, // 左下
                    0.5, -0.5, 0.5,  // 右下
                    0.0, 0.5, 0.5,   // 上
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
                    -0.3, -0.3, -0.5, // 左下
                    0.3, -0.3, -0.5,  // 右下
                    0.0, 0.3, -0.5,   // 上
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

// 读取画布中心点的像素颜色
function readPixelColor(gl: WebGL2RenderingContext, x: number, y: number): [number, number, number, number]
{
    // 绑定默认 framebuffer（画布）
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // 读取像素（注意：WebGL 的坐标系是左下角为原点，需要翻转 y 坐标）
    const pixel = new Uint8Array(4);
    gl.readPixels(x, gl.drawingBufferHeight - y - 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
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

        // 提交渲染（没有深度附件，直接渲染到画布）
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1] }], // 不指定 view，直接渲染到画布
                            // 注意：这里没有 depthStencilAttachment
                        },
                        renderPassObjects: [redTriangle, greenTriangle], // 先绘制红色，后绘制绿色
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待一帧，确保渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 读取画布中心点的像素颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const [r, g, b, a] = readPixelColor(gl, centerX, centerY);

        // 验证：没有深度附件时，后绘制的绿色三角形应该覆盖先绘制的红色三角形
        // 中心点应该是绿色（0, 255, 0）或接近绿色
        const isGreen = g > 200 && r < 100 && b < 100;

        if (isGreen)
        {
            statusDiv.textContent = '✓ 测试通过: 后绘制的绿色三角形覆盖了红色三角形（深度测试被禁用）';
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

        // 提交渲染（有深度附件，直接渲染到画布）
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1] }], // 不指定 view，直接渲染到画布
                            depthStencilAttachment: { depthClearValue: 1 }, // 有深度附件
                        },
                        renderPassObjects: [redTriangle, greenTriangle], // 先绘制红色，后绘制绿色
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待一帧，确保渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 读取画布中心点的像素颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const [r, g, b, a] = readPixelColor(gl, centerX, centerY);

        // 验证：有深度附件时，前面的绿色三角形（z=-0.5）应该覆盖后面的红色三角形（z=0.5）
        // 中心点应该是绿色（0, 255, 0）或接近绿色
        const isGreen = g > 200 && r < 100 && b < 100;

        if (isGreen)
        {
            statusDiv.textContent = '✓ 测试通过: 前面的绿色三角形覆盖了后面的红色三角形（深度测试启用）';
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

