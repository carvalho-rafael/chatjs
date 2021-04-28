import { useEffect, useRef, useState } from "react";
import socketIo from "socket.io-client";

import '../styles/chat.css';

import sendIcon from '../assets/send.png';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('')
    const [socket, setSocket] = useState();
    const [name, setName] = useState('');
    const [hasName, setHasName] = useState(false);

    const messageContainer = useRef();
    const sendMessageInput = useRef();
    const sendNameInput = useRef();

    useEffect(() => {

        const socket = socketIo('https://rafael-portfolio-chatjs.herokuapp.com/', {
            transports: ['websocket'],
        });

        setSocket(socket);

        socket.on('newMessage', message => {
            setMessages((prevState) => [...prevState, message])
        });

        sendNameInput.current.focus()
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

    useEffect(() => {
        if (hasName) {
            sendMessageInput.current.focus()
        }
    }, [hasName])

    function handleSubmit(event) {
        event.preventDefault();
        socket?.emit('sendMessage', message);
        sendMessageInput.current.value = '';
        setMessage('');
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
                        className="input-text"
                        ref={sendNameInput}
                    />
                    <button type="submit">Enter</button>
                </form>
            </div>
        );
    }

    return (
        <div id="chat">
            <nav>ChatJs - <b>{name}</b></nav>
            <div className="chat-container">
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
                            className="input-text"
                            ref={sendMessageInput}
                            required
                        />
                        <button
                            type="submit"
                        >
                            <img src={sendIcon} alt="" width="20px" height="20px" />
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
        </div>

    )
}