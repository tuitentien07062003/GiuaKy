import { supabase } from '../config/supabase.js';

export const getCategories = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMenuItems = async (req, res) => {
    try {
        const { categoryId } = req.params;

        let query = supabase
            .from('menu_items')
            .select('*, categories(name)');

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('menu_items')
            .select('*, categories(name)')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(404).json({ 
                success: false, 
                message: error.message,
                details: error.details
            });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};