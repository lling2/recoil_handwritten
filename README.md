# 手写recoil思路

## 基本了解Recoil
### 基本api 可以参考官网https://www.recoiljs.cn/
* Atom
> Atom 是状态的单位。它们可更新也可订阅：当 atom 被更新，每个被订阅的组件都将使用新值进行重渲染。它们也可以在运行时创建。可以使用 atom 替代组件内部的 state。如果多个组件使用相同的 atom，则这些组件共享 atom 的状态。
```
const fontSizeState = atom({
  key: 'fontSizeState',
  default: 14,
})
function FontButton() {
  const [fontSize, setFontSize] = useRecoilState(fontSizeState);
  return (
    <button onClick={() => setFontSize((size) => size + 1)} style={{fontSize}}>
      Click to Enlarge
    </button>
  );
}
```
* Selector
> selector 是一个纯函数，入参为 atom 或者其他 selector。当上游 atom 或 selector 更新时，将重新执行 selector 函数。组件可以像 atom 一样订阅 selector，当 selector 发生变化时，重新渲染相关组件。

> Selector 被用于计算基于 state 的派生数据。这使得我们避免了冗余 state，通常无需使用 reduce 来保持状态同步性和有效性。作为替代，将最小粒度的状态存储在 atom 中，而其它所有内容根据最小粒度的状态进行有效计算。由于 selector 会追踪需要哪些组件使用了相关的状态，因此它们使这种方式更加有效。
从组件的角度来看，selector 和 atom 具有相同的功能，因此可以交替使用。

```
const fontSizeLabelState = selector({
  key: 'fontSizeLabelState',
  get: ({get}) => {
    const fontSize = get(fontSizeState);
    const unit = 'px';

    return `${fontSize}${unit}`;
  },
});
```
### 使用
```
// 基本api【useRecoilValue】使用
const textState = atom({
  key: 'textState',
  default: '默认测试',
});
const App: FC = () => {
  const count = useRecoilValue(textState);
  return (
    <div>
      {count}
    </div>
  )
}
```

## 首先写观察者模式
* 1. 添加订阅，订阅之后取消
* 2. 获取值
* 3. listener更新
* 4. 派生类可以访问值
```

