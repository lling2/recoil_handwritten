import { useCallback } from "react";

interface Dissconnect {
  dissconnect: () => void
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
    // 添加
    this.listeners.add(callback);

    // 取消
    return {
      dissconnect: () => {
        this.listeners.delete(callback)
      }
    }
  };

  // 获取值
  public snapshot(): T {
    return this.value
  };

  // listener的更新
  public emit() {
    // 将set类型转为数组
    for(const listener of Array.from(this.listeners)) {
      console.log(listener, 'listener..../////')
      listener(this.snapshot())
    }
  };

  // 派生类可以访问，更新值
  protected update(value: T) {
    if (this.value !== value) {
      this.value = value;
      this.emit();
    }
  }
}

// const textState = atom({
//   key: 'textState',
//   default: '默认测试',
// });
class Atom<T> extends Stateful<T> {
  public setState(value: T) {
    super.update(value);
  }
}

// useRecoilValue接受atom/selector 拿到值
export function useRecoilValue<T>(value: Stateful<T>) {
  return value.snapshot();
}

// V表示范型 Value
// export function atom<V>(value: { key: string; default: V }) {
//   return new Atom<V>(value.default);
// }
export function atom<V>(value: {
  key: string;
  default: V
}) {
  // console.log(new Atom<V>(value.default), 11111)
  // Atom {value: "recoil-handwritten", listeners: Set(0)} 11111
  return new Atom<V>(value.default)
}

// const [text, setText] = useRecoilState(textState);
// useRecoilState 可以修改值
export function useRecoilState<T>(atom: Atom<T>) {
  const value = useRecoilValue(atom);
  // ["recoil-handwritten", value => atom.setState(value)]
  return tuplify(
    value,
    // 谁去改变，atom.setState({})，利用useCallback去包裹，防止组件多次渲染
    // 比如：父组件有个子组件，只要父组件改变子组件就要改变
    useCallback((value: T) => atom.setState(value), [atom])
  );
}

type SelectorGenerator<V> = (context: { get: <T>(dep: Atom<T>) => T }) => V;

export function selector<V>(value: {
  key: string;
  //selector内部get取值
  get: SelectorGenerator<V>;
}) {
  return new Selector(value.get);
}
class Selector<T> extends Stateful<T> {
  constructor(private readonly generate: SelectorGenerator<T>) {
    super(undefined as any);
    this.value = generate({ get: (dep: Atom<any>) => this.addSub(dep) });
  }
  //维护的是Atom变化
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

function tuplify<T extends unknown[]>(...elements: T) {
  return elements;
}