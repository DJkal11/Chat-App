import React, { useState, useRef } from "react";
import './App.css';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import  "firebase/compat/auth";
import Button from 'react-bootstrap/Button';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
  
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

const [user] = useAuthState(auth);


  return (
    <div className="App">
      <header className="App-header">
       <h1>ChatterBox</h1>
        <SignOut />
      </header>


      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <Button variant="danger" size="lg" className="sign-in" onClick={signInWithGoogle}>Sign in with <strong>Google</strong></Button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <Button variant="info" className="sign-out" onClick={() => auth.signOut()}>Sign Out</Button>
    
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, {idField: "id"});
  const [formValue, setFormValue] = useState(""); 

  async function sendMessage(e) {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;

     await messagesRef.add({
       text: formValue,
       createdAt: firebase.firestore.FieldValue.serverTimestamp(),
       uid,
       photoURL
     })
     
     setFormValue("");
     dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
    <main>
     {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

     <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>
     
     <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type here"/>

     <Button variant="primary" type="submit" disabled={!formValue}> Send</Button>

    </form>

    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="profile pic"/>
     <p>{text}</p>
    </div>
    </>
  )
}


export default App;
