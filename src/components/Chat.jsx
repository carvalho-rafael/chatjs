import { useEffect, useRef, useState } from "react";
import socketIo from "socket.io-client";

import '../styles/chat.css';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('')
    const [socket, setSocket] = useState();
    const [name, setName] = useState('');
    const [hasName, setHasName] = useState(false);

    const messageContainer = useRef();
    const sendInput = useRef();

    useEffect(() => {

        const socket = socketIo('http://localhost:3001', {
            transports: ['websocket'],
        });

        setSocket(socket);

        socket.on('newMessage', message => {
            setMessages((prevState) => [...prevState, message])
        });
    }, [])

    useEffect(() => {
        socket?.on('updateUsers', message => {
            const users = message.filter(user => user !== name)
            console.log(users, name)
            setUsers(users)
        });
    }, [name, socket])

    useEffect(() => {
        const element = messageContainer.current
        if (element)
            element.scrollTop = element.scrollHeight;
    }, [messages])

    function handleSubmit(event) {
        event.preventDefault();
        socket?.emit('sendMessage', message);
        sendInput.current.value = '';
    }

    function handleNameForm(event) {
        event.preventDefault();
        setHasName(true)
        socket?.emit('sendName', name)
    }

    if (!hasName) {
        return (
            <div className="name-form-container">
                <h2>Please, type your name!</h2>
                <form onSubmit={handleNameForm} className="name-form">
                    <input
                        onChange={(value) => setName(value.target.value)}
                        type="text"
                        name="send-message"
                        id="send-message"
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        );
    }

    return (
        <div id="chat">
            <main>
                <div className="messages-container" ref={messageContainer}>
                    {messages.map((message, index) => (
                        <p key={index}>{message}</p>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="send-message-container">
                    <input 
                        onChange={(value) => setMessage(value.target.value)} 
                        type="text" 
                        name="send-message" 
                        id="send-message"
                        ref={sendInput}
                    />
                    <button
                        type="submit"
                    >
                        send!
                    </button>
                </form>

            </main>
            <aside>
                <h3>Users</h3>
                {users.map((user, index) => (
                    <p key={index}>{user}</p>
                ))}
            </aside>
        </div>

    )
}