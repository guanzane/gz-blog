// 动态面包屑：根据来源（referrer）填充文章详情页的「上一级」
//
// 匹配规则（referrer 路径 -> 上一级文字/链接）：
//   /                     -> 隐藏上一级（首页已是顶层，避免「首页 » 首页」重复）
//   /posts                -> 文章 / /posts
//   /posts/<N>            -> 文章 第N页 / /posts/N
//   /tags/<tag>           -> 标签 <tag> / /tags/<tag>
//   /tags/<tag>/<N>       -> 标签 <tag> 第N页 / /tags/<tag>/N
//   其他 / 无来源          -> 保持服务端默认值（fallback）
export function initBreadcrumb() {
    const dynamicEls = document.querySelectorAll('[data-breadcrumb-dynamic]');
    if (!dynamicEls.length) return;

    let referrerPath = '';
    try {
        const ref = document.referrer;
        if (ref) referrerPath = new URL(ref).pathname;
    } catch (e) {
        referrerPath = '';
    }

    // 根据来源路径计算「上一级」的文字与链接
    function resolveParent() {
        if (!referrerPath) return null; // 无来源，保持默认

        // 1. 标签分页：/tags/<tag>/<page>（page >= 2，需精确到页码）
        const tagPageMatch = referrerPath.match(/^\/tags\/([^/]+)\/(\d+)/);
        if (tagPageMatch) {
            const tag = decodeURIComponent(tagPageMatch[1]);
            const pageNum = tagPageMatch[2];
            return {
                label: '标签 ' + tag + ' 第' + pageNum + '页',
                href: '/tags/' + encodeURIComponent(tag) + '/' + pageNum,
            };
        }

        // 2. 标签首页：/tags/<tag>
        const tagMatch = referrerPath.match(/^\/tags\/([^/]+)/);
        if (tagMatch) {
            const tag = decodeURIComponent(tagMatch[1]);
            return { label: '标签 ' + tag, href: '/tags/' + encodeURIComponent(tag) };
        }

        // 3. 文章列表分页：/posts/<page>（page >= 2）
        const postsPageMatch = referrerPath.match(/^\/posts\/(\d+)/);
        if (postsPageMatch) {
            const pageNum = postsPageMatch[1];
            return { label: '文章 第' + pageNum + '页', href: '/posts/' + pageNum };
        }

        // 4. 文章列表第一页：/posts
        if (referrerPath === '/posts' || referrerPath === '/posts/') {
            return { label: '文章', href: '/posts' };
        }

        // 5. 首页：/（此时上一级应隐藏，因为首页已是顶层）
        if (referrerPath === '/' || referrerPath === '/index.html') {
            return { label: '首页', href: '/', hide: true };
        }

        // 其余来源保持默认
        return null;
    }

    const parent = resolveParent();

    dynamicEls.forEach((el) => {
        if (!parent) return; // 未命中，保持服务端默认 fallback

        if (parent.hide) {
            // 隐藏动态槽位本身（li 内的分隔符会随之隐藏）
            const li = el.closest('li');
            if (li) li.style.display = 'none';
        } else {
            el.setAttribute('href', parent.href);
            el.textContent = parent.label;
        }
    });
}
