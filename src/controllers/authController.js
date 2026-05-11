import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc.'
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      }
    });

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      user: data.user
    });

  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// ĐĂNG NHẬP
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và mật khẩu là bắt buộc.'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ success: false, message: error.message });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
      profile
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// QUÊN MẬT KHẨU
// =========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email là bắt buộc.' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) throw error;

    return res.json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// ĐẶT LẠI MẬT KHẨU
// =========================
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu token hoặc mật khẩu mới.' });
    }

    // Tạo auth client tạm thời với token của user
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { error } = await authClient.auth.updateUser({ password: newPassword });

    if (error) throw error;

    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// LẤY THÔNG TIN NGƯỜI DÙNG
// =========================
export const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Thiếu token.' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return res.json({ success: true, user, profile });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};