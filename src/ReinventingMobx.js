import './App.css';
import React, { useState, useRef } from 'react';
// import { observable, autorun } from 'mobx';
// import { observer } from 'mobx-react-lite';

let accessedObservables = [];
const derivationGraph = {};

function observable(targetObject) {
  return new Proxy(targetObject, {
    get(obj, key) {
      accessedObservables.push(key);
      return obj[key];
    },

    set(obj, key, value) {
      obj[key] = value;

      derivationGraph[key].forEach((runner) => runner());

      return true;
    },
  });
}

function createReaction(onChange) {
  return {
    track: (trackFunction) => {
      accessedObservables = [];

      trackFunction();

      accessedObservables.forEach((key) => {
        derivationGraph[key] = derivationGraph[key] || [];

        derivationGraph[key].push(onChange);
      });
    },
  };
}

function autorun(runner) {
  const reaction = createReaction(runner);
  reaction.track(runner);
}

function observer(baseComponent) {
  const Wrapper = (props) => {
    const [, setState] = useState(0);
    const reaction = useRef(null);

    if (!reaction.current) {
      reaction.current = createReaction(() => setState((i) => i + 1));
    }

    let rendered;
    reaction.current.track(() => {
      rendered = baseComponent(props);
    });
    return rendered;
  };

  return Wrapper;
}

const image1 = observable({
  id: 1,
  src: 'https://picsum.photos/id/1/200/200',
  isSelected: false,
});
const image2 = observable({
  id: 2,
  src: 'https://picsum.photos/id/1/200/200',
  isSelected: false,
});
const image3 = observable({
  id: 3,
  src: 'https://picsum.photos/id/1/200/200',
  isSelected: false,
});

autorun(() => {
  console.log(image1.isSelected);
});

setTimeout(() => {
  image1.isSelected = true;
}, 1000);

const Checkbox = observer(({ item }) => {
  console.log(`Checkbox ${item.id}`);
  if (!item.isSelected) {
    return null;
  }

  return (
    <img
      className="checkbox-round"
      alt="alt"
      src="https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color-round-1/254000/42-512.png"
    />
  );
});

const Image = observer(({ item }) => {
  console.log(`Image ${item.id}`);

  return (
    <img
      alt="Dog"
      className={item.isSelected ? 'isSelected' : ''}
      src={item.src}
    />
  );
});

const ListItem = observer(({ item }) => {
  console.log(`Render list item ${item.id}`);

  function toggleSelect() {
    item.isSelected = !item.isSelected;
  }

  return (
    <li onClick={toggleSelect}>
      <Image item={item} />
      <Checkbox item={item} />
    </li>
  );
});

export default function App() {
  return (
    <div className="App">
      <ul>
        <ListItem item={image1} />
        <ListItem item={image2} />
        <ListItem item={image3} />
      </ul>
    </div>
  );
}
