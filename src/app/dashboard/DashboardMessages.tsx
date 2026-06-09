'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Search, Trash2, ArrowUpRight } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  badgeColor?: string;
  online: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

const MY_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
const ALBERT_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'arlene',
    name: 'Arlene McCoy',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Ok, Understood!',
    time: '35 mins',
    unread: 2,
    badgeColor: '#27AE60',
    online: true,
  },
  {
    id: 'darlene',
    name: 'Darlene Robertson',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'I will review the staging compiler reports.',
    time: '35 mins',
    unread: 0,
    online: true,
  },
  {
    id: 'jane',
    name: 'Jane Cooper',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Can you confirm the checkout API keys?',
    time: '35 mins',
    unread: 2,
    badgeColor: '#2D9CDB',
    online: false,
  },
  {
    id: 'albert',
    name: 'Albert Flores',
    role: 'Head of Development',
    avatar: ALBERT_AVATAR,
    lastMessage: "Perfect, let's schedule the next sprint.",
    time: '35 mins',
    unread: 0,
    online: true,
  },
  {
    id: 'cameron',
    name: 'Cameron Williamson',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Layout renders perfectly on Android Chrome.',
    time: '35 mins',
    unread: 2,
    badgeColor: '#F2994A',
    online: true,
  },
  {
    id: 'kristin',
    name: 'Kristin Watson',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Awesome support. Thank you bishal!',
    time: '35 mins',
    unread: 0,
    online: false,
  },
  {
    id: 'annette',
    name: 'Annette Black',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    lastMessage: "I've deployed a responsive template mock setup.",
    time: '35 mins',
    unread: 2,
    badgeColor: '#EB5757',
    online: true,
  },
  {
    id: 'jacob',
    name: 'Jacob Jones',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Vite build runs beautifully.',
    time: '35 mins',
    unread: 0,
    online: false,
  },
  {
    id: 'vincent',
    name: 'Vincent Porter',
    role: 'Head of Development',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'No compiler errors recorded.',
    time: '35 mins',
    unread: 0,
    online: true,
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  arlene: [
    {
      id: 'msgX1',
      sender: 'them',
      senderName: 'Albert Flores',
      senderAvatar: ALBERT_AVATAR,
      text: 'How likely are you to recommend our company to your friends and family?',
      time: '35 mins',
    },
    {
      id: 'msgX2',
      sender: 'me',
      senderName: 'You',
      senderAvatar: MY_AVATAR,
      text: "Hey there, we’re just writing to let you know that you’ve been subscribed to a repository on GitHub.",
      time: '35 mins',
    },
    {
      id: 'msgX3',
      sender: 'them',
      senderName: 'Albert Flores',
      senderAvatar: ALBERT_AVATAR,
      text: 'Ok, Understood!',
      time: '35 mins',
    },
  ],
  darlene: [
    {
      id: 'dsl-1',
      sender: 'them',
      senderName: 'Darlene Robertson',
      senderAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      text: 'Hello! Did we check the lint errors in the layout files?',
      time: '1 hour ago',
    },
    {
      id: 'dsl-2',
      sender: 'me',
      senderName: 'You',
      senderAvatar: MY_AVATAR,
      text: 'Yes, I will review the staging compiler reports. Everything builds strictly green.',
      time: '45 mins',
    },
  ],
  jane: [
    {
      id: 'jn-1',
      sender: 'them',
      senderName: 'Jane Cooper',
      senderAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      text: 'Hey, we are ready to test Stripe integrations. Can you confirm the checkout API keys?',
      time: '35 mins',
    },
  ],
  albert: [
    {
      id: 'al-1',
      sender: 'them',
      senderName: 'Albert Flores',
      senderAvatar: ALBERT_AVATAR,
      text: 'Weekly feedback metrics are glowing.',
      time: '2 hours ago',
    },
    {
      id: 'al-2',
      sender: 'me',
      senderName: 'You',
      senderAvatar: MY_AVATAR,
      text: "Perfect, let's schedule the next sprint.",
      time: '35 mins',
    },
  ],
  cameron: [
    {
      id: 'cm-1',
      sender: 'them',
      senderName: 'Cameron Williamson',
      senderAvatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      text: 'Layout renders perfectly on Android Chrome. Excellent performance scoring on mobile platforms.',
      time: '35 mins',
    },
  ],
  kristin: [
    {
      id: 'kr-1',
      sender: 'them',
      senderName: 'Kristin Watson',
      senderAvatar:
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
      text: 'Awesome support. Thank you bishal!',
      time: '35 mins',
    },
  ],
  annette: [
    {
      id: 'an-1',
      sender: 'them',
      senderName: 'Annette Black',
      senderAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      text: "I've deployed a responsive template mock setup. Please take a look when free.",
      time: '35 mins',
    },
  ],
  jacob: [
    {
      id: 'jc-1',
      sender: 'them',
      senderName: 'Jacob Jones',
      senderAvatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      text: 'Ready to launch the beta tests?',
      time: '1 hour ago',
    },
    {
      id: 'jc-2',
      sender: 'me',
      senderName: 'You',
      senderAvatar: MY_AVATAR,
      text: "Yes, Vite build runs beautifully. I'll open access now.",
      time: '35 mins',
    },
  ],
  vincent: [
    {
      id: 'vn-1',
      sender: 'them',
      senderName: 'Vincent Porter',
      senderAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      text: 'No compiler errors recorded in the deploy dashboard log pipeline.',
      time: '35 mins',
    },
  ],
};

