import React, { useContext } from 'react';
import './App.css';
import { types, getSnapshot, applySnapshot, getParent } from 'mobx-state-tree';
import { observer } from 'mobx-react-lite';

const images = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/id/${i + 1}/200/200`,
  isSelected: false,
}));

const ImageModel = types
  .model('ImageModel', {
    isSelected: types.optional(types.boolean, false),
    id: types.identifierNumber,
    src: types.string,
  })

  .actions((self) => ({
    toggleSelect() {
      self.isSelected = !self.isSelected;

      const list = getParent(self, 2);
      list.setSelected(self);
    },
  }));

const ImagesListModel = types
  .model('ImagesListModel', {
    items: types.array(ImageModel),
    selected: types.maybe(types.reference(ImageModel)),
  })

  .actions((self) => ({
    setSelected(model) {
      self.selected = model;
    },
  }))

  .views((self) => ({
    get selectedCount() {
      return self.items.filter((i) => i.isSelected).length;
    },
  }));

const RootModel = types.model('RootModel', {
  images: ImagesListModel,
});

const rootModel = RootModel.create({
  images: {
    items: images,
  },
});

console.log(getSnapshot(rootModel));
// applySnapshot(rootModel, {
//   images: {
//     items: [],
//   },
// });

const MSTContext = React.createContext(rootModel);

function useImageListModel() {
  const Root = useContext(MSTContext);

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
    <li onClick={item.toggleSelect}>
      <Image item={item} />
      <Checkbox item={item} />
    </li>
  );
});

const SelectedTitle = observer(({ model }) => {
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

const List = () => {
  console.log('Render list');
  const imageListModel = useImageListModel();

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
};

export default function App() {
  return (
    <MSTContext.Provider value={rootModel}>
      <div className="App">
        <List />
      </div>
    </MSTContext.Provider>
  );
}
