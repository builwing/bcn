import { defineStore } from 'pinia'

interface PostContent {
    imageIndex: number;
    content: string;
}

export const usePostContentStore = defineStore('postContent', {
    state: () => ({
        contents: {} as Record<number, string>,
    }),

    actions: {
        setContent(imageIndex: number, content: string) {
            this.contents[imageIndex] = content;
        },

        getContent(imageIndex: number): string {
            return this.contents[imageIndex] || '';
        },

        clearContent(imageIndex: number) {
            delete this.contents[imageIndex];
        },

        clearAllContents() {
            this.contents = {};
        }
    }
}) 