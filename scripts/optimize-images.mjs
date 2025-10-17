import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_DIR = path.resolve('src/assets/images/original');
const OUTPUT_DIR = path.resolve('src/assets/images/webp');
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const WEBP_EXTENSION = '.webp';
const QUALITY = 80;

async function walkDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const files = await Promise.all(
        entries.map(async entry => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return walkDirectory(fullPath);
            }
            return fullPath;
        })
    );

    return files.flat();
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

function getBaseKey(sourcePath) {
    const relative = path.relative(SOURCE_DIR, sourcePath);
    const parsed = path.parse(relative);
    const segments = [];
    if (parsed.dir && parsed.dir !== '.') {
        segments.push(parsed.dir);
    }
    segments.push(parsed.name);
    return segments.join('/');
}

async function needsOptimization(sourcePath, targetPath) {
    try {
        const [sourceStat, targetStat] = await Promise.all([
            fs.stat(sourcePath),
            fs.stat(targetPath),
        ]);
        return sourceStat.mtimeMs > targetStat.mtimeMs;
    } catch (error) {
        return true;
    }
}

async function convertToWebp(sourcePath) {
    const parsed = path.parse(sourcePath);
    if (!SUPPORTED_EXTENSIONS.has(parsed.ext.toLowerCase())) {
        return { converted: false, key: null };
    }

    const relativeDir = path.relative(SOURCE_DIR, parsed.dir);
    const targetDir = relativeDir && relativeDir !== '.'
        ? path.join(OUTPUT_DIR, relativeDir)
        : OUTPUT_DIR;
    const targetPath = path.join(targetDir, `${parsed.name}${WEBP_EXTENSION}`);

    await ensureDir(path.dirname(targetPath));

    if (!(await needsOptimization(sourcePath, targetPath))) {
        return { converted: false, key: getBaseKey(sourcePath) };
    }

    await sharp(sourcePath)
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(targetPath);

    return { converted: true, key: getBaseKey(sourcePath) };
}

async function removeStaleWebpFiles(validKeys) {
    const files = await walkDirectory(OUTPUT_DIR);
    let removedCount = 0;

    await Promise.all(
        files.map(async file => {
            if (path.extname(file).toLowerCase() !== WEBP_EXTENSION) {
                return;
            }

            const relative = path.relative(OUTPUT_DIR, file);
            const key = relative
                .slice(0, -WEBP_EXTENSION.length)
                .replace(/\\/g, '/');

            if (!validKeys.has(key)) {
                await fs.unlink(file);
                removedCount += 1;
            }
        })
    );

    return removedCount;
}

async function main() {
    await Promise.all([ensureDir(SOURCE_DIR), ensureDir(OUTPUT_DIR)]);

    const sourceFiles = await walkDirectory(SOURCE_DIR);
    const validKeys = new Set();
    let optimizedCount = 0;

    await Promise.all(
        sourceFiles.map(async file => {
            try {
                const { converted, key } = await convertToWebp(file);
                if (key) {
                    validKeys.add(key);
                }
                if (converted) {
                    optimizedCount += 1;
                }
            } catch (error) {
                console.error(`Failed to optimize "${file}":`, error);
            }
        })
    );

    const removedCount = await removeStaleWebpFiles(validKeys);

    if (optimizedCount > 0) {
        console.log(`Optimized ${optimizedCount} image(s) to WebP.`);
    } else {
        console.log('No images required optimization.');
    }

    if (removedCount > 0) {
        console.log(`Removed ${removedCount} stale WebP image(s).`);
    }
}

main().catch(error => {
    console.error('Image optimization failed:', error);
    process.exitCode = 1;
});
