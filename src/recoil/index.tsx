import { useCallback, useEffect, useState } from 'react';
interface Dissconnect {
  disconnect: () => void;
}

class Stateful<T> {
  // protected是受保护的，只有继承和自己的类可以访问
  // private是只有自己可以访问
  constructor(protected value: T) {};

  // 是一个 public 函数
  // class Set<T> {
  //    xxxx  
  // }
  // class Set<T> {}
  // new Set<T>()
  // new Set<(value: T) => void>();
  public listeners = new Set<(value: T) => void>();
  // function Set<T>(value: T): void{ }
  // new Set()
  // new Set(()=>{})
  
  // 添加订阅，订阅完可以取消订阅
  // 所以返回值应该是Dissconnect
  // public subscribe(): Dissconnect {}
  public subscribe(callback: (value: T) => void): Dissconnect {
    this.listeners.add(callback);
    return {
      disconnect: () => {
        this.listeners.delete(callback);
      },
    };
  };

  // 获取值
  public snapshot(): T {
    return this.value
  };

  // listener的更新
  public emit() {
    console.log('[ 状态更新 ]', Math.random());
    for (const listener of Array.from(this.listeners)) {
      // this.listeners 表示如下
      // 0: () => this.updateSelcrtor()
      // 1: () => updateState({})
      console.log(listener, 'listener..../////', this.listeners, 'this.listeners') // () => updateState({})
      listener(this.snapshot());
    }
  }

  // 派生类可以访问，更新值
  protected update(value: T) {
    if (this.value !== value) {
      this.value = value;
      this.emit();
    }
  }
}

class Atom<T> extends Stateful<T> {
  public setState(value: T) {
    super.update(value);
  }
}

// atom
// const textState = atom({
//   key: 'textState',
//   default: '默认测试',
// });
export function atom<V>(value: { key: string; default: V }) {
  // Atom实例
  return new Atom<V>(value.default);
}

// Selector
// ({ get }) => { const text = get(textState); return text.length+1111 }
class Selector<T> extends Stateful<T> {
  // private readonly
  constructor(private readonly generate: SelectorGenerator<T>) {
    super(undefined as any);
    this.value = generate({ get: (dep: Atom<any>) => this.addSub(dep) });
  }

  //维护的是Atom变化
  // ？？？？？new Set<Atom<any>>()
  private registeredDeps = new Set<Atom<any>>();
  private addSub(dep: Atom<any>) {
    if (!this.registeredDeps.has(dep)) {
      dep.subscribe(() => this.updateSelcrtor());
      this.registeredDeps.add(dep);
    }
    return dep.snapshot();
  }
  private updateSelcrtor() {
    this.update(this.generate({ get: (dep: Atom<any>) => this.addSub(dep) }));
  }
}

// ** selector内部get属性里面还有一个get方法
// ref:{s:a}:{s:number} = {s:1}
// const a = ref({s}) : Ref<{s:number}= {s:1}
type SelectorGenerator<V> = (context: { get: <T>(dep: Atom<T>) => T }) => V;
//  get: ({ get }) => { const text = get(textState); return text.length+1111 }});
// 参数context是一个对象，对象里面包含get属性  
// A = (context: {get: }) => v; 
// const charCountState = selector({
//   key: 'charCountState',
//   get: ({ get }) => {
//     const text = get(textState);
//     return text.length+1111;
//   },
// });
export function selector<V>(value: {
  key: string;
  // selector内部get取值
  get: SelectorGenerator<V>;
}) {
  // ({ get }) => { const text = get(textState); return text.length+1111 }
  return new Selector(value.get);
}

// 重点**
export function useRecoilValue<T>(value: Stateful<T>) {
  // react组件更新
  // 订阅一些事件 让组件跟着更新
  // 防止有些value改了，但是useRecoilValue返回最新的
  const [, updateState] = useState({});
  // ？？？？？ 
  useEffect(() => {
    const { disconnect } = value.subscribe(() => updateState({}));
    // 副作用原因！！
    return () => disconnect();
  }, [value]);
  return value.snapshot();
}

// const [text, setText] = useRecoilState(textState);
// const textState = atom({
//   key: 'textState',
//   default: '默认测试',
// });
export function useRecoilState<T>(atom: Atom<T>) {
  const value = useRecoilValue(atom);
  // 解构数组
  console.log(tuplify(
    value,
    useCallback((value: T) => atom.setState(value), [atom])
  ), 99);
  //0: "默认测试"
  //1: value => atom.setState(value)
  return tuplify(
    value,
    useCallback((value: T) => atom.setState(value), [atom])
  );
}

function tuplify<T extends unknown[]>(...elements: T) {
  return elements;
}
