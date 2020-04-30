import React, { useCallback } from 'react';
import './App.css';
import { observable, decorate, action, computed } from 'mobx';
import { observer } from 'mobx-react-lite';

const images = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/id/${i + 1}/200/200`,
  isSelected: false,
}));

class ImageModel {
  isSelected = false;

  constructor({ src, id }) {
    this.src = src;
    this.id = id;
  }

  toggleSelect() {
    this.isSelected = !this.isSelected;
  }
}

decorate(ImageModel, {
  isSelected: observable,
  toggleSelect: action,
});

class ImageListModel {
  items = [];

  constructor({ items }) {
    this.items = items;
  }

  get selectedCount() {
    return this.items.filter((i) => i.isSelected).length;
  }
}

decorate(ImageListModel, {
  items: observable,
  selectedCount: computed,
});

class RootModel {
  constructor() {
    this.images = new ImageListModel({
      items: images.map((item) => new ImageModel(item)),
    });
  }
}

const rootModel = new RootModel();

const MobxContext = React.createContext(null);

function useRootModel() {
  const Root = React.useContext(MobxContext);

  return Root;
}

function useImageListModel() {
  const Root = useRootModel();

  return Root.images;
}

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
      loading="lazy"
    />
  );
});

const ListItem = observer(({ item }) => {
  console.log(`Render list item ${item.id}`);

  return (
    <li onClick={() => item.toggleSelect()}>
      <Image item={item} />
      <Checkbox item={item} />
    </li>
  );
});

const SelectedTitle = observer(function SelectedTitle({ model }) {
  console.log('Render title');

  return <span>Selected: {model.selectedCount}</span>;
});

const Header = observer(({ model }) => {
  console.log('Render header');

  return (
    <header>
      <SelectedTitle model={model} />
    </header>
  );
});

const List = observer(() => {
  const imageListModel = useImageListModel();
  console.log('Render list');

  return (
    <>
      <Header model={imageListModel} />
      <ul>
        {imageListModel.items.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </ul>
    </>
  );
});

export default function App() {
  return (
    <MobxContext.Provider value={rootModel}>
      <div className="App">
        <List />
      </div>
    </MobxContext.Provider>
  );
}
