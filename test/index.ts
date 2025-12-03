/**
 * WebGL 测试套件入口
 *
 * 管理所有测试页面，显示测试状态和结果
 */

interface TestInfo
{
    name: string;
    description: string;
    htmlFile: string;
    status: 'pending' | 'pass' | 'fail';
    error?: string;
    testName?: string; // 用于匹配 postMessage 中的 testName
    iframe?: HTMLIFrameElement;
}

// 定义所有测试
const tests: TestInfo[] = [
    {
        name: '深度附件和画布颜色读取测试',
        description: '测试深度附件的正确性以及从画布读取像素颜色的功能。包含两个测试用例：没有深度附件时深度测试被禁用，有深度附件时深度测试启用。',
        htmlFile: 'depth-attachment-canvas-readpixels.html',
        testName: 'depth-attachment-canvas-readpixels',
        status: 'pending',
    },
];

// 更新统计信息
function updateSummary()
{
    const total = tests.length;
    const pass = tests.filter(t => t.status === 'pass').length;
    const fail = tests.filter(t => t.status === 'fail').length;
    const pending = tests.filter(t => t.status === 'pending').length;

    const statTotal = document.getElementById('stat-total');
    const statPass = document.getElementById('stat-pass');
    const statFail = document.getElementById('stat-fail');
    const statPending = document.getElementById('stat-pending');

    if (statTotal) statTotal.textContent = total.toString();
    if (statPass) statPass.textContent = pass.toString();
    if (statFail) statFail.textContent = fail.toString();
    if (statPending) statPending.textContent = pending.toString();
}

// 渲染测试列表
function renderTestList()
{
    const testList = document.getElementById('test-list');
    if (!testList) return;

    testList.innerHTML = '';

    tests.forEach((test, index) =>
    {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';

        const statusClass = test.status;
        const statusText = test.status === 'pending' ? '待测试' : test.status === 'pass' ? '通过' : '失败';

        testItem.innerHTML = `
            <div class="test-header">
                <div class="test-title">${test.name}</div>
                <div class="test-status ${statusClass}">${statusText}</div>
            </div>
            <div class="test-description">${test.description}</div>
            <div class="test-actions">
                <button class="btn btn-primary" onclick="openTest(${index})">打开测试</button>
                ${test.status === 'fail' && test.error ? `<button class="btn btn-secondary" onclick="showError(${index})">查看错误</button>` : ''}
            </div>
        `;

        testList.appendChild(testItem);
    });

    updateSummary();
}

// 打开测试页面
function openTest(index: number)
{
    const test = tests[index];
    if (test)
    {
        window.open(test.htmlFile, '_blank');
    }
}

// 显示错误信息
function showError(index: number)
{
    const test = tests[index];
    if (test && test.error)
    {
        alert(`测试失败: ${test.error}`);
    }
}

// 运行单个测试
function runTest(index: number)
{
    const test = tests[index];
    if (!test) return;

    // 创建隐藏的 iframe 来运行测试
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.src = test.htmlFile;
    test.iframe = iframe;

    document.body.appendChild(iframe);

    // 设置超时，如果 10 秒内没有收到结果，标记为失败
    const timeout = setTimeout(() =>
    {
        if (test.status === 'pending')
        {
            test.status = 'fail';
            test.error = '测试超时（10秒内未完成）';
            renderTestList();
        }
    }, 10000);

    // 监听 iframe 发送的消息
    const messageHandler = (event: MessageEvent) =>
    {
        if (event.data && event.data.type === 'test-result' && event.data.testName === test.testName)
        {
            clearTimeout(timeout);
            window.removeEventListener('message', messageHandler);

            test.status = event.data.passed ? 'pass' : 'fail';
            if (!event.data.passed)
            {
                test.error = event.data.message;
            }

            // 移除 iframe
            if (iframe.parentNode)
            {
                iframe.parentNode.removeChild(iframe);
            }

            renderTestList();
        }
    };

    window.addEventListener('message', messageHandler);
}

// 运行所有测试
function runAllTests()
{
    console.log('开始自动运行所有测试...');
    for (let i = 0; i < tests.length; i++)
    {
        // 延迟运行，避免同时创建太多 iframe
        setTimeout(() => runTest(i), i * 500);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () =>
{
    console.log('WebGL 测试套件初始化...');
    renderTestList();
    // 自动运行所有测试
    runAllTests();
});

// 将函数暴露到全局作用域，以便 HTML 中的 onclick 可以调用
(window as any).openTest = openTest;
(window as any).showError = showError;

