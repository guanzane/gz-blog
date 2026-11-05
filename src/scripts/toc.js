// 文章目录（TOC）生成逻辑
// 扫描正文 .content 中的 h2 / h3 标题，生成树状目录并挂载到 [data-toc]
// 支持点击跳转 + 滚动高亮当前章节
export function initToc() {
    const tocRoot = document.querySelector('[data-toc]');
    if (!tocRoot) return;

    // 折叠 / 展开交互
    const wrap = tocRoot.closest('.toc-wrap');
    const toggle = document.querySelector('[data-toc-toggle]');
    const close = document.querySelector('[data-toc-close]');
    if (wrap && toggle) {
        toggle.addEventListener('click', () => wrap.classList.add('open'));
    }
    if (wrap && close) {
        close.addEventListener('click', () => wrap.classList.remove('open'));
    }

    const content = document.querySelector('.content');
    if (!content) return;

    // 只取 h2、h3（最多到三级标题）
    const headings = content.querySelectorAll('h2, h3');
    if (!headings.length) {
        // 没有可展示的标题，隐藏整个目录容器
        const wrap = tocRoot.closest('.toc-wrap');
        if (wrap) wrap.style.display = 'none';
        return;
    }

    // 构建目录项
    headings.forEach((heading) => {
        const level = heading.tagName.toLowerCase(); // h2 或 h3
        const text = heading.textContent.trim();

        // 若标题缺少 id，则根据文本生成一个并回填到标题上
        let id = heading.getAttribute('id');
        if (!id) {
            id = text.toLowerCase().replace(/\s+/g, '-');
            heading.setAttribute('id', id);
        }

        const link = document.createElement('a');
        link.href = '#' + id;
        link.textContent = text;
        link.classList.add('toc-h' + level.slice(1));
        link.dataset.tocTarget = id;

        // 点击跳转（平滑滚动）
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', '#' + id);
            }
        });

        tocRoot.appendChild(link);
    });

    // 滚动高亮：监听滚动，高亮当前可见章节
    const links = Array.from(tocRoot.querySelectorAll('a'));
    if (!links.length) return;

    const headingEls = Array.from(headings);
    let ticking = false;

    function highlight() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        let currentId = headingEls[0] ? headingEls[0].getAttribute('id') : null;

        for (let i = 0; i < headingEls.length; i++) {
            const el = headingEls[i];
            // 标题顶部距离视口顶部 100px 以内视为当前章节
            if (el.getBoundingClientRect().top <= 100) {
                currentId = el.getAttribute('id');
            } else {
                break;
            }
        }

        links.forEach((link) => {
            if (link.dataset.tocTarget === currentId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(highlight);
            ticking = true;
        }
    });

    // 初始高亮
    highlight();
}
