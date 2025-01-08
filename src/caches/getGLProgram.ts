import { IRenderPipeline } from "@feng3d/render-api";
import { getWebGLUniformType, IGLUniformBufferType, isWebGLUniformTextureType } from "../const/IGLUniformType";
import { IGLAttributeInfo } from "../data/IGLAttributeInfo";
import { IGLTransformFeedbackPipeline, IGLTransformFeedbackVaryings } from "../data/IGLTransformFeedbackPass";
import { IGLUniformInfo, IUniformItemInfo } from "../data/IGLUniformInfo";
import { getIGLAttributeType } from "./getIGLAttributeType";

declare global
{
    interface WebGLRenderingContext
    {
        _programs: { [key: string]: WebGLProgram }
        _shaders: { [key: string]: WebGLShader }
    }

    export interface WebGLProgram
    {
        vertex: string;
        fragment: string;
        /**
         * 属性信息列表
         */
        attributes: IGLAttributeInfo[];
        /**
         * uniform信息列表
         */
        uniforms: IGLUniformInfo[];

        /**
         * 统一变量块信息列表。
         *
         * 仅 WebGL2 中存在。
         */
        uniformBlocks: IUniformBlockInfo[];
    }
}

/**
 * 激活渲染程序
 */
export function getGLProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline | IGLTransformFeedbackPipeline)
{
    const shaderKey = getKey(pipeline);
    let result = gl._programs[shaderKey];
    if (result) return result;

    const vertex = pipeline.vertex.code;
    const fragment = (pipeline as IRenderPipeline).fragment?.code || `#version 300 es
        precision highp float;
        precision highp int;

        void main()
        {
        }
    `;
    const transformFeedbackVaryings = (pipeline as IGLTransformFeedbackPipeline).transformFeedbackVaryings;

    result = getWebGLProgram(gl, vertex, fragment, transformFeedbackVaryings);
    gl._programs[shaderKey] = result;

    return result;
}

export function deleteProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
{
    const shaderKey = getKey(pipeline);
    const result = gl._programs[shaderKey];
    if (result)
    {
        delete gl._programs[shaderKey];
        gl.deleteProgram(result);
    }
}

function getKey(pipeline: IRenderPipeline | IGLTransformFeedbackPipeline)
{
    const vertex = pipeline.vertex.code;
    const fragment = (pipeline as IRenderPipeline).fragment?.code;
    const transformFeedbackVaryings = (pipeline as IGLTransformFeedbackPipeline).transformFeedbackVaryings;

    return `---vertexShader---\n${vertex}\n---fragment---\n${fragment}\n---feedback---${transformFeedbackVaryings?.varyings.toString()} ${transformFeedbackVaryings?.bufferMode}`;
}

