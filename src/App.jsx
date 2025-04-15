import './App.css'
import GeminiComponent from './GeminiComponent'

function App() {

  return (
    <>
      <GeminiComponent apiKey = {import.meta.env.VITE_GEMINI_API_KEY}/>
    </>
  )
}

export default App
