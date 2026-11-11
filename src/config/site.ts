// ============================================================
// 站点全局配置
// 所有可配置内容集中在此文件，页面组件从这里读取，避免写死。
// ============================================================

// ---------- 文章根目录 ----------
// 博客文章（.md）存放的根目录，相对于项目根目录。
// 支持子目录：posts/ 下的任意层级子目录中的 .md 都会被视为文章。
export const postsDir = './posts';

// ---------- 每页文章数量 ----------
export const pageSize = 10;

// ---------- 关于页：个人介绍 ----------
export const about = {
    name: 'Guanzz',
    desc: '02后。呋喃人。双鱼座。现流窜于长三角一带。互联网技术爱好者。资深冲浪员。啥都会一点但也只会那一点的半桶水。热爱游戏。老书虫。电影迷。吉他新手。胡思乱想星人。死宅。2.5次元。',
    // 顶部 hero 背景图（放在 public/ 下，以 / 开头的绝对路径）
    avatar: '/avatar.webp',
};

// ---------- 关于页：联系方式 ----------
// type: wechat | email | github
// value：微信填微信号（点击复制）、邮箱填地址（点击唤起邮件）、GitHub 填主页链接（点击跳转）
export const contacts = [
    { type: 'wechat', label: '微信', value: 'ownshuny' },
    { type: 'email', label: '邮箱', value: 'ownshuny@163.com' },
    { type: 'github', label: 'GitHub', value: 'https://github.com/GvanL' },
] as const;
