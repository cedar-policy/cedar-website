import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const rootDir = path.join(__dirname, '../');
const blogDir = path.join(rootDir, 'src/routes/blog');
const routesFile = path.join(rootDir, 'src/routes/blogRoutes.json');
const entriesFile = path.join(rootDir, 'src/routes/blogEntries.tsx');

const slugRegex = /^[a-z0-9-]+$/;

const args = process.argv.slice(2);
const slug = args[0];

if (!slug || !slugRegex.test(slug)) {
    console.error('Invalid slug. Slug must be lowercase letters and dashes, and cannot start with a dash.');
    console.log('Usage: bb createBlog -- [slug] ');
    console.log('Where the slug must be a valid url path segment (use numbers, lowercase letters, and dashes)');
    process.exit(1);
}

const slugDir = path.join(blogDir, slug);

(async() => {
    try {
        await fs.access(slugDir);
        console.error(`Folder for slug "${slug}" already exists.`);
        process.exit(1);
    } catch (err: unknown) {
        if (!isErrnoException(err) || (isErrnoException(err) && err.code !== 'ENOENT')) {
            console.error('Unexpected error condition while ensuring new directory doesnt exist', err);
            process.exit(1);
        }
    }

    await fs.mkdir(slugDir);

    const contentsFile = path.join(slugDir, 'content.md');
    const indexFile = path.join(slugDir, 'index.tsx');

    const title = await getInputFromStdin('Enter title: ');
    const summary = await getInputFromStdin('Enter summary: ');

    // Markdown file:
    await fs.writeFile(contentsFile, `# New blog for ${slug}`);
    // react component file:
    await fs.writeFile(indexFile, getBlogPostComponentFileContents(slug));

    // add the route to the json routes file
    const routesData = await fs.readFile(routesFile, 'utf8');
    const routes = JSON.parse(routesData) as Array<{route: string, title: string, summary: string}>;
    const newRoute = { route: `/blog/${slug}`, title, summary };
    routes.unshift(newRoute);
    await fs.writeFile(routesFile, JSON.stringify(routes, null, 2));

    // add the lazy import to bogEntries.tsx
    const entryContent = `export const BlogEntry_${slugToPascalCase(slug)} = {\n    slug: '${slug}',\n    lazyImport: React.lazy(() => import('./blog/${slug}')),\n};\n`;
    await fs.appendFile(entriesFile, entryContent);

    console.log(`Blog entry created successfully at ${slugDir}`);
    console.log('Next steps:');
    console.log(` - Paste the markdown blog content into  ${slugDir}/content.md`);
    console.log(' - Copy any images to static/img');
    console.log(' - Make sure your markdown references images with a url like so: /img/my-image-name.png');
})();

function getInputFromStdin(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (input) => {
            rl.close();
            resolve(input);
        });
    });
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
    return err instanceof Error && 'code' in err && typeof (err as NodeJS.ErrnoException).code === 'string';
}

function getBlogPostComponentFileContents(slug: string) {
    return `
import React from 'react';
import BlogPost from '../BlogPost';
import content from './content.md';

export default function ${slugToPascalCase(slug)}() {
    return <BlogPost content={content} />;
}`;
}

function slugToPascalCase(slug: string) {
    return slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join('');
}
