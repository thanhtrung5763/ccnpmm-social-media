import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import Topbar from "../../components/topbar/Topbar";
import { AuthContext } from "../../context/AuthContext";
import "./messenger.css";
import CreateGroupChatForm from "../../components/utils/CreateGroupChatForm";
// const fileUploader = require('../../s3.config');
const { getVideoMetadata } = require('../../services/oembed');


export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [newConversation, setNewConversation] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const [file, setFile] = useState(null);


  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        senderId: data.senderId,
        text: data.text,
        type: data.type,
        title: data.title,
        file_url: data.file_url,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.senderId) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.followings.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user]);

  const getConversations = async () => {
    try {
      const res = await axios.get("/conversations/" + user._id);
      setConversations(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let message = {
      senderId: user._id,
      text: newMessage,
      conversationId: currentChat._id,
      type: "text"
    };
    if (file !== null) {
      console.log("file: " + file)
      console.dir(file)
      if (file["type"].includes("image")) {
        message["type"] = "image"
      } else if (file["type"].includes("audio")) {
        message["type"] = "audio"
      } else if (file["type"].includes("video")) {
        message["type"] = "clip"
      }
    }

    if (newMessage.includes("https://")) {
      message["type"] = "video_link"
      setMessages([...messages, message]);
    }

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );
    await socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
      type: message["type"],
      file: file ? file : null,
      fileName: file ? file["name"] : null,
      mimeType: file ? file["type"] : null
    });

    if (message["type"] !== "text") {
      // Listen for the "getMetadata" event from the server
      const metadataPromise = new Promise((resolve) => {
        socket.current.on("getMetadata", (data) => {
          console.log("Received metadata:", data);
          message["title"] = data.title;
          message["file_url"] = data.file_url;
          console.log("METADATA 2: " + message.file_url);
          resolve(); // Resolve the promise when metadata is received
        });
      });

      // Wait for the "getMetadata" event before sending the "post /messages" request
      await metadataPromise;
    }
    
    try {
      const res = await axios.post("/messages", message);
      console.log(res.data)
      res.data.file_url = message?.file_url
      res.data.title = message?.title
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
    // messages[messages.length - 1]["file_url"] = message.file_url
    // messages[messages.length - 1]["title"] = message.title
    // setMessages([...messages])
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    const conversation = {
      groupName: "def group",
      senderId: user._id,
    }

    try {
      const res = await axios.post("/conversations", conversation);
      setNewConversation(res.data);
      console.log(res.data)
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    if (newConversation) {
      getConversations(); // Fetch conversations when the component mounts or whenever needed
    }
  }, [newConversation]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    console.log(file);
  };
  const handleUploadImage = async (e) => {
    const data = new FormData();
    data.append("file", file);
    console.log("FILEEEE" + file)
    // Upload the image to S3
    const res = await axios.post("/uploads/", data);
    setNewMessage(res.data.url)
  };

  const videoUrl = "https://www.youtube.com/watch?v=1dlTWaiBZDw&list=RDM-O070P2v6g"
  const [videoMetadata, setVideoMetadata] = useState(null);
  useEffect(() => {
    const get = async () => {
      try {
        const res = await getVideoMetadata(videoUrl);
        console.log(res)
        setVideoMetadata(res);
      } catch (err) {
        console.log(err);
      }
    };
    get();
  }, [videoUrl]);

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            {/* <button className="chatSubmitButton" onClick={handleCreateGroup}>
              Create Group
            </button> */}
            {/* <iframe
            width="240"
            height="240"
            src="https://www.youtube.com/embed/6jypIrxqhXo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
            /> */}
            {/* <div>
              <span>
                <div className="chatVideoUrl">
                <a href={videoMetadata?.url} target="_blank" rel="noreferrer">{videoMetadata?.url}</a>
                </div>
                <div className="chatVideoThump">
                  <a href={videoMetadata?.url} target="_blank" rel="noreferrer">
                    <div>
                      <div>
                        <img src={videoMetadata?.file_url} alt=""/>
                      </div>
                      <div className="chatVideoTitle">
                        <span>TikTok · Phát | Technical Leader</span>
                      </div>
                    </div>
                  </a>
                </div>
              </span>
            </div> */}
            <CreateGroupChatForm />
            <input placeholder="Search for friends" className="chatMenuInput" />
            {conversations.map((c) => (
              <div onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.senderId === user._id} />
                    </div>
                  ))}
                  {/* {videoMetadata ? <Message message={null} own={true} testManual={true} videoMetadata={videoMetadata} /> : null} */}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                  <input type="file" onChange={handleFileChange} />
                  <button className="chatSubmitButton" onClick={handleUploadImage}>
                    Upload
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}
