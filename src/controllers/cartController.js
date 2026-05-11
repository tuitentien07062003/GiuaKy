import { supabase } from '../config/supabase.js';

// =========================
// THÊM MÓN VÀO GIỎ HÀNG
// =========================
export const addToCart = async (req, res) => {
  try {
    const supabase = req.supabase;
    const userId = req.user.id;
    const { menu_item_id, quantity } = req.body;

    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({
          user_id: userId
        })
        .select('id')
        .single();

      if (error) throw error;
      cart = newCart;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        {
          cart_id: cart.id,
          menu_item_id,
          quantity
        },
        {
          onConflict: 'cart_id,menu_item_id'
        }
      )
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Đã thêm vào giỏ hàng',
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// =========================
// LẤY GIỎ HÀNG CỦA USER
// =========================
export const getCart = async (req, res) => {
  try {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('carts')
      .select(`
        id,
        cart_items (
          id,
          quantity,
          menu_items (id, name, price, image_url)
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.status(200).json({ success: true, data: data || { cart_items: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// THANH TOÁN (CHECKOUT)
// =========================
export const checkout = async (req, res) => {
  try {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        id,
        cart_items (
          quantity,
          menu_item_id,
          menu_items (price)
        )
      `)
      .eq('user_id', userId)
      .single();

    if (!cart || cart.cart_items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
    }

    const totalAmount = cart.cart_items.reduce((sum, item) => {
      return sum + (item.quantity * item.menu_items.price);
    }, 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ 
        user_id: userId, 
        total_amount: totalAmount, 
        status: 'pending' 
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItemsData = cart.cart_items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.menu_items.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    await supabase.from('cart_items').delete().eq('cart_id', cart.id);

    res.status(201).json({ 
      success: true, 
      message: "Đặt hàng thành công", 
      order_id: order.id 
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};