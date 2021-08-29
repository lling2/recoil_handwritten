import {FC} from 'react';
import { atom, useRecoilValue } from './recoil';

// atom
const textState = atom({
  key: 'textState',
  default: 'recoil-handwritten',
});

const App:FC = () => {
  const count = useRecoilValue(textState);
  return (
    <div className="App">
      {count}
    </div>
  );
}

export default App;
