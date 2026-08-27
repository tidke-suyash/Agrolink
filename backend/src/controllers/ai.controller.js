const geminiService = require('../services/geminiService');
const supabase = require('../config/supabase');

/**
 * Send a chat message to Gemini AI.
 * POST /api/ai/chat
 * Body: { message, chat_id? }
 */
async function chat(req, res, next) {
  try {
    const { message, chat_id, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    let history = [];
    let chatId = chat_id;

    // If continuing an existing chat, load history
    if (chatId) {
      const { data: chatData } = await supabase
        .from('ai_chats')
        .select('messages')
        .eq('id', chatId)
        .eq('user_id', req.user.id)
        .single();

      if (chatData) {
        history = chatData.messages || [];
      }
    }

    // Get Gemini response with optional image
    const { text: response, live } = await geminiService.chat(message, history, image);

    // Update or create chat record
    const updatedMessages = [
      ...history,
      {
        role: 'user',
        content: message || 'Attached Crop Photo for Diagnosis',
        image: image ? image.substring(0, 100) + '...' : null,
        timestamp: new Date().toISOString()
      },
      { role: 'assistant', content: response, live, timestamp: new Date().toISOString() },
    ];

    if (chatId) {
      await supabase
        .from('ai_chats')
        .update({ messages: updatedMessages })
        .eq('id', chatId);
    } else {
      // Create new chat
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      const { data: newChat } = await supabase
        .from('ai_chats')
        .insert({
          user_id: req.user.id,
          title,
          messages: updatedMessages,
        })
        .select()
        .single();

      chatId = newChat?.id;
    }

    res.json({
      response,
      chat_id: chatId,
      live,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get chat history.
 * GET /api/ai/history
 */
async function getHistory(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('ai_chats')
      .select('id, title, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ chats: data || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a specific chat with full messages.
 * GET /api/ai/chat/:id
 */
async function getChat(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Get structured crop advice.
 * POST /api/ai/crop-advice
 * Body: { crop, location, season, soilType, issue }
 */
async function cropAdvice(req, res, next) {
  try {
    const { crop, location, season, soilType, issue } = req.body;

    if (!crop && !issue) {
      return res.status(400).json({ error: 'At least crop name or issue is required' });
    }

    const advice = await geminiService.getCropAdvice({
      crop, location, season, soilType, issue,
    });

    res.json({ advice });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a chat.
 * DELETE /api/ai/chat/:id
 */
async function deleteChat(req, res, next) {
  try {
    const { error } = await supabase
      .from('ai_chats')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat, getHistory, getChat, cropAdvice, deleteChat };
