const { Plugin } = require('obsidian');

class WrongAnswerPlugin extends Plugin {
    async onload() {
        this.registerMarkdownCodeBlockProcessor('wrong-card', async (source, el, ctx) => {
            el.addClass('wrong-card-wrapper');

            const data = this.parseFields(source);

            const frontSrc = await this.resolveImage(data.front, ctx.sourcePath);
            const backSrc = await this.resolveImage(data.back, ctx.sourcePath);

            el.innerHTML = `
                <div class="wrong-card-row">
                    <div class="wrong-card">
                        <div class="wrong-card-inner">
                            <div class="wrong-card-front">
                                <div class="wrong-card-hint">👆 显示答案</div>
                                ${frontSrc ? `<img class="wrong-card-img" src="${frontSrc}" alt="题目">` : '<div style="padding:2em;text-align:center;color:var(--text-muted)">请填写 front 路径</div>'}
                            </div>
                            <div class="wrong-card-back">
                                <div class="wrong-card-hint">👆 返回题目</div>
                                ${backSrc ? `<img class="wrong-card-img" src="${backSrc}" alt="答案">` : '<div style="padding:2em;text-align:center;color:var(--text-muted)">请填写 back 路径</div>'}
                            </div>
                        </div>
                    </div>
                    <div class="wrong-card-side">
                        <div class="wrong-card-side-front">💡 点击翻到背面查看解析</div>
                        <div class="wrong-card-side-back">${this.escapeHtml(data.note) || ''}</div>
                    </div>
                </div>
            `;

            const row = el.querySelector('.wrong-card-row');
            if (row) {
                row.addEventListener('click', () => {
                    row.classList.toggle('flipped');
                });
            }
        });

        this.addRibbonIcon('square-pen', '插入错题卡片', () => {
            this.insertTemplate();
        });

        this.addCommand({
            id: 'insert-wrong-card',
            name: '插入错题卡片',
            editorCallback: (editor) => {
                const template = '```wrong-card\nfront: \nback: \nnote: \n```';
                editor.replaceSelection(template);
            },
        });
    }

    parseFields(source) {
        const data = { front: '', back: '', note: '' };
        const lines = source.split('\n');
        for (const line of lines) {
            const m = line.match(/^(\w+):\s*(.*)/);
            if (m) {
                const k = m[1].trim();
                const v = m[2].trim();
                if (k in data && v) data[k] = v;
            }
        }
        return data;
    }

    /**
     * 定位图片文件并转为 base64 data URL
     * 支持两种写法：
     *   ![[易错题-2.png]]     → 用 metadataCache 全 vault 查找
     *   11、课程学习/.../xxx.png  → 用 getFileByPath 直接定位
     */
    async resolveImage(raw, sourcePath) {
        if (!raw) return '';

        try {
            let file = null;

            // 情况 1：wiki-link 格式 ![[filename.png]]
            const wikiMatch = raw.match(/!?\[\[(.+?)\]\]/);
            if (wikiMatch) {
                const linkText = wikiMatch[1].trim();
                file = this.app.metadataCache.getFirstLinkpathDest(linkText, sourcePath);
            }

            // 情况 2：直接路径格式
            if (!file) {
                const cleanPath = raw.trim().replace(/^!\[\[\s*/, '').replace(/\s*\]\]$/, '');
                if (cleanPath) {
                    file = this.app.vault.getFileByPath(cleanPath);
                }
            }

            if (!file) return '';

            // 读文件二进制，转 base64
            const arrayBuf = await this.app.vault.readBinary(file);
            const base64 = this.arrayBufferToBase64(arrayBuf);
            const mime = file.extension === 'png' ? 'image/png'
                      : file.extension === 'jpg' || file.extension === 'jpeg' ? 'image/jpeg'
                      : file.extension === 'gif' ? 'image/gif'
                      : file.extension === 'webp' ? 'image/webp'
                      : 'image/png';
            return `data:${mime};base64,${base64}`;
        } catch {
            return '';
        }
    }

    arrayBufferToBase64(buf) {
        let binary = '';
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    insertTemplate() {
        const { MarkdownView } = require('obsidian');
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            view.editor.replaceSelection('```wrong-card\nfront: \nback: \nnote: \n```');
        } else {
            const { Notice } = require('obsidian');
            new Notice('请先打开一个 Markdown 笔记');
        }
    }
}

module.exports = WrongAnswerPlugin;
