/**
 * 判断指定整数是否为2的幂
 *
 * @param value 整数
 */
export function isPowerOfTwo(value: number)
{
    return (value & (value - 1)) === 0 && value !== 0;
}