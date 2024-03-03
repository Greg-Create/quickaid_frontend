import "./App.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useState, useEffect } from "react"; // Import useEffect hook
import { PiRecordFill } from "react-icons/pi";
import { FaMicrophone } from "react-icons/fa";



function App() {
  // Initialize textLog state with an empty array
  const [textLog, setTextLog] = useState([]);
  const [image, setImage] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [synth, setSynth] = useState(window.speechSynthesis);
  const [latitude,setLatitude] = useState(0)
  const [longitude,setLongitude] = useState(0)

  const speakText = (promp) => {
    const utterance = new SpeechSynthesisUtterance(promp);
    synth.speak(utterance);
    setSpeaking(true);
  };

  const pauseSpeech = () => {
    synth.pause();
    setSpeaking(false);
  };

  const stopSpeech = () => {
    synth.cancel();
    setSpeaking(false);
  };
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
  } = useSpeechRecognition({
    recognitionOptions: {
      interimResults: true,
      continuous: true,
    },
  });

  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    SpeechRecognition.startListening();
  };

   useEffect(()=>{
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      setLatitude( position.coords.latitude)
      setLongitude(position.coords.longitude)
      localStorage.setItem("lat", position.coords.latitude);
      localStorage.setItem("lon", position.coords.longitude);
      //  setLatitude(43.8833298)
      // setLongitude(-79.249999)
    });
  },[])

  const stopRecording = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
    // Update textLog state with the new transcript
    setTextLog((prevTextLog) => [...prevTextLog, transcript]);
    sendTranscriptToBackend(transcript);
    
  };

  const sendTranscriptToBackend = (transcript) => {
    fetch("https://quickaid-server.vercel.app/transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //  'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjBadXlhUjRSMkJ0dDRKclhwdkVMeiJ9.eyJpc3MiOiJodHRwczovL2Rldi03bTIyeGphNzJhc3NwZWNjLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJOTWdTWUxmZ1RyNngxRkxtNjVsVWV1elk2eWJ6eGlHRUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly92ZXJjZWwtdGVzdC1iZXRhLXNhYmxlLTY3LnZlcmNlbC5hcHAvIiwiaWF0IjoxNzA5Mzg1MjA0LCJleHAiOjE3MDk0NzE2MDQsImF6cCI6Ik5NZ1NZTGZnVHI2eDFGTG02NWxVZXV6WTZ5Ynp4aUdFIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.gjEZKY2zZPkY-2qkDmlCY7fLGPFc_8lWTi60GKTSG85zC-SUSdTMeatiY8KFLps1wfT5EeGPcVY0tLJScqz8jyjfAEXnsaYsYC9v6YFuWgU4jS6m2V8PRYmOskbXzcqaSWbfUOHojRbtl7FwTXTFD6j-Krcoj0yuRRazuy6GauHUqEaxGsiv-b19mUrBcZ_XrSVHbO33Z5-6FKjdf3ZuPCwQ6wYj_kKspVGOi1zRecFoaIX-YZuu5VbSfAOtnVgoSeTDh8aHqFgOxpC1ZOYgjoigWM_rWiLkJbRCZKhY-auZdILpm-KBzGXk4mLQ-uRgSo_z4B1RA88Su-JjN7d8xQ'
      },
      body: JSON.stringify({ transcript: finalTranscript, lat: latitude, long: longitude }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send transcript to backend");
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        setTextLog((prevTextLog) => [...prevTextLog, data.message]);
        if (data.image) {
          setImage(data.image);
        }
         
        speakText(`${data.message}`) ;
      })
      .catch((error) => {
        console.error("Error sending transcript to backend:", error);
      });
  };

  // Effect to log textLog whenever it changes
  useEffect(() => {
    console.log(textLog);
  }, [textLog]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="App">
      <img
        src={
          "https://static.vecteezy.com/system/resources/previews/017/177/954/original/round-medical-cross-symbol-on-transparent-background-free-png.png"
        }
        style={{ height: "5rem" }}
      />
      <h2>QuickAid</h2>
      <p>Microphone: {isRecording ? "on" : "off"}</p>
      {isRecording ? (
        <button className="record small" onClick={stopRecording}><PiRecordFill /></button>
      ) : (
        <button className="record" onClick={startRecording}><FaMicrophone /> </button>
      )}
      {textLog.map((text, index) => (
        <div>
        {text? 
          <div className="box">
        <p key={index}>{text}</p>
      </div> : ""}
      </div>
       
      ))}
      <p>{isRecording? transcript : ""}</p>

      {image ? <img src={image} /> : ""}
    </div>
  );
}

export default App;
