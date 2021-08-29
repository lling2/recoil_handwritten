import {FC} from 'react';
import { atom, useRecoilValue, useRecoilState } from './recoil';

// atom
const textState = atom({
  key: 'textState',
  default: 'recoil-handwritten',
});

const App:FC = () => {
  const count = useRecoilValue(textState);
  const [text] = useRecoilState(textState);
  return (
    <div className="App">
      {`【useRecoilValue】获取值：${count}`}
      <br/>
      {`【useRecoilState】获取值：${text}`}
    </div>
  );
}

export default App;
