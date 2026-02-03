/**
 * Nyarm - テンプレート管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { generateId } from '../utils/date';
import { Template } from '../types';

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        const data = await storage.get<Template[]>('templates');
        setTemplates(data || []);
        setLoading(false);
    };

    const saveTemplates = async (newTemplates: Template[]) => {
        setTemplates(newTemplates);
        await storage.set('templates', newTemplates);
    };

    const saveTemplate = useCallback(async (
        name: string,
        time: string,
        label: string,
        excludeSunday: boolean,
        excludeSaturday: boolean
    ): Promise<Template> => {
        const template: Template = {
            id: generateId(),
            name,
            time,
            label,
            excludeSunday,
            excludeSaturday,
            createdAt: Date.now(),
        };

        await saveTemplates([...templates, template]);
        return template;
    }, [templates]);

    const getTemplate = useCallback((id: string): Template | undefined => {
        return templates.find(t => t.id === id);
    }, [templates]);

    const deleteTemplate = useCallback(async (id: string) => {
        const updatedTemplates = templates.filter(t => t.id !== id);
        await saveTemplates(updatedTemplates);
    }, [templates]);

    return {
        templates,
        loading,
        saveTemplate,
        getTemplate,
        deleteTemplate,
        reload: loadTemplates,
    };
};
