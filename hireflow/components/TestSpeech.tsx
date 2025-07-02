// 'use client'

// import React, { useRef, useEffect } from 'react';

// interface TestSpeechProps {
//   transcript: string;
//   setTranscript: (text: string) => void;
//   listening: boolean;
//   setListening: (val: boolean) => void;
// }

// const TestSpeech: React.FC<TestSpeechProps> = ({
//   transcript,
//   setTranscript,
//   listening,
//   setListening,
// }) => {
//   const recognitionRef = useRef<any>(null);

// useEffect(() => {
//   navigator.mediaDevices.getUserMedia({audio: true}).catch((err) => {
//     console.error('🎙️ Microphone permission denied:', err);
//     alert('Microphone access is required for speech recognition to work.');
// });
//   const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//   if (!SpeechRecognition) {
//     alert('SpeechRecognition not supported in this browser.');
//     return;
//   }

//   const recognition = new SpeechRecognition();
//   recognition.continuous = true;
//   recognition.interimResults = true;
//   recognition.lang = 'en-US';

//   recognition.onstart = () => console.log('🎤 Listening...');
//   recognition.onresult = (event: any) => {
//     const result = Array.from(event.results)
//       .map((res: any) => res[0].transcript)
//       .join('');
//     setTranscript(result);
//   };

//   recognition.onerror = (e: any) => {
//     console.log('Speech recognition error:', e.error);
//   };

//   recognition.onend = () => {
//     console.log('🛑 Recognition ended');
//     // Only restart if listening is still true
//     if (recognitionRef.current && listening) {
//       recognitionRef.current.start();
//     }
//   };

//   recognitionRef.current = recognition;
// }, []); // 👈 only run once


//   const toggleListening = () => {
//     if (!recognitionRef.current) return;
//     if (listening) {
//       recognitionRef.current.stop();
//       setListening(false);
//     } else {
//       setTranscript('');
//       recognitionRef.current.start();
//       setListening(true);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">🎙️ Speech to Text</h2>
//       <button
//         onClick={toggleListening}
//         className={`px-4 py-2 rounded shadow ${
//           listening ? 'bg-red-600' : 'bg-green-600'
//         } text-white`}
//       >
//         {listening ? 'Stop Listening' : 'Start Listening'}
//       </button>
//       <p className="mt-4 font-mono bg-gray-100 p-3 rounded">
//         {transcript || 'Say something...'}
//       </p>
//     </div>
//   );
// };

// export default TestSpeech;
