interface Dissconnect {
  dissconnect: () => void
}

class Stateful<T> {
  // protected是受保护的，只有继承和自己的类可以访问
  constructor(protected value: T) {};

  // 是一个函数
  public listeners = new Set<(value: T) => void>();
  
  // 添加订阅，订阅完可以取消订阅
  // 所以返回值应该是Dissconnect
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
    for(const listener of Array.from(this.listeners)) {
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
// const textState = atom({
//   key: 'textState',
//   default: '默认测试',
// });
export function atom<V>(value: {
  key: string;
  default: V
}) {
  return new Atom<V>(value.default)
}

