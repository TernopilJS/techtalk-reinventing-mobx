import React, { useCallback } from 'react';
import './App.css';
import { createStore, combineReducers } from 'redux';
import { createAction, handleActions } from 'redux-actions';
import { Provider, useSelector, useDispatch } from 'react-redux';

const images = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/id/${i + 1}/200/200`,
  isSelected: false,
}));

const toggleSelect = createAction('toggleSelect');

const imagesReducer = handleActions(
  {
    [toggleSelect]: (state, { payload: { id } }) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            isSelected: !item.isSelected,
          };
        }

        return item;
      }),
    }),
  },
  {
    items: images,
  },
);

const store = createStore(
  combineReducers({
    images: imagesReducer,
  }),
);

const Checkbox = ({ item }) => {
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
};

const Image = React.memo(({ item }) => {
  console.log(`Image ${item.id}`);

  return (
    <img
      alt="Dog"
      className={item.isSelected ? 'isSelected' : ''}
      src={item.src}
      loading="lazy"
    />
  );
});

const ListItem = React.memo(({ item, onSelect }) => {
  console.log(`Render list item ${item.id}`);

  return (
    <li onClick={() => onSelect(item.id)}>
      <Image item={item} />
      <Checkbox item={item} />
    </li>
  );
});

const SelectedTitle = ({ count }) => {
  console.log('Render title');

  return <span>Selected: {count}</span>;
};

const Header = ({ count }) => {
  console.log('Render header');

  return (
    <header>
      <SelectedTitle count={count} />
    </header>
  );
};

const List = () => {
  console.log('Render list');
  const dispatch = useDispatch();
  const images = useSelector((state) => state.images.items);
  const selectedCount = useSelector(
    (state) => state.images.items.filter((i) => i.isSelected).length,
  );
  const onSelect = useCallback(
    (id) => {
      dispatch(toggleSelect({ id }));
    },
    [dispatch],
  );

  return (
    <>
      <Header count={selectedCount} />
      <ul>
        {images.map((item) => (
          <ListItem onSelect={onSelect} key={item.id} item={item} />
        ))}
      </ul>
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <List />
      </div>
    </Provider>
  );
}