function getWebGLProgram(gl: WebGLRenderingContext, vshader: string, fshader: string, transformFeedbackVaryings: IGLTransformFeedbackVaryings)
{
    // 编译顶点着色器
    const vertexShader = getWebGLShader(gl, "VERTEX_SHADER", vshader);

    // 编译片段着色器
    const fragmentShader = getWebGLShader(gl, "FRAGMENT_SHADER", fshader);

    // 创建着色器程序
    const program = createLinkProgram(gl, vertexShader, fragmentShader, transformFeedbackVaryings);

    // 获取属性信息
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    const attributes: IGLAttributeInfo[] = [];
    for (let i = 0; i < numAttributes; i++)
    {
        const activeInfo = gl.getActiveAttrib(program, i);
        const { name, size, type } = activeInfo;
        const location = gl.getAttribLocation(program, name);
        const typeString = getIGLAttributeType(type as any);
        attributes.push({ name, size, type: typeString, location });
    }
    // 获取uniform信息
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const uniforms: IGLUniformInfo[] = [];
    let textureID = 0;
    for (let i = 0; i < numUniforms; i++)
    {
        const activeInfo = gl.getActiveUniform(program, i);
        const { name, size, type } = activeInfo;
        const typeString = getWebGLUniformType(type);
        const isTexture = isWebGLUniformTextureType(typeString);

        const reg = /(\w+)/g;

        const names = [name];
        if (size > 1)
        {
            console.assert(name.substring(name.length - 3) === "[0]");
            const baseName = name.substring(0, name.length - 3);
            for (let j = 1; j < size; j++)
            {
                names[j] = `${baseName}[${j}]`;
            }
        }

        const items: IUniformItemInfo[] = [];
        for (let j = 0; j < names.length; j++)
        {
            const name = names[j];
            let result: RegExpExecArray = reg.exec(name);
            const paths: string[] = [];
            while (result)
            {
                paths.push(result[1]);
                result = reg.exec(name);
            }
            const location = gl.getUniformLocation(program, name);

            if (isTexture)
            {
                items.push({ location, paths, textureID });
                textureID++;
            }
            else
            {
                items.push({ location, paths, textureID: -1 });
            }
        }
        uniforms[i] = { name, type: typeString, isTexture, items };
    }
    if (gl instanceof WebGL2RenderingContext)
    {
        const numUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
        const uniformBlockActiveInfos = new Array(numUniformBlocks).fill(0).map((v, i) =>
        {
            //
            gl.uniformBlockBinding(program, i, i);
            // 获取包含的统一变量列表。
            const uniformIndices: Uint32Array = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
            const uniformList: IGLUniformInfo[] = [];
            for (let i = 0; i < uniformIndices.length; i++)
            {
                const unifrom = uniforms[uniformIndices[i]];
                unifrom.inBlock = true;
                uniformList.push(unifrom);
            }
            const name = gl.getActiveUniformBlockName(program, i);
            //
            const info: IUniformBlockInfo = {
                name,
                index: i,
                dataSize: gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_DATA_SIZE),
                uniforms: uniformList,
                bufferBindingInfo: undefined,
            };

            //
            info.bufferBindingInfo = getBufferBindingInfo(info);

            return info;
        });
        program.uniformBlocks = uniformBlockActiveInfos;
    }

    //
    program.vertex = vshader;
    program.fragment = fshader;
    program.attributes = attributes;
    program.uniforms = uniforms;

    return program;
}

/**
 * 统一变量块信息。
 */
export interface IUniformBlockInfo
{
    /**
     * 名称。
     */
    name: string;

    /**
     * 绑定位置。
     */
    index: number;

    /**
     * 数据尺寸。
     */
    dataSize: number;

    /**
     * 包含的统一变量列表。
     */
    uniforms: IGLUniformInfo[];

    /**
     * 缓冲区绑定信息。
     */
    bufferBindingInfo: IBufferBindingInfo;
}

/**
 * 编译着色器代码
 *
 * @param type 着色器类型
 * @param code 着色器代码
 * @return 编译后的着色器对象
 */
function getWebGLShader(gl: WebGLRenderingContext, type: ShaderType, code: string)
{
    let shader = gl._shaders[code];
    if (shader) return shader;

    shader = gl.createShader(gl[type]);
    gl._shaders[code] = shader;

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    // 检查编译结果
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled)
    {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw `Failed to compile shader: ${error}`;
    }

    return shader;
}

function createLinkProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, transformFeedbackVaryings: IGLTransformFeedbackVaryings)
{
    // 创建程序对象
    const program = gl.createProgram();

    // 添加着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    if (transformFeedbackVaryings)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.transformFeedbackVaryings(program, transformFeedbackVaryings.varyings, gl[transformFeedbackVaryings.bufferMode]);
        }
        else
        {
            console.error(`WebGL1 不支持 transformFeedbackVaryings 功能！`);
        }
    }

    // 链接程序
    gl.linkProgram(program);

    // 检查结果
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked)
    {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        throw `Failed to link program: ${error}`;
    }

    return program;
}

/**
 * Shader type.
 *
 * Either a gl.FRAGMENT_SHADER or a gl.VERTEX_SHADER.
 */
export type ShaderType = "FRAGMENT_SHADER" | "VERTEX_SHADER";

/**
 * 缓冲区绑定信息。
 */
export interface IBufferBindingInfo
{
    size: number;
    items: {
        paths: string[];
        offset: number;
        size: number;
        Cls: Float32ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor;
    }[]
}

