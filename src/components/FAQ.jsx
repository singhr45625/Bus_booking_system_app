import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqs = [
        { q: "How do I track my bus in real-time?", a: "Once you book a ticket, go to 'My Bookings' and click 'Track Live'. You will see the bus location and intermediate stations." },
        { q: "Can I cancel my ticket?", a: "Yes, tickets can be cancelled up to 4 hours before departure for a full refund to your wallet." },
        { q: "Is the Smart Wallet secure?", a: "Absolutely. We use industry-standard encryption to protect your funds and transaction data." }
    ];

    return (
        <section className="faq dash-container">
            <div className="section-title">
                <span className="badge">Support</span>
                <h2>Frequently Asked Questions</h2>
            </div>
            <div className="faq-list">
                {faqs.map((faq, i) => (
                    <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                        <div className="faq-q">
                            <span>{faq.q}</span>
                            {openIndex === i ? <Minus size={18} /> : <Plus size={18} />}
                        </div>
                        {openIndex === i && <div className="faq-a animate-fade">{faq.a}</div>}
                    </div>
                ))}
            </div>
            <style>{`
                .faq { padding-bottom: 8rem; }
                .faq-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
                .faq-item { background: white; border: 1px solid #f0f0f0; border-radius: 20px; padding: 1.5rem 2rem; cursor: pointer; transition: 0.3s; }
                .faq-q { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 1.1rem; }
                .faq-a { margin-top: 1.5rem; color: #717171; line-height: 1.6; border-top: 1px solid #f9f9f9; padding-top: 1.5rem; }
            `}</style>
        </section>
    );
};

export default FAQ;
