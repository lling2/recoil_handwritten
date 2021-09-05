import React, { FC, ChangeEvent } from 'react';
import { atom, selector, useRecoilValue, useRecoilState } from './recoil';

const textState = atom({
  key: 'textState',
  default: '默认测试',
});
const charCountState = selector({
  key: 'charCountState',
  get: ({ get }) => {
    const text = get(textState);
    return text.length+1111;
  },
});
const App: FC = () => {
  // const value = useRecoilValue(textState);
  const [text, setText] = useRecoilState(textState);
  const count = useRecoilValue(charCountState);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    //value 只有input元素
    setText(event.target.value);
  };

  return (
    <div className="App">
      <input type="text" value={text} onChange={onChange} />
      <br />
      Echo: {text}
      <hr />
      <h2>{count}</h2>
    </div>
  );
};

export default App;
