import { FC } from 'react';
import {
  atom, 
  useRecoilValue,
  useRecoilState,
  selector
} from './recoil';

// atom
const textState = atom({
  key: 'textState',
  default: 'recoil-handwritten',
});

// selector
const charCountState = selector({
  key: 'charCountState',
  get: ({ get }) => {
    const text = get(textState);
    return text.length;
  },
});

const App: FC = () => {
  const count = useRecoilValue(textState);
  const [text] = useRecoilState(textState);
  const count_selector = useRecoilValue(charCountState);
  return (
    <div className="App">
      {`【useRecoilValue】获取值：${count}`}
      <br/>
      {`【useRecoilState】获取值：${text}`}

      <br/>
      {`[selector]${count_selector}`}
    </div>
  );
}

export default App;
