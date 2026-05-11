import { supabase } from '../config/supabase.js';

import { createClient } from '@supabase/supabase-js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập.'
      });
    }

    const userSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const {
      data: { user },
      error
    } = await userSupabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ.'
      });
    }

    req.user = user;
    req.supabase = userSupabase; // Quan trọng nhất

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};