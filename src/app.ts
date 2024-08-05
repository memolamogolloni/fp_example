import {Monoid, lens, Result, Ok, Err, List, TraversableList} from './fp-lib';

const demoFunctorExample = () => {
  const okResult: Result<number, string> = new Ok(5);
  const functorExample = okResult.map(x => x + 1);
  console.log('Functor Example:', functorExample);
};

const demoApplicativeExample = () => {
  const okResult: Result<number, string> = new Ok(5);
  const applicativeFunction = Ok.of<(x: number) => number>(x => x + 1);
  const applicativeExample = okResult.ap(applicativeFunction);
  console.log('Applicative Example:', applicativeExample);
};

const demoMonadExample = () => {
  const okResult: Result<number, string> = new Ok(5);
  const monadExample = okResult.flatMap(x => new Ok(x + 1));
  console.log('Monad Example:', monadExample);

  const errResult: Result<number, string> = new Err('Something went wrong');
  const monadErrorExample = errResult.flatMap(x => new Ok(x + 1));
  console.log('Monad Error Example:', monadErrorExample);
};

const demoStringMonoidExample = () => {
  class StringMonoid implements Monoid<string> {
    empty(): string {
      return '';
    }

    concat(a: string, b: string): string {
      return a + b;
    }
  }

  const stringMonoid = new StringMonoid();
  const stringResult = stringMonoid.concat(
    'Hello',
    stringMonoid.concat(' World', stringMonoid.empty())
  );
  console.log('String Monoid Example:', stringResult);
};

const demoFoldableExample = () => {
  const numbers = new List([1, 2, 3, 4]);
  const sum = numbers.reduce((acc, value) => acc + value, 0);
  console.log('Foldable Example:', sum);
};

const demoTraversableExample = () => {
  const traverseExample = new TraversableList([1, 2, 3]).traverse(x =>
    Ok.of(x + 1)
  );
  console.log('Traversable Example:', traverseExample);
};

const demoLensExample = () => {
  class Person {
    name: string;
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }

  const nameLens = lens(
    (person: Person) => person.name,
    (name: string, person: Person) => ({...person, name})
  );

  const person = new Person('John', 30);
  const previousName = nameLens.get(person);
  const newPerson = nameLens.set(previousName.concat('y'), person);
  console.log('Lens Example:', newPerson);
};

demoFunctorExample();
demoApplicativeExample();
demoMonadExample();
demoStringMonoidExample();
demoFoldableExample();
demoTraversableExample();
demoLensExample();
