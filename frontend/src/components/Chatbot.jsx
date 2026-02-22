import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Chatbot.module.css';
import { onChatbotNotification } from '../utils/chatbotNotifier';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your StitchNet assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const unsubscribe = onChatbotNotification((message) => {
            setMessages(prev => [...prev, { text: `🔔 NOTIFICATION: ${message}`, isBot: true, isNotification: true }]);
            // Optional: Auto-open chat on notification if it's closed
            if (!isOpen) setIsOpen(true);
        });
        return unsubscribe;
    }, [isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        // Simulate typing delay
        setTimeout(() => {
            const botResponse = getBotResponse(input, user);
            setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
        }, 500);
    };

    const KNOWLEDGE_BASE = [
        {
            keywords: ["what is stitchnet", "stitchnet", "about"],
            answer: "StitchNet is a digital platform that connects garment factory owners and workers to manage micro-orders, contracts, and work tracking online."
        },
        {
            keywords: ["who can use", "who uses", "users"],
            answer: "Factory owners, garment workers, and administrators can use StitchNet."
        },
        {
            keywords: ["post a new order", "post order", "create order", "how to post"],
            answer: "Log in as an owner, go to the dashboard, click “Post Order”, enter task details, and submit."
        },
        {
            keywords: ["available orders", "see orders", "view orders"],
            answer: "Log in as a worker and open the “Available Orders” section to view all open micro-orders."
        },
        {
            keywords: ["accept an order", "accept order", "how to accept"],
            answer: "Click the “Accept Order” button on the order card. The order will move to the contract stage."
        },
        {
            keywords: ["after i accept", "accept order", "acceptance"],
            answer: "A digital contract is automatically generated with order and user details."
        },
        {
            keywords: ["view the contract", "view contract", "online contract"],
            answer: "Yes, you can view the contract in your dashboard before signing."
        },
        {
            keywords: ["download the contract", "download contract", "pdf"],
            answer: "Yes, after signing, the contract can be downloaded as a PDF."
        },
        {
            keywords: ["how do i sign", "how to sign", "sign the contract"],
            answer: "Use the digital signature pad to sign using mouse or touch and submit."
        },
        {
            keywords: ["who signs first", "signing order", "first signature"],
            answer: "The worker signs first. After that, the owner signs the contract."
        },
        {
            keywords: ["edit the contract", "edit contract", "change contract"],
            answer: "No. Once both parties sign, the contract is locked."
        },
        {
            keywords: ["update work progress", "update progress", "work progress", "how to update"],
            answer: "Go to “My Orders” and update the progress percentage."
        },
        {
            keywords: ["owner see my progress", "view progress", "owner progress"],
            answer: "Yes, the owner can view real-time progress updates."
        },
        {
            keywords: ["after work completion", "work completion", "complete"],
            answer: "The owner reviews the work and approves it."
        },
        {
            keywords: ["revisions needed", "revisions", "request changes"],
            answer: "The owner can request changes before final approval."
        },
        {
            keywords: ["signature secure", "signature security", "secure"],
            answer: "Yes, digital signatures are securely stored and linked to the contract."
        },
        {
            keywords: ["contract status", "status of contract", "pending"],
            answer: "Contract status can be Pending, Signed, or Completed."
        },
        {
            keywords: ["chatbot help", "how does the chatbot help", "chatbot role"],
            answer: "The chatbot guides users through orders, contracts, signing, and tracking."
        },
        {
            keywords: ["available 24/7", "available anytime", "instant assistance"],
            answer: "Yes, the chatbot provides instant assistance anytime."
        },
        {
            keywords: ["show order status", "order status", "fetch status"],
            answer: "Yes, the chatbot can fetch and display your current order status."
        }
    ];

    const getBotResponse = (query, user) => {
        const q = query.toLowerCase();

        // 1. Basic greetings
        if (q.includes('hello') || q.includes('hi')) {
            return "Hello! I'm your StitchNet assistant. Ask me about orders, contracts, signatures, or tracking progress.";
        }

        // 2. Search knowledge base
        const match = KNOWLEDGE_BASE.find(item =>
            item.keywords.some(keyword => q.includes(keyword))
        );

        if (match) {
            return match.answer;
        }

        // 3. Fallback
        return "I'm not exactly sure about that. Try asking about 'orders', 'contracts', 'signatures', or 'how to sign'.";
    };

    return (
        <div className={styles.chatbotContainer}>
            <button className={`${styles.chatToggle} ${isOpen ? styles.active : ''}`} onClick={toggleChat}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className={`${styles.chatWindow} fade-in`}>
                    <div className={styles.chatHeader}>
                        <h3>StitchNet AI</h3>
                    </div>
                    <div className={styles.chatMessages}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`${styles.message} ${msg.isBot ? styles.bot : styles.user}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className={styles.chatInput} onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
