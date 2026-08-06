import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { conversationsApi } from '@/api';
import type { Conversation, ChatMessage } from '@/api';
import { Send, ChevronLeft, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessagingPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationsApi.list().then(({ data }) => {
      setConversations(data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (conversationId) {
      const convId = Number(conversationId);
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setActiveConversation(conv);
        loadMessages(convId);
      } else if (conversations.length > 0) {
        conversationsApi.list({ conversation_id: convId }).then(({ data }) => {
          if (data.data.length > 0) {
            setActiveConversation(data.data[0]);
            loadMessages(convId);
          }
        });
      }
    }
  }, [conversationId, conversations]);

  const loadMessages = async (convId: number) => {
    try {
      const { data } = await conversationsApi.messages(convId);
      setMessages(data.data.reverse());
      conversationsApi.markAsRead(convId);
    } catch { /* ignore */ }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      const msg = await conversationsApi.sendMessage(activeConversation.id, {
        contenu: newMessage.trim(),
      });
      setMessages(prev => [...prev, msg.data]);
      setNewMessage('');

      setConversations(prev => prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, last_message: msg.data, last_message_at: msg.data.created_at }
          : c
      ));
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString(isAr ? 'ar-MA' : 'fr-MA', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return isAr ? 'أمس' : 'Hier';
    if (diffDays < 7) return date.toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { weekday: 'short' });
    return date.toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-text-subdued">{isAr ? 'جاري التحميل...' : 'Chargement...'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isAr ? 'الرسائل' : 'Messages'}
      </h1>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversations list */}
          <div className={cn(
            'w-80 border-r border-gold/10 flex flex-col shrink-0',
            activeConversation ? 'hidden md:flex' : 'flex'
          )}>
            <div className="p-4 border-b border-gold/10">
              <h2 className="font-semibold text-cream">
                {isAr ? 'المحادثات' : 'Conversations'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-text-subdued">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{isAr ? 'لا توجد محادثات' : 'Aucune conversation'}</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherUser = conv.other_user;
                  const isActive = activeConversation?.id === conv.id;
                  const hasUnread = (conv.unread_count || 0) > 0;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => { setActiveConversation(conv); loadMessages(conv.id); navigate(`/messages/${conv.id}`); }}
                      className={cn(
                        'w-full p-4 flex items-start gap-3 hover:bg-navy-hover transition-colors text-left border-b border-gold/10',
                        isActive && 'bg-navy-hover'
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-gold">{otherUser?.pseudo?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn('text-sm truncate', hasUnread ? 'font-semibold text-cream' : 'text-cream')}>
                            {otherUser?.pseudo}
                          </span>
                          <span className="text-[10px] text-text-subdued shrink-0">
                            {conv.last_message_at && formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        {conv.listing && (
                          <p className="text-[10px] text-gold truncate mt-0.5">
                            {isAr ? 'إعلان:' : 'Annonce:'} {conv.listing.titre}
                          </p>
                        )}
                        {conv.last_message && (
                          <p className={cn('text-xs truncate mt-0.5', hasUnread ? 'text-cream font-medium' : 'text-text-subdued')}>
                            {conv.last_message.sender_id === user?.id && (isAr ? 'أنت:' : 'Vous:')}
                            {' '}{conv.last_message.contenu}
                          </p>
                        )}
                      </div>
                      {hasUnread && (
                        <span className="w-5 h-5 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={cn(
            'flex-1 flex flex-col',
            !activeConversation && 'hidden md:flex'
          )}>
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center text-text-subdued">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{isAr ? 'اختر محادثة' : 'Selectionnez une conversation'}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gold/10 flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1 text-text-subdued"
                  >
                    <ChevronLeft className={cn('w-5 h-5', isAr && 'rotate-180')} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-gold">
                      {activeConversation.other_user?.pseudo?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{activeConversation.other_user?.pseudo}</p>
                    {activeConversation.listing && (
                      <Link
                        to={`/listings/${activeConversation.listing.numero_auto}`}
                        className="text-[10px] text-gold hover:underline"
                      >
                        {activeConversation.listing.titre}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5',
                          isMine
                            ? 'bg-gold text-navy rounded-br-md'
                            : 'bg-navy-card text-cream rounded-bl-md'
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{msg.contenu}</p>
                          <p className={cn(
                            'text-[10px] mt-1',
                            isMine ? 'text-navy/60 text-right' : 'text-text-subdued'
                          )}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gold/10">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      placeholder={isAr ? 'اكتب رسالة...' : 'Ecrivez un message...'}
                      className="flex-1 resize-none rounded-xl border border-gold/15 bg-navy-hover px-4 py-2.5 text-sm text-cream placeholder-text-subdued focus:outline-none focus:border-gold/40 transition-colors"
                      rows={1}
                      style={{ minHeight: '42px', maxHeight: '120px' }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2.5 rounded-xl bg-gold text-navy hover:bg-gold-light transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
