import { RenderPassObject, OcclusionQuery, RenderPass } from "@feng3d/render-api";

import "../data/polyfills/OcclusionQuery";

export function getGLRenderOcclusionQuery(gl: WebGLRenderingContext, renderObjects?: readonly RenderPassObject[])
{
    if (!renderObjects) return defautRenderOcclusionQuery;
    if (!(gl instanceof WebGL2RenderingContext)) return defautRenderOcclusionQuery;
    let renderOcclusionQuery: GLRenderOcclusionQuery = renderObjects["_GLRenderOcclusionQuery"];
    if (renderOcclusionQuery) return renderOcclusionQuery;

    const occlusionQueryObjects: OcclusionQuery[] = renderObjects.filter((cv) => cv.__type__ === "OcclusionQuery") as any;
    if (occlusionQueryObjects.length === 0)
    {
        renderObjects["_GLRenderOcclusionQuery"] = defautRenderOcclusionQuery;

        return defautRenderOcclusionQuery;
    }

    /**
     * 初始化。
     */
    const init = () =>
    {
        occlusionQueryObjects.forEach((v, i) =>
        {
            v._step = getGLOcclusionQueryStep(gl, v);
        });
    };

    /**
     * 查询结果。
     */
    const resolve = (renderPass: RenderPass) =>
    {
        const results = occlusionQueryObjects.map((v) => v._step.resolve());

        Promise.all(results).then((v) =>
        {
            renderPass.onOcclusionQuery(occlusionQueryObjects, v);
        });
    };

    renderObjects["_GLRenderOcclusionQuery"] = renderOcclusionQuery = { init, resolve };

    return renderOcclusionQuery;
}

interface GLRenderOcclusionQuery
{
    init: () => void
    resolve: (renderPass: RenderPass) => void
}

const defautRenderOcclusionQuery = { init: () => { }, resolve: () => { } };

export function getGLOcclusionQueryStep(gl: WebGL2RenderingContext, occlusionQuery: OcclusionQuery)
{
    const query: { result?: number } = {};
    let webGLQuery: WebGLQuery;

    // 开始查询
    const begin = () =>
    {
        webGLQuery = gl.createQuery();

        gl.beginQuery(gl.ANY_SAMPLES_PASSED, webGLQuery);
    };

    const end = () =>
    {
        // 结束查询
        gl.endQuery(gl.ANY_SAMPLES_PASSED);
    };

    /**
     * 获取查询结果。
     */
    const resolve = async () =>
    {
        if (query.result !== undefined) return query.result;

        if (gl instanceof WebGL2RenderingContext)
        {
            const result: number = await new Promise((resolve, reject) =>
            {
                (function tick()
                {
                    if (!gl.getQueryParameter(webGLQuery, gl.QUERY_RESULT_AVAILABLE))
                    {
                        // A query's result is never available in the same frame
                        // the query was issued.  Try in the next frame.
                        requestAnimationFrame(tick);

                        return;
                    }

                    const result = query.result = gl.getQueryParameter(webGLQuery, gl.QUERY_RESULT) as number;

                    occlusionQuery.onQuery(result);

                    resolve(result);

                    gl.deleteQuery(webGLQuery);
                })();
            });

            return result;
        }

        return undefined;
    };

    return { begin, end, resolve } as GLOcclusionQueryStep;
}

/**
 * 不被遮挡查询步骤。
 */
export interface GLOcclusionQueryStep
{
    /**
     * 开始查询
     */
    begin: () => void;

    /**
     * 结束查询
     */
    end: () => void;

    /**
     * 获取查询结果，将获取被赋值新结果的遮挡查询对象。
     */
    resolve: () => Promise<number>
}