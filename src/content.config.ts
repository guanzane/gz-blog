import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { postsDir } from './config/site';

// 文章集合：从 postsDir 配置的目录递归加载所有 .md 文件
const posts = defineCollection({
    loader: glob({
        base: postsDir,
        pattern: '**/*.md',
        // 保留原始文件名（含大小写）作为 id，避免 slugify 转小写导致 URL 变化
        // entry 形如 "FastAPI.md"、"测试目录/test-post.md"
        generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        description: z.string().optional(),
        author: z.string().optional(),
        tags: z.array(z.string()).default([]),
    }),
});

export const collections = { posts };
