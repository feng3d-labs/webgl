import { watcher } from "@feng3d/watcher";
import { deleteWebGLQuery, getWebGLQuery } from "../caches/getWebGLQuery";
import { _GL_Submit_Times } from "../const/const";
import { IGLOcclusionQuery, IGLQuery } from "../data/IGLOcclusionQuery";
import { runRenderObject } from "./runRenderObject";

export function runOcclusionQuery(gl: WebGLRenderingContext, occlusionQuery: IGLOcclusionQuery)
{
    const query: IGLQuery = {} as any;
    let webGLQuery: WebGLQuery;

    // 开始查询
    if (gl instanceof WebGL2RenderingContext)
    {
        webGLQuery = getWebGLQuery(gl, query);

        gl.beginQuery(gl.ANY_SAMPLES_PASSED, webGLQuery);
    }

    // 正常渲染对象列表
    occlusionQuery.renderObjects.forEach((renderObject) =>
    {
        runRenderObject(gl, renderObject);
    });

    // 结束查询
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.endQuery(gl.ANY_SAMPLES_PASSED);

        // 获取查询结果
        const _getQueryResult = async () =>
        {
            watcher.unwatch(gl, _GL_Submit_Times as any, _getQueryResult);

            // 
            (function tick()
            {
                if (!gl.getQueryParameter(webGLQuery, gl.QUERY_RESULT_AVAILABLE))
                {
                    // A query's result is never available in the same frame
                    // the query was issued.  Try in the next frame.
                    requestAnimationFrame(tick);

                    return;
                }

                query.result = gl.getQueryParameter(webGLQuery, gl.QUERY_RESULT);

                occlusionQuery.result = query;

                deleteWebGLQuery(gl, query);
            })();
        };

        // 监听此次提交结束
        watcher.watch(gl, _GL_Submit_Times as any, _getQueryResult);
    }

}