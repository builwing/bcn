// composables/useMarkdown.ts
import MarkdownIt from 'markdown-it';
// import emoji from 'markdown-it-emoji';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import container from 'markdown-it-container';
import highlightjs from 'markdown-it-highlightjs';

export function useMarkdown() {
    const md = new MarkdownIt({
        html: true,        // HTMLタグを有効化
        breaks: true,      // 改行を有効化
        linkify: true,     // URLを自動的にリンクに変換
        typographer: true, // 言語に依存しない置換と引用符を有効化
    });

    // プラグインの追加
    // md.use(emoji)
    //     .use(sub)
    //     .use(sup)
    //     .use(footnote)
    //     .use(deflist)
    //     .use(abbr)
    //     .use(container)
    //     .use(highlightjs);

    // XSS対策のためのサニタイズ関数
    const sanitizeHtml = (html: string): string => {
        return html
            .replace(/javascript:/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/on\w+='[^']*'/g, '');
    };

    // Markdownをパースする関数
    const parseMarkdown = (content: string): string => {
        if (!content) return '';
        const rendered = md.render(content);
        return sanitizeHtml(rendered);
    };

    return {
        parseMarkdown
    };
}