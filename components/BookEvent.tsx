"use client"

import { useState } from "react"

const BookEvent = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSUbmit = (e: React.FormEvent) => {
        e.preventDefault();

        setTimeout(() => {
            setSubmitted(true);
        }, 1000)
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thankyou for signing up!</p>
            ) : (
                <form onSubmit={handleSUbmit}>
                    <div>
                        <label htmlFor="email">Email Adress</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email Adress"
                        />
                    </div>
                </form>
            )}
        </div>
    )
}

export default BookEvent