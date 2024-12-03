/**
 * 查询操作。
 *
 * 仅 WebGL2 支持。
 */
export interface IGLQueryAction
{
    /**
     * 开始查询或者结束查询。
     */
    action: "beginQuery" | "endQuery";

    /**
     * 查询内容。
     */
    target: "ANY_SAMPLES_PASSED" | "ANY_SAMPLES_PASSED_CONSERVATIVE" | "TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN";

    /**
     * 查询uid。
     *
     * 通过该对象获取查询结果。
     */
    query: IGLQuery;
}

/**
 * 查询对象。
 *
 * 一次查询周期。
 *
 * 仅 WebGL2 支持。
 */
export interface IGLQuery
{
    /**
     * 当前状态。
     *
     * "beginQuery" 表示已开始查询。
     * "endQuery" 表示已结束查询。
     * ""
     */
    state?: "beginQuery" | "endQuery";

    /**
     * 查询内容。
     *
     * 开始查询时被赋值。
     */
    target?: "ANY_SAMPLES_PASSED" | "ANY_SAMPLES_PASSED_CONSERVATIVE" | "TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN";

    /**
     * 查询结果。
     */
    result?: number;
}