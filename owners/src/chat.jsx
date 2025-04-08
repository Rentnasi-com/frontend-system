import React, { useEffect, useState, useRef } from "react";

const Chat = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioPermission, setAudioPermission] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioStreamData, setAudioStreamData] = useState([]);
    const audioChunksRef = useRef([]);
    const wsRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        // Initialize AudioContext for playback
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

        // Request microphone access
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                setMediaRecorder(new MediaRecorder(stream));
                setAudioPermission(true);
            })
            .catch(() => {
                alert("Microphone access is required for recording voice notes.");
            });

        // Initialize WebSocket connection
        const ws = new WebSocket("wss://api.play.ai/v1/talk/Bob-2TmxE6peoTfLViyhjkOEx");

        ws.onopen = () => {
            console.log("WebSocket connected!");
            setIsConnected(true);

            // Send setup message
            const setupMessage = {
                type: "setup",
                apiKey: "ak-81e67316bda8404d978df5cfc3dd74e8", // Replace with your API key
                inputEncoding: "mulaw",
                inputSampleRate: 16000,
                outputFormat: "mp3",
                outputSampleRate: 24000,
            };
            ws.send(JSON.stringify(setupMessage));
            console.log("Setup message sent:", setupMessage);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            // Handle voice activity detection and new audio streams
            switch (message.type) {
                case "audioStream":
                    console.log("Audio stream received.");
                    playAudio(message.data);
                    break;
                case "voiceActivityStart":
                    console.log("User started speaking.");
                    break;
                case "voiceActivityEnd":
                    console.log("User stopped speaking.");
                    break;
                case "newAudioStream":
                    console.log("Starting a new audio stream.");
                    setAudioStreamData([]);
                    break;
                default:
                    console.log("Unhandled WebSocket message type:", message.type);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket closed.");
            setIsConnected(false);
        };

        wsRef.current = ws;

        return () => {
            ws.close();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startRecording = () => {
        if (!audioPermission || !mediaRecorder) {
            alert("Microphone access is not available.");
            return;
        }

        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.start(500); // Send chunks every 500ms
        setIsRecording(true);
        console.log("Recording started.");
    };

    const stopRecording = () => {
        if (!mediaRecorder || mediaRecorder.state !== "recording") return;

        mediaRecorder.stop();
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
            console.log("Audio Blob recorded:", audioBlob);

            // Convert Blob to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Audio = reader.result.split(",")[1]; // Extract Base64 string
                console.log("Base64 Audio:", base64Audio);

                // Send Base64-encoded audio via WebSocket
                const message = {
                    type: "audioIn",
                    data: base64Audio,
                };

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify(message));
                    console.log("Audio sent to WebSocket.");
                } else {
                    console.error("WebSocket is not open.");
                }
            };
            reader.readAsDataURL(audioBlob);

            setIsRecording(false);
        };
    };

    const playAudio = async (base64Data) => {
        try {
            const response = await fetch(`data:audio/mp3;base64,${base64Data}`);
            const arrayBuffer = await response.arrayBuffer();

            // Try decoding the audio data
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

            // Play the decoded audio
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
            console.log("Audio is playing.");
        } catch (error) {
            console.error("Error playing audio:", error);
            console.log("Base64 data might be malformed or format may not match.");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Voice Note Chat</h1>

            {isConnected ? (
                <p className="text-green-600 text-lg">Connected to Play.ai</p>
            ) : (
                <p className="text-red-600 text-lg">Connecting...</p>
            )}

            <div className="mt-6 space-y-4">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-3 rounded-lg ${isConnected ? "bg-blue-500" : "bg-gray-400"
                        } text-white font-semibold`}
                    disabled={!isConnected}
                >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
            </div>
        </div>
    );
};

export default Chat;