function getBufferBindingInfo(uniformBlock: IUniformBlockInfo): IBufferBindingInfo
{
    const size = uniformBlock.dataSize;
    //
    let currentSize = 0;
    let structName: string;

    const items: { paths: string[], offset: number, size: number, Cls: Float32ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor }[] = [];
    uniformBlock.uniforms.forEach((uniformInfo) =>
    {
        const uniformBufferType = uniformInfo.type as IGLUniformBufferType;
        const alignSize = uniformBufferTypeAlignSizeMap[uniformBufferType];
        console.assert(alignSize, `没有找到 ${uniformBufferType} 统一缓冲类型对应的对齐与尺寸。`);

        //
        const currentstructName = uniformInfo.name.substring(0, uniformInfo.name.lastIndexOf("."));
        if (structName !== currentstructName)
        {
            currentSize = roundUp(16, currentSize); // 结构体之间对齐
            structName = currentstructName;
        }

        //
        uniformInfo.items.forEach((itemInfo) =>
        {
            currentSize = roundUp(alignSize.align, currentSize); // 结构体成员对齐
            const itemInfoOffset = currentSize;
            const itemInfoSize = alignSize.size;
            //
            currentSize += alignSize.size;
            const Cls = alignSize.clsType;
            //
            const paths = itemInfo.paths.slice(1);
            //
            items.push({ paths, offset: itemInfoOffset, size: itemInfoSize, Cls: Cls });
        });
    });
    currentSize = roundUp(16, currentSize); // 整个统一块数据对齐

    console.assert(size === currentSize, `uniformBlock映射尺寸出现错误( ${size}  ${currentSize} )！`);

    const bufferBindingInfo: IBufferBindingInfo = {
        size: uniformBlock.dataSize,
        items,
    };

    return bufferBindingInfo;
}

function roundUp(k: number, n: number): number
{
    return Math.ceil(n / k) * k;
}

/**
 * 
 * @see https://github.com/brendan-duncan/wgsl_reflect/blob/main/src/wgsl_reflect.ts#L1206
 * @see https://www.orillusion.com/zh/wgsl.html#memory-layouts
 */
const uniformBufferTypeAlignSizeMap: {
    [key: string]: {
        align: number,
        size: number,
        clsType: Float32ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor,
    }
} = {
    "FLOAT": { align: 4, size: 4, clsType: Float32Array },
    "FLOAT_VEC2": { align: 8, size: 8, clsType: Float32Array },
    "FLOAT_VEC3": { align: 16, size: 12, clsType: Float32Array },
    "FLOAT_VEC4": { align: 16, size: 16, clsType: Float32Array },
    "INT": { align: 4, size: 4, clsType: Int32Array },
    "INT_VEC2": { align: 8, size: 8, clsType: Int32Array },
    "INT_VEC3": { align: 16, size: 12, clsType: Int32Array },
    "INT_VEC4": { align: 16, size: 16, clsType: Int32Array },
    "BOOL": { align: 4, size: 4, clsType: Int32Array },
    "BOOL_VEC2": { align: 8, size: 8, clsType: Int32Array },
    "BOOL_VEC3": { align: 16, size: 12, clsType: Int32Array },
    "BOOL_VEC4": { align: 16, size: 16, clsType: Int32Array },
    "FLOAT_MAT2": { align: 8, size: 16, clsType: Float32Array },
    "FLOAT_MAT3": { align: 16, size: 48, clsType: Float32Array },
    "FLOAT_MAT4": { align: 16, size: 64, clsType: Float32Array },
    "UNSIGNED_INT": { align: 4, size: 4, clsType: Uint32Array },
    "UNSIGNED_INT_VEC2": { align: 8, size: 8, clsType: Uint32Array },
    "UNSIGNED_INT_VEC3": { align: 16, size: 12, clsType: Uint32Array },
    "UNSIGNED_INT_VEC4": { align: 16, size: 16, clsType: Uint32Array },
    "FLOAT_MAT2x3": { align: 16, size: 32, clsType: Float32Array },
    "FLOAT_MAT2x4": { align: 16, size: 32, clsType: Float32Array },
    "FLOAT_MAT3x2": { align: 8, size: 24, clsType: Float32Array },
    "FLOAT_MAT3x4": { align: 16, size: 48, clsType: Float32Array },
    "FLOAT_MAT4x2": { align: 8, size: 32, clsType: Float32Array },
    "FLOAT_MAT4x3": { align: 16, size: 64, clsType: Float32Array },
};