// stores/form.ts
import { defineStore } from 'pinia'

interface FormState {
    title: string;
    category: string;
    rating: number;
    content: string;
}

export const useFormStore = defineStore('form', () => {
    const formData = reactive<FormState>({
        title: '',
        category: '',
        rating: 0,
        content: ''
    });

    function setFormData(data: Partial<FormState>) {
        console.log('[formStore] フォームデータを更新:', data);
        Object.assign(formData, data);
    }

    function clearForm() {
        console.log('[formStore] フォームデータをクリア');
        formData.title = '';
        formData.category = '';
        formData.rating = 0;
        formData.content = '';
    }

    return {
        formData,
        setFormData,
        clearForm
    }
}, {
    persist: true
});