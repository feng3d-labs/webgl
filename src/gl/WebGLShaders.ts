import { WebGLUniformTypeUtils } from "../const/WebGLUniformType";
import { RenderAtomic } from "../data/RenderAtomic";
import { Shader } from "../data/Shader";
import { ShaderType } from "./WebGLEnums";
import { WebGLUniform } from "./WebGLUniforms";

declare global
{
    interface WebGLRenderingContextExt
    {
        /**
         * WebGLShader处理器
         */
        _shaders: WebGLShaders;
    }
}

/**
 * WebGLShader处理器
 */
export class WebGLShaders
{
    private gl: WebGLRenderingContext;

    private compileShaderResults: { [key: string]: CompileShaderResult } = {};

    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._shaders = this;
    }

    activeShader(renderAtomic: RenderAtomic)
    {
        const { gl } = this;

        const shader = renderAtomic.shader;
        const shaderResult = this.activeShaderProgram(shader);
        if (!shaderResult)
        {
            throw new Error(`缺少着色器，无法渲染!`);
        }
        //
        gl.useProgram(shaderResult.program);

        return shaderResult;
    }

    /**
     * 激活渲染程序
     */
    activeShaderProgram(shader: Shader)
    {
        const { vertex, fragment } = shader;

        const shaderKey = `${vertex}/n-------------shader-------------/n${fragment}`;
        let result = this.compileShaderResults[shaderKey];
        if (result) return result;

        // 渲染程序
        try
        {
            result = this.compileShaderResults[shaderKey] = this.compileShaderProgram(vertex, fragment);
        }
        catch (error)
        {
            console.error(`着色器 编译失败！\n${error}`);

            return null;
        }

        return result;
    }

    /**
     * 编译着色器代码
     * @param type 着色器类型
     * @param code 着色器代码
     * @return 编译后的着色器对象
     */
    private compileShaderCode(type: ShaderType, code: string)
    {
        const { gl } = this;

        const shader = gl.createShader(gl[type]);

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

    private createLinkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader)
    {
        const { gl } = this;

        // 创建程序对象
        const program = gl.createProgram();

        // 添加着色器
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

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

    private compileShaderProgram(vshader: string, fshader: string): CompileShaderResult
    {
        const { gl } = this;

        // 创建着色器程序
        // 编译顶点着色器
        const vertexShader = this.compileShaderCode("VERTEX_SHADER", vshader);

        // 编译片段着色器
        const fragmentShader = this.compileShaderCode("FRAGMENT_SHADER", fshader);

        // 创建着色器程序
        const shaderProgram = this.createLinkProgram(vertexShader, fragmentShader);

        // 获取属性信息
        const numAttributes = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
        const attributes: { [name: string]: AttributeInfo } = {};
        let i = 0;
        while (i < numAttributes)
        {
            const activeInfo = gl.getActiveAttrib(shaderProgram, i++);
            const location = gl.getAttribLocation(shaderProgram, activeInfo.name);
            attributes[activeInfo.name] = { activeInfo, location };
        }
        // 获取uniform信息
        const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
        const uniforms: { [name: string]: WebGLUniform } = {};
        i = 0;
        let textureID = 0;
        while (i < numUniforms)
        {
            const activeInfo = gl.getActiveUniform(shaderProgram, i++);
            const reg = /(\w+)/g;

            let name = activeInfo.name;
            const names = [name];
            if (activeInfo.size > 1)
            {
                console.assert(name.substr(-3, 3) === "[0]");
                const baseName = name.substring(0, name.length - 3);
                for (let j = 1; j < activeInfo.size; j++)
                {
                    names[j] = `${baseName}[${j}]`;
                }
            }

            for (let j = 0; j < names.length; j++)
            {
                name = names[j];
                let result: RegExpExecArray = reg.exec(name);
                const paths: string[] = [];
                while (result)
                {
                    paths.push(result[1]);
                    result = reg.exec(name);
                }
                const location = gl.getUniformLocation(shaderProgram, name);
                const type = WebGLUniformTypeUtils.getType(activeInfo.type);
                const isTexture = WebGLUniformTypeUtils.isTexture(type);
                uniforms[name] = { activeInfo, location, type, paths, textureID };

                if (isTexture)
                {
                    textureID++;
                }
            }
        }

        return { program: shaderProgram, vertex: vertexShader, fragment: fragmentShader, attributes, uniforms };
    }
}

export interface CompileShaderResult
{
    program: WebGLProgram, vertex: WebGLShader, fragment: WebGLShader
    /**
     * 属性信息列表
     */
    attributes: { [name: string]: AttributeInfo };
    /**
     * uniform信息列表
     */
    uniforms: { [name: string]: WebGLUniform };
}

export interface AttributeInfo
{
    /**
     * WebGL激活信息。
     */
    activeInfo: WebGLActiveInfo;

    /**
     * 属性地址
     */
    location: number;
}
