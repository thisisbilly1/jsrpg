import { useRef, useState } from 'react'
import { client } from './client';
import { Game } from './game';
import './App.css'

function App() {
  const username = useRef();
  const password = useRef();
  const [status, setStatus] = useState();
  const cli = useRef(new client(setStatus));

  const login = e => {
    e.preventDefault();
    cli.current.login(username.current.value, password.current.value);
  }

  const register = e => {
    e.preventDefault();
    cli.current.register(username.current.value, password.current.value);
  }

  switch (status) {
    case 'connecting':
      return (
        <div className="App">
          connecting...
        </div>
      )
    case 'authenticating':
      return (
        <div className="App">
          authenticating...
        </div>
      )
    case 'logged in':
      return (
        <div className="App">
          <Game client={cli.current} />
        </div>
      )
    default:
      return (
        <div className="App">
          <form onSubmit={login} >
            <div><input type="text" ref={username} defaultValue={'test'}></input></div>
            <div><input type="password" ref={password} defaultValue={'test'}></input></div>
            <button type="submit">Login</button>
          </form>
          <button onClick={register}>Register</button>
        </div>
      )
  }
}

export default App
