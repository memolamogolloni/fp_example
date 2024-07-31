interface Functor<T> {
  map<U>(f: (a: T) => U): Functor<U>;
}

interface Applicative<T> extends Functor<T> {
  of<U>(a: U): Applicative<U>;
  ap<U>(fab: Applicative<(a: T) => U>): Applicative<U>;
}

interface Monad<T> extends Applicative<T> {
  flatMap<U>(f: (a: T) => Monad<U>): Monad<U>;
}

interface Monoid<T> {
  empty(): T;
  concat(a: T, b: T): T;
}

class StringMonoid implements Monoid<string> {
  empty(): string {
    return '';
  }

  concat(a: string, b: string): string {
    return a + b;
  }
}

type Lens<S, A> = {
  get: (s: S) => A;
  set: (a: A, s: S) => S;
};

const lens = <S, A>(get: (s: S) => A, set: (a: A, s: S) => S): Lens<S, A> => ({
  get,
  set,
});

interface Foldable<T> {
  reduce<U>(f: (acc: U, value: T) => U, initial: U): U;
}

class List<T> implements Foldable<T> {
  constructor(private values: T[]) {}

  reduce<U>(f: (acc: U, value: T) => U, initial: U): U {
    return this.values.reduce(f, initial);
  }
}

interface Traversable<T> extends Functor<T> {
  traverse<U>(f: (a: T) => Applicative<U>): Applicative<Traversable<U>>;
}

class TraversableList<T> implements Traversable<T> {
  constructor(private values: T[]) {}

  map<U>(f: (a: T) => U): Traversable<U> {
    return new TraversableList(this.values.map(f));
  }

  traverse<U>(f: (a: T) => Applicative<U>): Applicative<Traversable<U>> {
    return this.values.reduce(
      (acc: Applicative<Traversable<U>>, value: T) =>
        acc.ap(
          f(value).map(
            (v: U) => (values: Traversable<U>) =>
              new TraversableList([...(values as unknown as U[]), v])
          ) as unknown as Applicative<
            (values: Traversable<U>) => Traversable<U>
          >
        ),
      Ok.of<Traversable<U>>(
        new TraversableList<U>([])
      ) as unknown as Applicative<Traversable<U>>
    );
  }
}

type Result<T, E> = Ok<T, E> | Err<T, E>;

class Ok<T, E> implements Monad<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  static of<U>(value: U): Ok<U, never> {
    return new Ok<U, never>(value);
  }

  map<U>(f: (value: T) => U): Ok<U, E> {
    return new Ok<U, E>(f(this.value));
  }

  ap<U>(fab: Applicative<(value: T) => U>): Applicative<U> {
    if (fab instanceof Ok) {
      return new Ok<U, E>((fab as Ok<(value: T) => U, E>).value(this.value));
    } else {
      return new Err<U, E>((fab as Err<unknown, E>).error);
    }
  }

  flatMap<U>(f: (value: T) => Monad<U>): Monad<U> {
    const result = f(this.value);
    if (result instanceof Ok) {
      return result;
    } else {
      return new Err<U, E>((result as Err<unknown, E>).error);
    }
  }

  of<U>(value: U): Ok<U, E> {
    return new Ok<U, E>(value);
  }
}

class Err<T, E> implements Monad<T> {
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  static of<U>(value: U): Ok<U, never> {
    return new Ok<U, never>(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<U>(_f: (value: T) => U): Err<U, E> {
    return new Err<U, E>(this.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ap<U>(_fab: Applicative<(value: T) => U>): Err<U, E> {
    return new Err<U, E>(this.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatMap<U>(_f: (value: T) => Monad<U>): Err<U, E> {
    return new Err<U, E>(this.error);
  }

  of<U>(value: U): Ok<U, E> {
    return new Ok<U, E>(value);
  }
}

interface Person {
  name: string;
  age: number;
}

const nameLens = lens(
  (person: Person) => person.name,
  (name: string, person: Person) => ({...person, name})
);

const okResult: Result<number, string> = new Ok(5);
const errResult: Result<number, string> = new Err('Something went wrong');

const functorExample = okResult.map(x => x + 1);
console.log(functorExample);

const applicativeFunction = Ok.of<(x: number) => number>(x => x + 1);
const applicativeExample = okResult.ap(applicativeFunction);
console.log(applicativeExample);

const monadExample = okResult.flatMap(x => new Ok(x + 1));
console.log(monadExample);

const monadErrorExample = errResult.flatMap(x => new Ok(x + 1));
console.log(monadErrorExample);

const stringMonoid = new StringMonoid();
const stringResult = stringMonoid.concat(
  'Hello',
  stringMonoid.concat(' World', stringMonoid.empty())
);
console.log(stringResult);

const person: Person = {name: 'John', age: 30};
const newPerson = nameLens.set('Johnny', person);
console.log(newPerson);

const numbers = new List([1, 2, 3, 4]);
const sum = numbers.reduce((acc, value) => acc + value, 0);
console.log(sum);

const traverseExample = new TraversableList([1, 2, 3]).traverse(x =>
  Ok.of(x + 1)
);
console.log(traverseExample);
