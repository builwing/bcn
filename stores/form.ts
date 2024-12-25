// stores/form.ts
import { defineStore } from 'pinia'

interface FormState {
    title: string;
    category: string;
    rating: number;
    content: string;
}

export const useFormStore = defineStore('form', {
    state: (): FormState => ({
        title: '',
        category: '',
        rating: 0,
        content: ''
    }),

    actions: {
        setFormData(data: Partial<FormState>) {
            if (data.title) this.title = data.title
            if (data.category) this.category = data.category
            if (data.rating) this.rating = data.rating
            if (data.content) this.content = data.content
        },

        clearForm() {
            this.title = ''
            this.category = ''
            this.rating = 0
            this.content = ''
        }
    },

    persist: true
})