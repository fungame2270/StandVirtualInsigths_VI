import { Button } from './components';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='min-h-screen w-screen'>
      <Button onClick={() => setCount(count + 1)} />
        <p>You clicked {count} times</p>
    </div>
  )
}

export default App