const RESPONSE_TEMPLATES = [
  'Fantastic! I will implement that straight away.',
  'Understood. Let me double-check the responsive container layouts on our branch.',
  "Perfect, thank you! I'll update the GitHub repo with these changes.",
  "Got it! Let's touch base again once the staging compiler logs verify it.",
];

export default function DashboardMessages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletedHistoryBackup, setDeletedHistoryBackup] = useState<Message[] | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState('arlene');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId) ?? contacts[0];
  const activeMessages = messagesMap[activeContactId] ?? [];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping]);

  const getReplyPersona = (contact: Contact) => {
    if (contact.name === 'Arlene McCoy') {
      return { name: 'Albert Flores', avatar: ALBERT_AVATAR };
    }
    return { name: contact.name, avatar: contact.avatar };
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const textContent = inputText.trim();
    if (!textContent) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      senderName: 'You',
      senderAvatar: MY_AVATAR,
      text: textContent,
      time: 'Just Now',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage],
    }));

    setInputText('');
    setIsTyping(true);

    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? { ...c, lastMessage: textContent, time: 'Just Now', unread: 0 }
          : c,
      ),
    );

    setTimeout(() => {
      setIsTyping(false);

      const templateStr =
        RESPONSE_TEMPLATES[Math.floor(Math.random() * RESPONSE_TEMPLATES.length)];
      const persona = getReplyPersona(activeContact);

      const repliesMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'them',
        senderName: persona.name,
        senderAvatar: persona.avatar,
        text: templateStr,
        time: 'Just Now',
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), repliesMessage],
      }));

      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId ? { ...c, lastMessage: templateStr, time: 'Just Now' } : c,
        ),
      );
    }, 1500);
  };

  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const handleDeleteConversation = () => {
    if (activeMessages.length === 0) return;
    setDeletedHistoryBackup(activeMessages);
    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: [],
    }));

    setToastMessage(`Conversation with ${activeContact.name} was deleted.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleUndoDelete = () => {
    if (!deletedHistoryBackup) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: deletedHistoryBackup,
    }));
    setDeletedHistoryBackup(null);
    setToastMessage('Conversation history restored successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const typingPersona = getReplyPersona(activeContact);

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen bg-[#f0efec] p-4 font-sans text-black duration-300 select-none sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto grid min-h-[640px] max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex h-[650px] flex-col rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] lg:col-span-4">
          <div className="relative mb-5 flex items-center rounded-xl border border-neutral-100 bg-[#F9F9FB] px-4 py-1">
            <Search className="mr-2.5 h-[18px] w-[18px] shrink-0 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Serach"
              className="w-full border-0 bg-transparent py-3 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="scrollbar-thin scrollbar-thumb-neutral-200 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredContacts.length === 0 ? (
              <div className="py-12 text-center font-sans text-xs text-neutral-400">
                No contacts matching search query.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = activeContactId === contact.id;
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleSelectContact(contact.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border border-neutral-100/50 bg-[#F9F9FB]'
                        : 'border border-transparent hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="relative h-11 w-11 shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-11 w-11 rounded-full border border-neutral-100 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {contact.online ? (
                          <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full bg-[#27AE60] ring-2 ring-white" />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <h4 className="mb-1 truncate text-sm font-medium leading-tight tracking-tight text-black">
                          {contact.name}
                        </h4>
                        <p className="truncate text-xs font-normal text-neutral-400">{contact.role}</p>
                      </div>
                    </div>

                    <div className="flex h-9 shrink-0 flex-col items-end justify-between text-right">
                      <span className="text-[11px] font-normal tracking-tight text-neutral-400">
                        {contact.time}
                      </span>

                      {contact.unread > 0 ? (
                        <span
                          style={{ backgroundColor: contact.badgeColor || '#52C47F' }}
                          className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-center text-[10px] font-medium leading-none text-white"
                        >
                          {contact.unread}
                        </span>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="relative flex h-[650px] flex-col rounded-2xl border border-neutral-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] lg:col-span-8">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-neutral-100 bg-white px-6 py-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-11 w-11 shrink-0">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="h-11 w-11 rounded-full border border-neutral-100 object-cover"
                  referrerPolicy="no-referrer"
                />
                {activeContact.online ? (
                  <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full bg-[#27AE60] ring-2 ring-white" />
                ) : null}
              </div>

              <div className="leading-tight">
                <h3 className="text-[15px] font-medium tracking-tight text-black">
                  {activeContact.name}
                </h3>
                <span className="mt-0.5 block text-[11px] font-normal tracking-tight text-neutral-400">
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeleteConversation}
              className="cursor-pointer text-[13px] font-normal text-red-500 underline decoration-red-100 transition-all hover:text-red-700 hover:decoration-red-400"
            >
              Delete Conversation
            </button>
          </div>

          {toastMessage ? (
            <div className="animate-in fade-in absolute left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-neutral-200 bg-[#F9F9FB] px-4 py-2.5 text-xs text-neutral-800 shadow-lg duration-300">
              <span>{toastMessage}</span>
              {deletedHistoryBackup ? (
                <button
                  type="button"
                  onClick={handleUndoDelete}
                  className="cursor-pointer text-xs font-semibold text-[#27AE60] hover:underline"
                >
                  Undo
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="scrollbar-thin scrollbar-thumb-neutral-200 flex-1 space-y-6 overflow-y-auto bg-[#FAF9F7]/10 p-6">
            {activeMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2 p-8 text-center">
                <span className="text-xl">💬</span>
                <p className="text-sm font-medium text-neutral-900">
                  This conversation has been cleared
                </p>
                <p className="text-xs text-neutral-400">
                  Send an introductory message to start talking again.
                </p>
                {deletedHistoryBackup ? (
                  <button
                    type="button"
                    onClick={handleUndoDelete}
                    className="mt-2 cursor-pointer text-xs font-semibold text-[#27AE60] hover:underline"
                  >
                    Restore conversation
                  </button>
                ) : null}
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isMe = msg.sender === 'me';

                if (isMe) {
                  return (
                    <div
                      key={msg.id}
                      className="animate-in fade-in flex flex-col items-end space-y-2 duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-normal text-neutral-400">{msg.time}</span>
                        <span className="text-[13px] font-medium text-neutral-700">
                          {msg.senderName}
                        </span>
                        <img
                          src={msg.senderAvatar}
                          alt="Your avatar profile portrait"
                          className="h-[28px] w-[28px] rounded-full border border-neutral-100 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="max-w-[70%] rounded-2xl rounded-tr-none border border-[#e5f4ec]/80 bg-[#f0faf4] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                        <p className="font-sans text-[13.5px] font-normal leading-relaxed text-[#2e6b4e]">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className="animate-in fade-in flex flex-col items-start space-y-2 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="h-[28px] w-[28px] rounded-full border border-neutral-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[13px] font-medium text-neutral-700">
                        {msg.senderName}
                      </span>
                      <span className="text-[11.5px] font-normal text-neutral-400">{msg.time}</span>
                    </div>

                    <div className="max-w-[70%] rounded-2xl rounded-tl-none border border-neutral-100/50 bg-[#F9F9FB] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <p className="font-sans text-[13.5px] font-normal leading-relaxed text-neutral-800">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping ? (
              <div className="flex animate-pulse flex-col items-start space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={typingPersona.avatar}
                    alt={typingPersona.name}
                    className="h-[28px] w-[28px] rounded-full border border-neutral-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[13px] font-medium text-neutral-700">
                    {typingPersona.name}
                  </span>
                  <span className="text-[11px] text-neutral-400">typing...</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-neutral-100/40 bg-[#F9F9FB] px-5 py-3">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52C47F]"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52C47F]"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52C47F]"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-neutral-100 bg-white p-4"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder="Type a Message"
              className="flex-1 border-0 bg-transparent px-1.5 py-3 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-3 text-xs font-medium tracking-tight text-white transition-all ${
                inputText.trim() && !isTyping
                  ? 'bg-[#52C47F] shadow-md hover:scale-[1.02] hover:bg-[#43B26F] active:scale-[0.98]'
                  : 'cursor-not-allowed border border-neutral-100 bg-neutral-100 text-neutral-400'
              }`}
            >
              <span>Send Message</span>
              <ArrowUpRight className="ml-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
