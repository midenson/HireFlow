// 'use client'

// import React, { useState } from 'react'

// const TestInterview = () => {
//   const [hasStarted, setHasStarted] = useState(false);

//   const speakText = (text: string) => {
//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(text);

//     utterance.onstart = () => console.log('interview has started');
//     utterance.onend = () => console.log('interview has ended');
//     utterance.onerror = (e) => console.log('❌ Speech error:', e.error);

//     const loadVoices = () => {
//       const voices = synth.getVoices();
//       console.log('available voices:', voices.map( v => v.name ));
      
//       if (voices.length > 0) {
//         const selectedVoice = voices.find(voice => voice.name.includes('Google')) || voices[0];
//         utterance.voice = selectedVoice;
//         utterance.volume = 1;
//         utterance.pitch = 1.2;
//         utterance.rate = 1.1;

//         console.log('using voice', selectedVoice.name);
//         synth.speak(utterance)
//       } else {
//         setTimeout(loadVoices, 100)
//       }
//     }

//     loadVoices();
//   }

//   const handleClick = () => {
//     setHasStarted(true);
//     speakText("Hello! Welcome to your interview assistant. Let's get started with the first question.");
//   }

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Test Interview TTS</h2>
//       {!hasStarted ? (
//         <button
//           onClick={handleClick}
//           className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
//         >
//           Start Interview
//         </button>
//       ) : (
//         <p className="text-green-600 font-medium">✅ Interview started. Check your speaker.</p>
//       )}
//     </div>
//   );
// }

// export default TestInterview