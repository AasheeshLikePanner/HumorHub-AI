import { useState } from 'react';
import {GoogleGenerativeAI} from '@google/generative-ai'
import axios from 'axios';

export default function App(){
  const [text, setText] = useState('');
  const [Joke, setJoke] = useState('Your Joke Shows Here');
  const [showLaugh, setShowLaugh] = useState(false);
  const [laughPosition, setLaughPosition] = useState({ top: '50%', left: '50%' });
  const genAI = new GoogleGenerativeAI( import.meta.env.VITE_GOOGLE_API_KEY);
  const [videoSrc, setVideoSrc] = useState("")

  const handleCreateJoke = async () => {
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
    const res = await model.generateContent("Tell me a short joke about " + text + "give me only joke nothing else not even a single other text");
    const response = res.response.text();
    setJoke(response)
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    triggerLaughAnimation();
  };

  const triggerLaughAnimation = () => {
    const randomTop = Math.random() * 80 + 10; 
    const randomLeft = Math.random() * 80 + 10; 

    setLaughPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
    setShowLaugh(true);


    setTimeout(() => setShowLaugh(false), 1000);
  };

  const handleGenrateVideo = async  () => {

    const options = {
      method: 'POST',
      url: 'https://api.d-id.com/talks',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Basic WVhOb2FYTm9jbUYwYUc5MWNqRXhNREpBWjIxaGFXd3VZMjl0OlVGcHdFbi03U3owN0tCT0Q2TGEyQQ=='

      },
      data: {
        source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          subtitles: 'false',
          provider: {type: 'microsoft', voice_id: 'Sara'},
          input: Joke
        },
        config: {fluent: 'false', pad_audio: '0.0'}
      }
    };
    axios
      .request(options)
      .then(function (response) {
        console.log(response);
        
      const options = {
        method: 'GET',
        url: `https://api.d-id.com/talks/${response.data.id}`,
        headers: {
          accept: 'application/json',
          authorization: 'Basic WVhOb2FYTm9jbUYwYUc5MWNqRXhNREpBWjIxaGFXd3VZMjl0OlVGcHdFbi03U3owN0tCT0Q2TGEyQQ=='
        }
      };
    
      const fetchTalkStatus = async () => {
        try {
          const response = await axios.request(options);
          console.log(response.data);
          
          if (response.data.status === 'done') { // Adjust the condition based on actual response structure
            setVideoSrc(response.data.result_url)
            clearInterval(intervalId); 
          }
        } catch (error) {
          console.error('Error fetching talk details:', error);
          clearInterval(intervalId); 
        }
    };

    const intervalId = setInterval(fetchTalkStatus, 5000);

      })
      .catch(function (error) {
        console.error(error);
      });
  }


  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center bg-zinc-900 relative">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-500 ease-in-out hover:scale-105">
          <input
            onChange={handleInputChange}
            type="text"
            placeholder="Add Flavour"
            className="w-full p-3 mb-4 rounded-md bg-gray-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-in-out"
            style={{ color: 'rgba(255, 255, 255, 0.87)', caretColor: 'rgba(255, 255, 255, 0.87)' }}
          />
          <div className="flex gap-4">
            <button
              onClick={handleCreateJoke}
              className="flex-1 bg-purple-600 hover:bg-purple-700 p-3 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
              style={{ color: 'rgba(255, 255, 255, 0.87)' }}
            >
              Create
            </button>
            <button
              onClick={handleGenrateVideo}
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
              style={{ color: 'rgba(255, 255, 255, 0.87)' }}
            >
              Generate Video
            </button>
          </div>
          <div className="mt-6 h-20 flex items-center justify-center relative">
            <h1
              className={`text-center text-lg transition-all duration-500 ease-in-out ${
                Joke ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
              }`}
              style={{ color: 'rgba(255, 255, 255, 0.87)' }}
              key={Joke}
            >
              {Joke}
            </h1>
          </div>
          <div className='items-center justify-center flex min-w-0'>
              <video autoPlay className='  rounded-lg' src={videoSrc}></video>
          </div>
        </div>

        {showLaugh && (
          <div
            className="absolute text-6xl opacity-0 transition-opacity duration-500"
            style={{
              ...laughPosition,
              color: 'rgba(255, 255, 255, 0.87)',
              animation: 'zoomRotateFade 1s forwards',
            }}
          >
            😂
          </div>
        )}
      </div>

      <style>{`
        @keyframes zoomRotateFade {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

